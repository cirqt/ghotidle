# Contributing to Ghotidle

Thanks for your interest! Here's everything you need to get up and running.

## Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+
- Git

## Local Setup

### 1. Clone & Configure

```powershell
git clone https://github.com/cirqt/ghotidle.git
cd ghotidle
```

Create `backend/.env`:
```
DJANGO_SECRET_KEY=some-local-dev-key
DJANGO_DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=ghodb
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FRONTEND_URL=http://localhost:3000
```

Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### 2. Database

```powershell
# In psql or pgAdmin
CREATE DATABASE ghodb;
```

### 3. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1       # Windows
# source .venv/bin/activate        # Mac/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # Optional, for admin panel
python data/load_valid_words.py    # Load 97k word dictionary
python manage.py runserver         # http://localhost:8000
```

### 4. Frontend

```powershell
cd frontend
npm install
npm start   # http://localhost:3000
```

### Or: Docker (easiest)

```powershell
docker compose up --build
```

Starts all three containers (db, backend, frontend) in one command.

---

## Project Structure

```
backend/
  game/
    models.py       - Word, PhoneticPattern, PhoneticComponent, ValidWord, UserStats
    views.py        - All API endpoints (function-based views)
    urls.py         - Route definitions
    admin.py        - Django admin registrations
    authentication.py - CSRF-exempt session auth for REST API
  ghotidle_backend/
    settings.py     - All config reads from environment variables

frontend/
  src/
    App.tsx         - Main game logic and state
    components/
      AdminModal.tsx       - Word and pattern creation UI
      AuthModal.tsx        - Login / register
      GameOverModal.tsx    - End-of-game reveal with phonetic breakdown
      InfoModal.tsx        - How to Play
      Keyboard.tsx         - On-screen keyboard
      LeaderboardModal.tsx - Top players + your stats
      MenuBar.tsx          - Top navigation
      PasswordResetModal.tsx
      UserModal.tsx        - Account settings + stats

database/
  schema.dbml      - Full ER schema (dbdiagram.io format)
  ghoDB.sql        - PostgreSQL CREATE TABLE statements
```

---

## Key Concepts

**The game loop:**
1. `/api/word/` returns today's puzzle word and its phonetic breakdown
2. Player guesses the standard spelling
3. `/api/validate/` runs a two-pass Wordle-style comparison and returns color feedback
4. On game end, the phonetic pattern breakdown is revealed

**Phonetic patterns** are the core data — they map letter combinations to sounds with a reference word (e.g. "gh" → "f", reference: "enough"). Words are linked to patterns via `PhoneticComponent`.

**Word queue** is FIFO by date — each new word added via the admin panel gets auto-assigned the next available date.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/word/` | Today's puzzle word |
| POST | `/api/validate/` | Validate a guess |
| GET | `/api/leaderboard/` | Top players + current user stats |
| POST | `/api/auth/register/` | Create account |
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/auth/me/` | Current user info |
| POST | `/api/auth/change-email/` | Update email |
| POST | `/api/auth/change-password/` | Update password |
| POST | `/api/auth/password-reset/request/` | Request password reset |
| POST | `/api/auth/password-reset/confirm/` | Confirm password reset |
| POST | `/api/words/` | Create puzzle word (admin only) |
| GET | `/api/phonetic-patterns/` | List all patterns |
| POST | `/api/phonetic-patterns/` | Create pattern (admin only) |
| POST | `/api/phonetic-patterns/suggest/` | Suggest patterns for given sounds |

---

## Coding Guidelines

- Follow the principles in `.github/CLAUDE.md`: think before coding, simplicity first, surgical changes
- Backend uses function-based views with `@api_view` decorators — keep that consistent
- No DRF serializers yet (intentional for now) — views return plain dicts
- Frontend API calls use `process.env.REACT_APP_API_URL` — never hardcode `localhost`
- Test backend endpoints manually before wiring up frontend

## Running Tests

```powershell
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm test
```

> Note: test coverage is currently minimal — contributions here are very welcome.

---

## Submitting Changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Test locally (both servers running)
4. Open a pull request with a brief description of what and why
