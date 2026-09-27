from pydantic import BaseModel, field_validator
from typing import List, Optional
import json

class MentorBase(BaseModel):
    id: str
    name: str
    email: str
    timezone: str
    is_active: bool
    skills: List[str]
    max_daily_classes: int

    @field_validator('skills', mode='before')
    @classmethod
    def parse_skills(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    model_config = {"from_attributes": True}
