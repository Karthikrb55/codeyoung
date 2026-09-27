import json
from app.core.database import SessionLocal, engine, Base
from app.models.mentor import Mentor
from app.models.booking import Booking

# 10 fictional mentors
MENTORS_DATA = [
    {"name": "Aarav Sharma", "email": "aarav@example.com", "timezone": "Asia/Kolkata", "skills": ["Coding", "Python", "Math"], "max_daily_classes": 2},
    {"name": "Priya Nair", "email": "priya@example.com", "timezone": "Asia/Kolkata", "skills": ["Coding", "Scratch", "Web Development"], "max_daily_classes": 2},
    {"name": "Rahul Mehta", "email": "rahul@example.com", "timezone": "Asia/Kolkata", "skills": ["Math", "AI"], "max_daily_classes": 2},
    {"name": "Ananya Rao", "email": "ananya@example.com", "timezone": "Asia/Kolkata", "skills": ["Coding", "Python", "AI"], "max_daily_classes": 2},
    {"name": "Vikram Iyer", "email": "vikram@example.com", "timezone": "Asia/Kolkata", "skills": ["Math", "Web Development"], "max_daily_classes": 2},
    {"name": "Neha Kapoor", "email": "neha@example.com", "timezone": "Asia/Kolkata", "skills": ["Coding", "Scratch"], "max_daily_classes": 2},
    {"name": "Arjun Menon", "email": "arjun@example.com", "timezone": "Asia/Kolkata", "skills": ["Math", "Python"], "max_daily_classes": 2},
    {"name": "Sneha Das", "email": "sneha@example.com", "timezone": "Asia/Kolkata", "skills": ["Coding", "AI"], "max_daily_classes": 2},
    {"name": "Rohan Gupta", "email": "rohan@example.com", "timezone": "Asia/Kolkata", "skills": ["Web Development", "AI"], "max_daily_classes": 2},
    {"name": "Kavya Shah", "email": "kavya@example.com", "timezone": "Asia/Kolkata", "skills": ["Coding", "Math"], "max_daily_classes": 2},
]

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(Mentor).count() > 0:
        print("Database already seeded.")
        return

    for m_data in MENTORS_DATA:
        m = Mentor(
            name=m_data["name"],
            email=m_data["email"],
            timezone=m_data["timezone"],
            skills=json.dumps(m_data["skills"]),
            max_daily_classes=m_data["max_daily_classes"]
        )
        db.add(m)
    
    db.commit()
    print("Seeded mentors successfully.")
    db.close()

if __name__ == "__main__":
    seed_db()
