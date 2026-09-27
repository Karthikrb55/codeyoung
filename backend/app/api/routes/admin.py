from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.mentor import Mentor
from app.models.booking import Booking
import datetime
from sqlalchemy import func

router = APIRouter()

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_mentors = db.query(Mentor).count()
    active_mentors = db.query(Mentor).filter(Mentor.is_active == True).count()
    total_bookings = db.query(Booking).count()
    
    # Just a simple proxy for today's bookings (in UTC)
    today = datetime.datetime.now(datetime.timezone.utc).date()
    start_of_day = datetime.datetime.combine(today, datetime.time.min)
    end_of_day = start_of_day + datetime.timedelta(days=1)
    
    todays_bookings = db.query(Booking).filter(
        Booking.start_time_utc >= start_of_day,
        Booking.start_time_utc < end_of_day
    ).count()

    return {
        "total_mentors": total_mentors,
        "active_mentors": active_mentors,
        "total_bookings": total_bookings,
        "todays_bookings": todays_bookings
    }
