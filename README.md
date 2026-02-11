# façade

Build and run AI-native influencer personas with an opinionated control room.

`façade` is a full-stack system for creating virtual creators, planning content, reshaping character arcs, and managing sponsor relationships from one dashboard.

## Why This Feels Different

Most influencer tools optimize for posting.
`façade` optimizes for narrative continuity.

- Create creators with an identity, tone, audience, and goals.
- Keep a living life story as a first-class state object.
- Schedule content with timeline and calendar views.
- Trigger **Divine Intervention** to rewrite a creator's story, clear future content, and regenerate the plan.
- Manage sponsor records and attach sponsored context to content workflows.

## Current Stack

- Frontend: Next.js 15 + React 19 + Tailwind CSS
- Backend: FastAPI + SQLAlchemy + APScheduler
- Database: SQLite (`backend/storage/accounts.db`)
- AI: Google Gemini client (`google-genai`)
- Media/imagery: Pillow-based generation pipeline

## Architecture Snapshot

1. `frontend` collects onboarding data and control actions.
2. API proxy routes (`/api/backend/*`) forward requests to FastAPI.
3. `backend/app.py` orchestrates influencer CRUD, scheduling, sponsors, and life-story operations.
4. Background tasks regenerate plans and maintain posting cadence.
5. Local storage persists records, schedules, and generated assets.

## Key Flows In This Branch

- **Influencer detail upgrade**
  - Timeline + calendar browsing in a single profile view.
  - Local fallback handling when backend is unavailable.

- **Divine Intervention**
  - Endpoint: `POST /influencer/{influencer_id}/divine-intervention`
  - Rewrites life story with intensity (`subtle`, `moderate`, `major`).
  - Clears future schedules and regenerates upcoming content.

- **Sponsor Studio**
  - UI page for browsing/adding sponsors and searching by name/industry.
  - Backend endpoints for sponsor create/list/match and video sponsor assignment.

## Repo Layout

```text
.
├── backend
│   ├── app.py
│   ├── managers/
│   ├── api/
│   ├── database/
│   └── storage/
└── frontend
    └── src/
```

## Quick Start

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set `GEMINI_API_KEY` in `backend/.env`.

Run:

```bash
python app.py
```

Backend default: `http://localhost:8000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5174
```

Frontend default: `http://127.0.0.1:5174`

Optional env:

- `BACKEND_URL=http://127.0.0.1:8000`

## API Highlights

- `POST /sorcerer/init` create influencer from onboarding wizard
- `GET /influencers` list influencers
- `GET /influencer/{id}` fetch influencer
- `GET /influencer/{id}/videos` fetch scheduled content
- `POST /schedule/interval` plan recurring content
- `POST /schedule/bulk` create dated content plans
- `POST /influencer/{id}/divine-intervention` rewrite story + regenerate schedule
- `POST /sponsors` create sponsor
- `GET /sponsors` list sponsors
- `POST /sponsor/match` match sponsor to influencer
- `POST /video/{id}/add-sponsor` attach sponsor to scheduled content

## Notes

- This repository currently includes a local SQLite DB file under `backend/storage/`.
- Some generation and publishing behavior is API-key or credentials dependent.
- If backend is unreachable, parts of the frontend now surface graceful fallback states.
