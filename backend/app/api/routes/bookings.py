from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import create_booking
from app.models.booking import Booking
import pytz

router = APIRouter()

@router.post("", response_model=BookingResponse, status_code=201)
def book_trial(booking_in: BookingCreate, db: Session = Depends(get_db)):
    db_booking = create_booking(db, booking_in)
    
    # SQLite returns naive UTC datetime, we need to make it aware for Pydantic to serialize it nicely, or it serializes as naive
    # Actually BookingResponse will handle it, but to be sure:
    db_booking.start_time_utc = db_booking.start_time_utc.replace(tzinfo=pytz.UTC)
    db_booking.end_time_utc = db_booking.end_time_utc.replace(tzinfo=pytz.UTC)
    
    return db_booking

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.start_time_utc = booking.start_time_utc.replace(tzinfo=pytz.UTC)
    booking.end_time_utc = booking.end_time_utc.replace(tzinfo=pytz.UTC)
    return booking
