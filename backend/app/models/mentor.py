import uuid
from sqlalchemy import Column, String, Boolean, Integer, JSON
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Mentor(Base):
    __tablename__ = "mentors"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    timezone = Column(String)  # IANA timezone identifier
    is_active = Column(Boolean, default=True)
    skills = Column(JSON)  # List of subjects this mentor can teach
    max_daily_classes = Column(Integer, default=2)
