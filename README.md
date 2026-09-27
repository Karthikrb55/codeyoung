# TrialFlow - International Trial Class Booking Platform

## 📖 Project Overview
TrialFlow is a production-minded appointment booking platform developed as a recruitment assignment for a Full-Stack Engineer role. It provides a polished, seamless experience for parents booking 1:1 live trial classes for their children, while dynamically matching them with global mentors.

## ⚠️ The Problem
Scheduling across international boundaries is notoriously difficult. A robust booking engine must solve:
1. **Timezone Mathematics**: Parents and mentors often exist on entirely different calendar dates at any given moment.
2. **Daylight Saving Time (DST)**: Hardcoded offsets fail when regions transition in and out of DST unpredictably.
3. **Concurrency**: Two parents attempting to book the same limited slot at the exact same millisecond.
4. **Mentor Utilization**: Enforcing a strict limit of 2 trial classes per mentor, *evaluated in the mentor's localized calendar day*.

## 💡 The Solution
TrialFlow approaches this by pushing all temporal complexity to strictly validated IANA timezones and leveraging Python's `zoneinfo` for native awareness. The database strictly stores naive UTC, while the availability engine calculates working hours, overlaps, and daily limits dynamically on the fly. A clean React frontend provides a guided, timezone-aware UX to prevent user error.

## ✨ Features
- **Timezone-Aware Booking Wizard**: Parents select their IANA timezone, and all available slots automatically adapt. 
- **Intelligent Mentor Assignment**: The system calculates the pool of qualified mentors, checks their localized daily limits, checks for overlapping bookings, and assigns the best match behind the scenes.
- **Strict Concurrency Protection**: Utilizing database transaction locks to prevent double-booking edge cases safely.
- **Premium UX**: Multi-step wizard, selected-state UI, skeleton loaders, and intuitive empty states designed to feel like a modern EdTech SaaS product.
- **Admin/Mentor Dashboards (Simulated)**: A read-only view proving that the scheduling algorithms mapped the bookings correctly to mentors.

## 📸 Screenshots
*(Note: As this is a coding assignment, actual screenshots are omitted, but the UI is designed with Shadcn and Tailwind CSS for a premium look.)*
- **Landing Page**: Polished hero section with distinct CTAs.
- **Booking Flow**: 3-step wizard with auto-detected timezone.
- **Confirmation Page**: Distinct success state showing parent local time vs. mentor local time.

## 🏗 Architecture
The application follows a strictly layered architecture:
- **Presentation (Frontend)**: React SPA communicating strictly via JSON REST APIs.
- **Routing (Backend `api/routes`)**: Maps HTTP requests to Pydantic schemas.
- **Service Layer (Backend `services/`)**: Houses 100% of the core business logic (Availability, Booking, Assignment) entirely decoupled from the HTTP context.
- **Data Access (Backend `models/`)**: SQLAlchemy ORM mapping to SQLite.

## 🛠 Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Shadcn UI, React Hook Form, Zod.
- **Backend**: Python 3.12, FastAPI, SQLAlchemy, Pydantic V2, Pytest.
- **Database**: SQLite (Chosen for zero-dependency portability for recruitment review).

## 📁 Project Structure
```text
.
├── backend/
│   ├── app/
│   │   ├── api/routes/       # FastAPI endpoints
│   │   ├── core/             # Config, DB setup, Timezone helpers
│   │   ├── models/           # SQLAlchemy DB Models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic (Availability, Booking)
│   │   ├── main.py           # Application entrypoint
│   │   └── seed.py           # Database seeder
│   └── tests/                # Comprehensive QA and Pytest suite
└── frontend/
    ├── src/
    │   ├── api/              # Axios client
    │   ├── components/       # Shadcn UI components
    │   ├── pages/            # View components (BookingFlow, Home, etc.)
    │   ├── App.tsx           # React Router setup
    │   └── main.tsx          # React entrypoint
    └── index.html            # Vite template
```

## 🚀 Setup & Installation

### Backend Setup
```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

### Database Setup & Seed Instructions
The backend uses SQLite (`trialflow.db`). To initialize the tables and seed the initial 10 fictional mentors:
```bash
cd backend
# Ensure virtual environment is active
python -m app.seed
```

### Running the Backend
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
*The API runs at `http://localhost:8000`. Interactive docs available at `http://localhost:8000/docs`.*

### Frontend Setup & Commands
```bash
cd frontend
npm install
npm run dev
```
*The web application runs at `http://localhost:5173`.*

To build for production:
```bash
npm run build
```

## 🧪 Testing
The backend features an aggressive, domain-driven QA suite that tests DST transitions, cross-timezone calendar limits, concurrency limits, and 409 Conflict handling.

