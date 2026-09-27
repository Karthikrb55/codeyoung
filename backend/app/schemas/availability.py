from pydantic import BaseModel
from typing import List
import datetime

class Slot(BaseModel):
    start: datetime.datetime
    end: datetime.datetime
    displayTime: str
    available: bool

class AvailabilityResponse(BaseModel):
    date: str
    timezone: str
    slots: List[Slot]
