from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.mentor import Mentor
from app.schemas.mentor import MentorBase

router = APIRouter()

@router.get("", response_model=List[MentorBase])
def get_mentors(db: Session = Depends(get_db)):
    return db.query(Mentor).all()
