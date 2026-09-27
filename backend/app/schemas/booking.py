from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import datetime

class ParentInfo(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    childName: str = Field(..., min_length=1)
    childAge: int = Field(..., ge=4, le=18)
    timezone: str = Field(..., min_length=1)

class BookingCreate(BaseModel):
    parent: ParentInfo
    subject: str = Field(..., min_length=1)
    startTime: datetime.datetime

class BookingResponse(BaseModel):
    id: str
    mentor_id: str
    parent_name: str
    parent_email: str
    child_name: str
    child_age: int
    subject: str
    start_time_utc: datetime.datetime
    end_time_utc: datetime.datetime
    parent_timezone: str
    mentor_timezone: str
    status: str
    meeting_url: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}
