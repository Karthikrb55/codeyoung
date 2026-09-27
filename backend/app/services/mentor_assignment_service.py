from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from app.models.mentor import Mentor
from app.models.booking import Booking
from app.core.config import settings
from app.core.timezone import get_local_date
import json

class MentorAssignmentError(Exception):
    pass

def assign_mentor(db: Session, start_time_utc: datetime, end_time_utc: datetime, subject: str) -> Mentor:
    # Get all active mentors matching subject
    mentors = db.query(Mentor).filter(Mentor.is_active == True).all()
    qualified_mentors = [m for m in mentors if m.skills and subject in (m.skills if isinstance(m.skills, list) else json.loads(m.skills))]

    # Get all upcoming bookings for these mentors
    utc_start_bound = start_time_utc - timedelta(days=2)
    utc_end_bound = start_time_utc + timedelta(days=2)
    
    bookings = db.query(Booking).filter(
        Booking.status == "CONFIRMED",
        Booking.start_time_utc >= utc_start_bound,
        Booking.end_time_utc <= utc_end_bound
    ).all()

    mentor_bookings = {m.id: [] for m in qualified_mentors}
    for b in bookings:
        if b.mentor_id in mentor_bookings:
            mentor_bookings[b.mentor_id].append(b)

    eligible_mentors = []

    for mentor in qualified_mentors:
        mentor_tz = ZoneInfo(mentor.timezone)
        
        # Check working hours
        slot_start_mentor = start_time_utc.astimezone(mentor_tz)
        slot_end_mentor = end_time_utc.astimezone(mentor_tz)
        
        if slot_start_mentor.date() != slot_end_mentor.date():
            continue
            
        if slot_start_mentor.hour < settings.MENTOR_WORKING_HOURS_START:
            continue
        if slot_end_mentor.hour > settings.MENTOR_WORKING_HOURS_END or (slot_end_mentor.hour == settings.MENTOR_WORKING_HOURS_END and slot_end_mentor.minute > 0):
            continue
            
        # Check daily limit
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
            b_start = b.start_time_utc.replace(tzinfo=ZoneInfo("UTC")) if b.start_time_utc.tzinfo is None else b.start_time_utc
            b_end = b.end_time_utc.replace(tzinfo=ZoneInfo("UTC")) if b.end_time_utc.tzinfo is None else b.end_time_utc
            
            if (start_time_utc < b_end) and (end_time_utc > b_start):
                overlap = True
                break
                
        if not overlap:
            eligible_mentors.append((mentor, daily_count))

    if not eligible_mentors:
        raise MentorAssignmentError("No mentors are available for this time.")

    # Sort by fewest daily bookings, then by stable ID (to ensure determinism and fair load balancing)
    eligible_mentors.sort(key=lambda x: (x[1], x[0].id))
    
    return eligible_mentors[0][0]
