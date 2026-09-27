# AI Development Transcript & Strategy

This document outlines the strategic prompts and iterative development approach used to guide the AI coding agent (Google Antigravity) in building the TrialFlow platform.

## Phase 1: Architectural Planning (No Code)
**Prompt Intent:** Prevent the AI from rushing into a superficial CRUD app by forcing it to act as a Software Architect first.
* **Key Directives:** "Do NOT write implementation code yet.", "Produce Architecture diagram, Database schema, REST API contract, Timezone strategy, Mentor assignment algorithm."
* **Result:** The AI established that standard ISO 8601 strings and naive UTC storage were mandatory. It recognized that mentor limits must be calculated in the *mentor's local timezone*, preventing cross-calendar edge cases.

## Phase 2: Backend Implementation & QA
**Prompt Intent:** Build the foundation and attack it immediately with integration tests.
* **Key Directives:** "Implement the FastAPI backend first.", "Act as a senior QA engineer.", "Attack the booking engine. Create tests for DST transitions, cross-timezone boundaries, and overlapping slots."
* **Result:** The AI generated a comprehensive Pytest suite. A critical concurrency decision was made to use SQLite's `BEGIN EXCLUSIVE` transaction locking to strictly prevent race conditions on the same timeslot.

## Phase 3: Frontend Integration
**Prompt Intent:** Build a premium UX communicating directly with the verified backend API.
* **Key Directives:** "Do not create fake/mock availability.", "Make it look like a serious EdTech SaaS product.", "UX priorities: local timezone must always be visible, prevent duplicate submissions."
* **Result:** Developed the React application. During integration, a major JavaScript date parsing bug was identified: `new Date("2026-10-10")` defaults to UTC midnight, causing offset bugs in the Americas. The AI fixed this by forcing midday parsing `new Date("2026-10-10T12:00:00")`.

## Phase 4: Timezone/DST Audit & Recruiter Review
**Prompt Intent:** Ensure the core domain complexity is flawless.
* **Key Directives:** "Perform a dedicated timezone and DST audit.", "Verify no timezone offset is hardcoded.", "Act as a skeptical senior engineer evaluating this assignment."
* **Result:** Verified strictly zero manual offset math (`timedelta(hours=...)`) was used. Everything relies purely on Python's `zoneinfo` IANA timezone database.

## Phase 5: Production Email & Security Audit
**Prompt Intent:** Transition from console mocks to real, production-ready email infrastructure.
* **Key Directives:** "Implement real SMTP.", "Email failure must not break the booking transaction.", "Ensure no passwords are leaked in git."
* **Result:** Integrated `smtplib` using Google App Passwords. Secured the environment via `.gitignore` and `.env.example`. Wrapped email dispatch in strict exception handlers to ensure 100% booking success rate even if Google's SMTP drops a packet.

## Phase 5: Final UI Polish & Release
**Prompt Intent:** Elevate the frontend from "functional" to "premium".
* **Key Directives:** "Improve visual hierarchy, selected slot state, empty states, and loading states.", "Verify every command against the actual project."
* **Result:** Implemented a two-step "Select-then-Confirm" pattern for time slots to prevent accidental click bookings. Added skeleton loaders and polished empty state designs. Overhauled the `README.md` for maximum recruiter readability.

## Conclusion
By guiding the AI through strict architectural boundaries, enforcing test-driven QA before frontend work, and maintaining a relentless focus on timezone accuracy, the resulting application is a highly maintainable, production-ready scheduling engine.
