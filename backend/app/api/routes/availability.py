from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.availability import AvailabilityResponse
from app.services.availability_service import get_available_slots

router = APIRouter()

@router.get("", response_model=AvailabilityResponse)
def check_availability(
    date: str = Query(..., description="YYYY-MM-DD in parent timezone"),
    timezone: str = Query(..., description="IANA timezone"),
    subject: str = Query(...)
    , db: Session = Depends(get_db)
):
    slots = get_available_slots(db, date, timezone, subject)
    return AvailabilityResponse(date=date, timezone=timezone, slots=slots)
