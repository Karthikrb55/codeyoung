from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.booking import Booking
from app.schemas.booking import BookingCreate
from app.core.config import settings
from app.core.timezone import to_utc
from app.services.mentor_assignment_service import assign_mentor, MentorAssignmentError
from app.services.notification_service import NotificationService
import uuid

def create_booking(db: Session, booking_in: BookingCreate) -> Booking:
    # Validate timezone
    try:
        ZoneInfo(booking_in.parent.timezone)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid timezone")

    # The startTime provided by frontend must be aware, or naive but meant in the parent's timezone
    # Best practice is frontend sends ISO strings like "2026-10-05T10:00:00-04:00" which parse into aware datetime
    start_time_utc = booking_in.startTime.astimezone(ZoneInfo("UTC"))
    end_time_utc = start_time_utc + timedelta(minutes=settings.TRIAL_DURATION_MINUTES)

    if start_time_utc < datetime.now(ZoneInfo("UTC")):
        raise HTTPException(status_code=400, detail="Cannot book in the past")

    # Atomic transaction
    from sqlalchemy import text
    try:
        if db.bind.dialect.name == "sqlite":
            db.execute(text("BEGIN EXCLUSIVE"))
        
        # Find eligible mentor
        mentor = assign_mentor(db, start_time_utc, end_time_utc, booking_in.subject)
        
        booking_id = str(uuid.uuid4())
        meeting_url = f"http://localhost:5173/class/{booking_id}"
        
        db_booking = Booking(
            id=booking_id,
            mentor_id=mentor.id,
            parent_name=booking_in.parent.name,
            parent_email=booking_in.parent.email,
            child_name=booking_in.parent.childName,
            child_age=booking_in.parent.childAge,
            subject=booking_in.subject,
            start_time_utc=start_time_utc.replace(tzinfo=None), # SQLite naive storage in UTC
            end_time_utc=end_time_utc.replace(tzinfo=None),
            parent_timezone=booking_in.parent.timezone,
            mentor_timezone=mentor.timezone,
            status="CONFIRMED",
            meeting_url=meeting_url
        )
        
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
        
        # Notifications
        NotificationService.send_parent_confirmation(db, db_booking)
        NotificationService.send_mentor_confirmation(db, db_booking)
        db.commit()
        
        return db_booking
        
    except MentorAssignmentError as e:
        db.rollback()
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")
