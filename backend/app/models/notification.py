import uuid
import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    booking_id = Column(String, ForeignKey("bookings.id"))
    recipient_type = Column(String) # "PARENT" or "MENTOR"
    recipient_email = Column(String)
    content = Column(Text)
    sent_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    booking = relationship("Booking")
