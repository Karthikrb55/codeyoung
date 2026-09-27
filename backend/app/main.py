from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import availability, bookings, mentors, admin
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TrialFlow API", description="API for Trial Class Booking")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(availability.router, prefix="/api/availability", tags=["Availability"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(mentors.router, prefix="/api/mentors", tags=["Mentors"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
