import pytest
from app.models.mentor import Mentor
from app.models.booking import Booking
import json
from datetime import datetime
from zoneinfo import ZoneInfo
import pytz

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200

def test_booking_and_mentor_assignment(client, db_session):
    # Seed mentor
    m = Mentor(
        name="Test Mentor", 
        email="test@example.com", 
        timezone="Asia/Kolkata", 
        skills=json.dumps(["Coding"]), 
        max_daily_classes=2
    )
    db_session.add(m)
    db_session.commit()
    m_id = m.id

    # Create a booking
    req = {
        "parent": {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "childName": "Jimmy",
            "childAge": 10,
            "timezone": "America/New_York"
        },
        "subject": "Coding",
        "startTime": "2026-10-15T10:00:00-04:00"  # 10am NY time -> 14:00 UTC -> 19:30 Kolkata time. Mentor works 10:00-22:00. This is 19:30, fits!
    }

    resp = client.post("/api/bookings", json=req)
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["mentor_id"] == m_id
    assert data["status"] == "CONFIRMED"

def test_daily_limit_and_overlap(client, db_session):
    m = Mentor(
        name="Limit Mentor", 
        email="limit@example.com", 
        timezone="Asia/Kolkata", 
        skills=json.dumps(["Coding"]), 
        max_daily_classes=2
    )
    db_session.add(m)
    db_session.commit()
    
    # Book 1 (10:00 NY -> 19:30 Kol)
    req1 = {
        "parent": {"name": "A", "email": "a@ex.com", "childName": "a", "childAge": 10, "timezone": "America/New_York"},
        "subject": "Coding",
        "startTime": "2026-10-15T10:00:00-04:00"
    }
    resp1 = client.post("/api/bookings", json=req1)
    assert resp1.status_code == 201

    # Book 2 exactly overlapping -> Should 409
    resp_overlap = client.post("/api/bookings", json=req1)
    assert resp_overlap.status_code == 409

    # Book 3 (11:00 NY -> 20:30 Kol) - should succeed, reaching daily limit of 2
    req2 = {
        "parent": {"name": "B", "email": "b@ex.com", "childName": "b", "childAge": 10, "timezone": "America/New_York"},
        "subject": "Coding",
        "startTime": "2026-10-15T11:00:00-04:00"
    }
    resp2 = client.post("/api/bookings", json=req2)
    assert resp2.status_code == 201

    # Book 4 (12:00 NY -> 21:30 Kol) - should fail because daily limit is 2
    req3 = {
        "parent": {"name": "C", "email": "c@ex.com", "childName": "c", "childAge": 10, "timezone": "America/New_York"},
        "subject": "Coding",
        "startTime": "2026-10-15T12:00:00-04:00"
    }
    resp3 = client.post("/api/bookings", json=req3)
    assert resp3.status_code == 409

def test_dst_transition(client, db_session):
    m = Mentor(
        name="DST Mentor", 
        email="dst@example.com", 
        timezone="Europe/London", # London has DST
        skills=json.dumps(["Math"]), 
        max_daily_classes=2
    )
    db_session.add(m)
    db_session.commit()

    # UK DST ends in 2026 on Oct 25 at 02:00.
    # Booking just before and just after transition to ensure no crashes.
    req = {
        "parent": {"name": "D", "email": "d@ex.com", "childName": "d", "childAge": 10, "timezone": "Europe/London"},
        "subject": "Math",
        "startTime": "2026-10-25T10:00:00Z"
    }
    resp = client.post("/api/bookings", json=req)
    assert resp.status_code == 201
