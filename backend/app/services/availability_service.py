from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from app.models.mentor import Mentor
from app.models.booking import Booking
from app.core.config import settings
from app.core.timezone import to_local, get_local_date
import json

def get_available_slots(db: Session, date_str: str, timezone: str, subject: str):
    # Parse the requested date in the parent's timezone
    try:
        parent_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return []

    tz = ZoneInfo(timezone)
    
    # Generate candidate slots in 30-minute increments for the requested parent date
    candidate_slots = []
    start_of_day = datetime.combine(parent_date, datetime.min.time(), tzinfo=tz)
    
    # 48 slots of 30 minutes in a day
    for i in range(48):
        slot_start = start_of_day + timedelta(minutes=30 * i)
        slot_end = slot_start + timedelta(minutes=settings.TRIAL_DURATION_MINUTES)
        candidate_slots.append((slot_start, slot_end))
        
    # Get all active mentors matching subject
    # Assuming skills is a JSON array string or JSON column. SQLite handles JSON.
    mentors = db.query(Mentor).filter(Mentor.is_active == True).all()
    qualified_mentors = [m for m in mentors if m.skills and subject in (m.skills if isinstance(m.skills, list) else json.loads(m.skills))]

    # Get all upcoming bookings for these mentors to check overlap and limits
    # Fetching broadly since we don't know the exact UTC bounds without complex math,
    # but we can bound it loosely to parent_date +/- 2 days in UTC
    utc_start_bound = start_of_day.astimezone(ZoneInfo("UTC")) - timedelta(days=2)
    utc_end_bound = start_of_day.astimezone(ZoneInfo("UTC")) + timedelta(days=2)
    
    bookings = db.query(Booking).filter(
        Booking.status == "CONFIRMED",
        Booking.start_time_utc >= utc_start_bound,
        Booking.end_time_utc <= utc_end_bound
    ).all()

    # Pre-calculate bookings per mentor
    mentor_bookings = {m.id: [] for m in qualified_mentors}
    for b in bookings:
        if b.mentor_id in mentor_bookings:
            mentor_bookings[b.mentor_id].append(b)

    results = []
    
    # Now check each candidate slot
    for slot_start, slot_end in candidate_slots:
        # Convert to UTC for overlap checking
        slot_start_utc = slot_start.astimezone(ZoneInfo("UTC"))
        slot_end_utc = slot_end.astimezone(ZoneInfo("UTC"))
        
        # Is the slot in the past?
        if slot_start_utc < datetime.now(ZoneInfo("UTC")):
            continue
            
        is_available = False
        
        for mentor in qualified_mentors:
            mentor_tz = ZoneInfo(mentor.timezone)
            
            # Check working hours (10:00 to 22:00 in mentor's local time)
            slot_start_mentor = slot_start.astimezone(mentor_tz)
            slot_end_mentor = slot_end.astimezone(mentor_tz)
            
            # They must be on the same day in mentor's time for working hours to make sense easily
            # and within MENTOR_WORKING_HOURS_START and MENTOR_WORKING_HOURS_END
            if slot_start_mentor.date() != slot_end_mentor.date():
                continue # Spans midnight in mentor's time, not allowed
                
            if slot_start_mentor.hour < settings.MENTOR_WORKING_HOURS_START:
                continue
            if slot_end_mentor.hour > settings.MENTOR_WORKING_HOURS_END or (slot_end_mentor.hour == settings.MENTOR_WORKING_HOURS_END and slot_end_mentor.minute > 0):
                continue
                
            # Check daily limit for this mentor on slot_start_mentor.date()
            mentor_date = slot_start_mentor.date()
            daily_count = sum(
                1 for b in mentor_bookings[mentor.id]
                if get_local_date(b.start_time_utc, mentor.timezone) == mentor_date
            )
            if daily_count >= mentor.max_daily_classes:
                continue
                
            # Check overlap
            overlap = False
            for b in mentor_bookings[mentor.id]:
                # Ensure UTC tzinfo is present
                b_start = b.start_time_utc.replace(tzinfo=ZoneInfo("UTC")) if b.start_time_utc.tzinfo is None else b.start_time_utc
                b_end = b.end_time_utc.replace(tzinfo=ZoneInfo("UTC")) if b.end_time_utc.tzinfo is None else b.end_time_utc
                
                # Check intersection
                if (slot_start_utc < b_end) and (slot_end_utc > b_start):
                    overlap = True
                    break
                    
            if not overlap:
                is_available = True
                break # Found at least one mentor, slot is available!
                
        if is_available:
            # We want to format displayTime nicely, e.g., "10:00 AM"
            display_time = slot_start.strftime("%I:%M %p").lstrip("0")
            results.append({
                "start": slot_start_utc.isoformat(),
                "end": slot_end_utc.isoformat(),
                "displayTime": display_time,
                "available": True
            })
            
    return results
