import uuid
import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    mentor_id = Column(String, ForeignKey("mentors.id"))
    parent_name = Column(String)
    parent_email = Column(String)
    child_name = Column(String)
    child_age = Column(Integer)
    subject = Column(String)
    start_time_utc = Column(DateTime, index=True)
    end_time_utc = Column(DateTime, index=True)
    parent_timezone = Column(String)
    mentor_timezone = Column(String)
    status = Column(String, default="CONFIRMED")
    meeting_url = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    mentor = relationship("Mentor")