```bash
cd backend
python -m pytest tests/ -v
```

## 📚 API Documentation
When the backend is running, visit `http://localhost:8000/docs` for the interactive Swagger UI.
Key endpoints:
- `GET /api/availability`: Computes available 30-min slots based on date, timezone, and subject.
- `POST /api/bookings`: Creates a booking, executes mentor assignment, and handles concurrency constraints.
- `GET /api/mentors`: Lists available mentors and their metadata.

## 🕰 Timezone & DST Strategy
- **Storage**: All temporal data is stored in the database as naive UTC strings.
- **Processing**: The backend strictly uses Python's `zoneinfo` module. We NEVER use hardcoded offsets (e.g., `UTC-4`). 
- **DST Strategy**: By relying on the IANA database (`America/New_York`), calculations natively respect Spring Forward / Fall Back shifts.
- **Frontend**: The React app detects the user's browser timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone` as a smart default, but allows manual override. Dates are parsed safely by explicitly injecting localized mid-day time bounds to prevent JavaScript from assuming UTC midnight.

## 🧠 Mentor Assignment Algorithm
1. **Filter**: Identify mentors who are active and possess the required subject skill.
2. **Bounds**: Convert the requested UTC slot into the mentor's local timezone.
3. **Working Hours**: Ensure the slot falls within 10:00 to 22:00 in the mentor's local time.
4. **Daily Limits**: Count existing bookings for that mentor *on that specific localized calendar day*. If >= 2, reject.
5. **Overlap**: Check for intersecting `start_time` and `end_time` boundaries in UTC.
6. **Assign**: The first mentor passing all conditions is assigned.

## 📧 Email & Notifications Strategy
- **Real SMTP Integration**: Upon successful assignment and database insertion, real confirmation emails are triggered to both the Parent and the Mentor using standard `smtplib` via an App Password.
- **Resiliency**: The email dispatch is wrapped in a `try/except` block, ensuring that an upstream SMTP failure (like rate limits or timeouts) **never breaks the core booking transaction**. The parent still gets their class, and the error is logged gracefully.
- **Security**: All SMTP credentials are strictly loaded via `pydantic-settings` from an untracked `.env` file, ensuring zero credential leakage in source control.

## ⚡ Concurrency Strategy
SQLite does not support row-level locking (`SELECT ... FOR UPDATE`). To safely prevent double-booking in a local environment, the `BookingService` wraps the entire assignment and insertion logic in a `BEGIN EXCLUSIVE` transaction block. 
If two requests arrive simultaneously, SQLite serializes them. The first request succeeds. The second request evaluates the availability *after* the first finishes, finds the mentor is full, and gracefully returns a `409 Conflict`.

## 📌 Assumptions
- Trial classes are strictly 30 minutes.
- Mentor working hours are universally 10:00 AM to 10:00 PM local time.
- All mentors operate 7 days a week for the purpose of this recruitment demo.

## 🛑 Edge Cases Addressed
- **Cross-Calendar Limits**: A parent booking at 11:00 PM Monday in New York consumes the mentor's Tuesday quota in India.
- **Non-existent Local Times**: Attempting to book during a "Spring Forward" skipped hour is gracefully caught by `zoneinfo`.
- **Form Validation**: Strict boundaries on child age (4-18) enforced identically on frontend and backend schemas.

## 📐 Design Decisions & Limitations
- **Decision: SQLite**: Chosen specifically for this assignment to ensure reviewers can clone and run the project in seconds without provisioning Docker/PostgreSQL. 
- **Limitation: Scalability**: The `BEGIN EXCLUSIVE` lock is a global database lock. It is perfectly safe but will heavily bottleneck under extreme concurrency.
- **Limitation: Mentor Authentication**: Mentors currently do not have a real authentication system; their dashboard is simulated for demonstration purposes.

## 🔮 Future Improvements
1. **Migration to PostgreSQL**: Replace SQLite and utilize row-level locking or `EXCLUDE USING gist` constraints to prevent overlaps at the schema level without global locks.
2. **Caching**: Cache `GET /api/availability` with Redis, invalidating cache keys when a booking is confirmed.
3. **Pagination**: Add cursor-based pagination to the `/api/mentors` and `/api/bookings` endpoints as the dataset grows.

## 🤖 AI-Assisted Development
This project was implemented with the assistance of an advanced AI coding agent (Antigravity). The AI was explicitly directed via structured prompt engineering to act as a Senior Architect, QA Engineer, and Release Manager. 
Key directives used:
- Forced sequential architecture planning before writing any code.
- Strict test-driven verification of edge cases (Timezone/DST).
- Rigorous UI/UX audits to ensure a premium, non-superficial frontend.
- Iterative local testing and build verification to guarantee a pristine reviewer experience.
