from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from datetime import datetime
import pytz

def is_valid_timezone(tz_name: str) -> bool:
    try:
        ZoneInfo(tz_name)
        return True
    except ZoneInfoNotFoundError:
        return False

def to_utc(dt: datetime, tz_name: str) -> datetime:
    """Convert a naive datetime in a given timezone to a UTC aware datetime, or localize aware datetime to UTC."""
    if dt.tzinfo is None:
        tz = ZoneInfo(tz_name)
        dt = dt.replace(tzinfo=tz)
    return dt.astimezone(ZoneInfo("UTC"))

def to_local(dt: datetime, tz_name: str) -> datetime:
    """Convert UTC aware datetime to local timezone aware datetime."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))
    return dt.astimezone(ZoneInfo(tz_name))

def get_local_date(dt: datetime, tz_name: str) -> datetime.date:
    """Get the local calendar date for a given UTC datetime in a given timezone."""
    local_dt = to_local(dt, tz_name)
    return local_dt.date()
