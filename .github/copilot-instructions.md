# Ghotidle - AI Coding Agent Instructions

## Coding Guidelines

**IMPORTANT:** Follow the principles in `.github/CLAUDE.md` for all code changes:
1. **Think Before Coding** - State assumptions explicitly, surface tradeoffs, ask when unclear
2. **Simplicity First** - Minimum code that solves the problem, no speculative features
3. **Surgical Changes** - Touch only what's necessary, match existing style
4. **Goal-Driven Execution** - Define verifiable success criteria, loop until verified

See `.github/CLAUDE.md` for full details.

## Project Overview
Ghotidle is a Wordle-style game with a phonetics twist - users guess words that can be spelled unconventionally based on English phonetic rules (like "ghoti" for "fish"). This is a **full-stack monorepo** with Django REST backend and React+TypeScript frontend.

**Current Status**: Early prototype with hardcoded "fish" word and basic validation. Database schema designed but not yet implemented in Django models.

## Architecture

### Stack
- **Backend**: Django 4.2 + Django REST Framework + SQLite (dev)
- **Frontend**: React 19 + TypeScript (Create React App)
- **Integration**: CORS-enabled REST API on localhost:8000, frontend on localhost:3000

### Project Structure
```
backend/
  ├── manage.py                          # Django CLI entry point
  ├── requirements.txt                   # Python dependencies (Django, DRF, CORS)
  ├── db.sqlite3                         # SQLite database (created after migrate)
  ├── ghotidle_backend/                  # Django project config
  │   └── settings.py                    # CORS: localhost:3000, SQLite config
  └── game/                              # Main Django app
      ├── models.py                      # EMPTY - needs implementation
      ├── views.py                       # Hardcoded "fish" validation logic
      ├── urls.py                        # 2 endpoints: /word/, /validate/
      └── admin.py                       # Django admin config

database/
  ├── schema.dbml                        # Database design (dbdiagram.io format)
  ├── ghoDB.sql                          # SQL schema export
  └── ghoDBvis.pdf                       # Visual schema diagram

frontend/
  ├── package.json                       # npm dependencies (React 19, TypeScript 4.9)
  └── src/
      ├── App.tsx                        # Main game logic (240 lines, all-in-one)
      └── components/                    
          ├── Game.tsx                   # Separate game component (exists but not used)
          └── Keyboard.tsx               # On-screen keyboard component
```

## Development Workflows

### Starting Both Servers (Windows PowerShell)
**Backend**:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # http://127.0.0.1:8000
```

**Frontend** (separate terminal):
```powershell
cd frontend
npm install
npm start  # http://localhost:3000
```

Both servers must run simultaneously for the game to work.

### Testing
- **Frontend**: `npm test` (configured but minimal tests)
- **Backend**: `python manage.py test` (no tests written yet)

### Database Management
- **Current**: SQLite (`backend/db.sqlite3`) - auto-created on first `migrate`
- **Planned**: PostgreSQL (see `database/schema.dbml` for design)
- Migrations: `python manage.py makemigrations` → `python manage.py migrate`
- Admin panel: `python manage.py createsuperuser` → http://localhost:8000/admin

## Critical Implementation Patterns

### Current Backend Implementation (Minimal Prototype)
**Existing endpoints** in `backend/game/views.py`:
- `GET /api/word/` - Returns hardcoded word "fish" with phonetic breakdown
  ```python
  {'word': 'fish', 'phonetic_spelling': 'gh,o,ti', 'length': 4}
  ```
- `POST /api/validate/` - Validates guesses against hardcoded "fish"
  - Returns `feedback` array with `{letter, status, position}` per character
  - `status`: 'correct' (green), 'present' (yellow), 'absent' (gray)
  - Implements two-pass algorithm: first mark exact matches, then mark present letters
  - Returns `is_correct` boolean and `length_match` boolean

**Models** (`backend/game/models.py`): Currently empty - marked with `# TODO: Define models`

### Current Frontend Implementation (Functional Prototype)
**All game logic in `App.tsx`** (241 lines):
- Fetches word on mount from `/api/word/`
- Displays phonetic word (e.g., "GHOTI") parsed from `phonetic_spelling` response
- Handles keyboard input (physical + on-screen via `Keyboard` component)
- Submits guesses to `/api/validate/` and renders feedback grid
- Game state: `currentGuess`, `guesses[]`, `gameWon`, `gameLost`, loading states
- Max attempts: 5 guesses, max word length: 7 characters
- No separate `Board` component - grid rendered inline in `App.tsx`
- Modal "How to Play" dialog with color-coded example

**API integration**: Hardcoded `API_BASE_URL = 'http://localhost:8000/api'` in `App.tsx`

**Missing files** (referenced in other branches but don't exist here):
- `frontend/src/api.ts` - No centralized API client
- `frontend/src/types.ts` - Types defined inline in `App.tsx`
- `frontend/src/components/Board.tsx` - Not used (grid in `App.tsx` instead)

### Game Logic Flow (Current Implementation)
**The concept**: Players see the oddly-spelled word (e.g., "GHOTI") and must guess the standard spelling ("fish")

**Current flow** (hardcoded "fish" only):
1. Frontend fetches word from `/api/word/` on mount
2. Backend returns: `{word: 'fish', phonetic_spelling: 'gh,o,ti', length: 4}`
3. Frontend displays "GHOTI" (joining phonetic components)
4. User types guess in text input (max 7 chars)
5. Press Enter → POST to `/api/validate/` with `{guess: "..."}`
6. Backend compares against hardcoded TARGET_WORD = 'fish':
   - First pass: Mark correct positions as 'correct' (green)
   - Second pass: Mark remaining letters in word as 'present' (yellow)
   - Returns: `{guess, feedback[], is_correct, length_match}`
7. Frontend renders colored letter grid (5 rows max)
8. Game ends when `is_correct` or 5 guesses exhausted

**Not yet implemented**:
- Phonetic pattern detection (no "sh"→"ti" highlighting)
- Multiple words (only "fish")
- Daily word rotation
- Phonetic explanation reveal at game end
- Dictionary validation

## Project-Specific Conventions

### Planned Database Schema (Not Yet Implemented)
The `database/schema.dbml` defines the database structure:

1. **`phoneticPattern`** - Letter-to-sound mappings
   - `letters` (varchar): "gh", "o", "ti"
   - `sound` (varchar): "f", "i", "sh"  
   - `reference` (varchar): Example word like "enough"

2. **`word`** - Daily puzzle words
   - `secret` (varchar): Standard spelling "fish"
   - `phonetic` (varchar): Phonetic spelling "ghoti"
   - `date` (date): For daily puzzle selection

3. **`phoneticComponent`** - Many-to-many link between words and patterns
   - `wordId`, `patternId`: Junction table

4. **`user`** - User accounts and statistics
   - `username`, `email`, `passwordHash`
   - `correctGuesses`, `wrongGuesses`, `streak`

5. **`validWord`** - Dictionary for guess validation (~97k words)
   - `word` (varchar, primary key): Valid English words (1-7 chars)
   - No foreign keys - standalone lookup table
   - Used to validate user guesses before checking against target word

**Database files**:
- `database/schema.dbml` - DBML schema definition
- `database/ghoDB.sql` - PostgreSQL CREATE TABLE statements
- `database/ghoDBvis.pdf` - Visual ER diagram
- `backend/data/load_valid_words.py` - Python script to load word list into DB
- `backend/data/words_filtered.txt` - 97,054 valid English words (1-7 chars)
- `backend/data/filter_words.py` - Script used to filter the word list

**Loading dictionary into database**:
```powershell
# Python script (update DB_CONFIG in the file first)
python backend/data/load_valid_words.py
```

**Current state**: Models not implemented - `backend/game/models.py` is empty with TODO comment

### Frontend Patterns
- **All logic in App.tsx**: No separate state management - 241 lines handling everything
- **Inline type definitions**: TypeScript interfaces defined in `App.tsx`, not separate `types.ts`
- **Fetch API**: Direct `fetch()` calls in component, no centralized API client
- **CSS co-location**: Each component has adjacent `.css` file (e.g., `Keyboard.tsx` → `Keyboard.css`)
- **Physical + on-screen keyboard**: Event listener for physical keys + `Keyboard` component buttons

### Backend Patterns  
- **Function-based views**: Using `@api_view(['GET'])` decorators, not class-based views
- **Hardcoded validation**: Two-pass algorithm in `validate_guess` view:
  1. First loop: Mark exact position matches as 'correct', remove from remaining pool
  2. Second loop: Check remaining letters against remaining pool for 'present'
- **No serializers yet**: Views return plain dict responses, no DRF serializers defined

### CORS Configuration
`settings.py` explicitly allows `localhost:3000` and `127.0.0.1:3000`. When adding new frontend URLs or deployment, update `CORS_ALLOWED_ORIGINS`.

## Common Pitfalls

1. **Virtual environment**: Always activate `.\venv\Scripts\Activate.ps1` before backend work (PowerShell syntax)
2. **CORS errors**: Ensure backend is running and `corsheaders` middleware is active in `settings.py`
3. **Migration conflicts**: Run `makemigrations` after model changes (currently models are empty)
4. **Port conflicts**: Backend must be on 8000, frontend on 3000 (hardcoded in `App.tsx`)
5. **Both servers required**: Game won't work unless both Django and React dev servers are running

## Next Steps for Implementation

Based on current prototype state, these are the key missing pieces:

1. **Define Django models** in `backend/game/models.py`:
   - Implement `Word`, `PhoneticPattern`, `PhoneticComponent` from `database/schema.dbml`
   - Create and run migrations
   - Register models in `admin.py` for easy data entry

2. **Create sample data loader**:
   - Implement `backend/game/management/commands/load_sample_data.py`
   - Load initial words like "fish"→"ghoti" with phonetic mappings

3. **Refactor backend views**:
   - Replace hardcoded "fish" with database queries
   - Add `/api/word/random/` endpoint for random word selection
   - Implement phonetic pattern matching in validation logic

4. **Refactor frontend structure**:
   - Extract API calls to `frontend/src/api.ts`
   - Define TypeScript interfaces in `frontend/src/types.ts`
   - Consider splitting `App.tsx` into smaller components (Board, GuessRow, etc.)

5. **Add advanced features**:
   - Dictionary validation (check if guess is a real word)
   - Phonetic match highlighting (show when "sh" matches "ti" in "ghoti")
   - End-game reveal with phonetic explanations
   - Daily word rotation based on date

## Design Decisions & Rationale

1. **Why phonetic_spelling as comma-separated string** (`"gh,o,ti"`)?
   - Allows frontend to parse and display components (GHOTI)
   - Preserves phonetic boundaries for future highlighting
   - Simple format for prototype phase

2. **Why two-pass validation algorithm**?
   - Matches Wordle behavior: correct positions take priority
   - Prevents double-counting letters (if word has one 's', don't mark two 's' guesses as yellow)
   - Standard algorithm used in word-guessing games

3. **Why SQLite in development**?
   - Zero configuration, automatic setup
   - Good for prototyping before PostgreSQL migration
   - `database/schema.dbml` serves as target schema for production

4. **Why inline everything in App.tsx**?
   - Rapid prototyping approach
   - Easier to understand all logic in one place during early development
   - Should be refactored as features grow

## Setting Up on a New Workstation

### Prerequisites
1. **Git** - Clone the repository
2. **Python 3.12+** - Backend runtime
3. **Node.js 20+** - Frontend runtime
4. **PostgreSQL 16+** - Database server

### Initial Setup Steps

**1. Clone Repository**
```powershell
git clone https://github.com/cirqt/ghotidle.git
cd ghotidle
```

**2. Database Setup**
Create PostgreSQL database (using psql or pgAdmin):
```sql
CREATE DATABASE ghodb;
```

Update credentials in `backend/ghotidle_backend/settings.py` if needed:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ghodb',
        'USER': 'postgres',
        'PASSWORD': 'admin',  # Change to match your PostgreSQL password
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**3. Backend Setup**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Create database tables (16 tables: auth, sessions, game models)
python manage.py migrate

# Create admin user (optional, for Django admin panel)
python manage.py createsuperuser
# Username: admin (or anything)
# Email: your@email.com
# Password: your_password

# Load valid words dictionary (97,054 words for guess validation)
python data/load_valid_words.py
```

**4. Frontend Setup**
```powershell
cd ../frontend
npm install
```

**5. Start Servers**
```powershell
# Terminal 1 - Backend
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver  # http://127.0.0.1:8000

# Terminal 2 - Frontend
cd frontend
npm start  # http://localhost:3000
```

### Database Tables Overview

After running `python manage.py migrate`, PostgreSQL will have **16 tables**:

**Authentication Tables (6) - Django built-in:**
- `auth_user` - User accounts (username, email, hashed password)
- `auth_group`, `auth_permission` - Permission system
- `auth_user_groups`, `auth_user_user_permissions` - Many-to-many links
- `auth_group_permissions` - Group permissions

**Game Tables (6) - Custom models:**
- `validWord` - 97,054 valid English words (1-7 chars) for guess validation
- `word` - Daily puzzle words (secret, phonetic spelling, date)
- `phoneticPattern` - Phonetic mappings (e.g., "gh"→"f" from "enough")
- `phoneticComponent` - Junction table linking words to patterns
- `game_word` - Django-managed version of word table
- `game_phoneticpattern` - Django-managed version of phoneticPattern table

**Django Core Tables (3) - Required:**
- `django_session` - Active user sessions (for login persistence)
- `django_migrations` - Migration history tracking
- `django_content_type` - Django's internal content type system

**Admin Tables (1) - Optional:**
- `django_admin_log` - Audit log for Django admin panel actions

### Transferring Data Between Workstations

**Option 1: Full Database Export/Import (Recommended)**
```powershell
# On original workstation - Export entire database
pg_dump -U postgres -d ghodb > ghodb_backup.sql

# On new workstation - Import after creating empty database
createdb -U postgres ghodb
psql -U postgres -d ghodb < ghodb_backup.sql
```

**Option 2: Selective Data Export (Django Fixtures)**
```powershell
# Export specific data as JSON
python manage.py dumpdata auth.User --indent 2 > fixtures/users.json
python manage.py dumpdata game.Word game.PhoneticPattern --indent 2 > fixtures/game_data.json

# Import on new workstation (after running migrations)
python manage.py loaddata fixtures/users.json
python manage.py loaddata fixtures/game_data.json
```

**Option 3: Fresh Start (Development)**
- Run migrations to create empty tables
- Recreate superuser with `createsuperuser`
- Reload valid words with `python data/load_valid_words.py`
- Add new puzzle words through admin interface

### Important Notes

1. **Password Security**: Django uses PBKDF2-SHA256 hashing. Passwords are salted and cannot be reverse-engineered from the database.

2. **Sessions Don't Transfer**: Login sessions are tied to the server's SECRET_KEY. Users must log in again on a new workstation unless you:
   - Keep the same SECRET_KEY in settings.py
   - Import the django_session table data

3. **Valid Words Reload**: The `validWord` table (97k words) should be reloaded on new workstations using `backend/data/load_valid_words.py`.

4. **PostgreSQL Credentials**: Update `backend/ghotidle_backend/settings.py` to match your local PostgreSQL username/password.

5. **CORS Settings**: Already configured for localhost:3000 and 127.0.0.1:3000. Update `CORS_ALLOWED_ORIGINS` in settings.py for production domains.

6. **No SQLite Used**: Project uses PostgreSQL exclusively. The `db.sqlite3` file in backend (if present) is unused and can be ignored/deleted.

### Troubleshooting New Workstation Setup

**"relation does not exist" errors:**
```powershell
# Run migrations
python manage.py migrate
```

**CSRF/CORS errors:**
- Backend uses custom `CsrfExemptSessionAuthentication` class
- CSRF middleware is disabled for REST API
- Ensure `CORS_ALLOW_CREDENTIALS = True` in settings.py

**Cannot connect to PostgreSQL:**
- Verify PostgreSQL service is running
- Check credentials in settings.py match your PostgreSQL setup
- Ensure database `ghodb` exists: `psql -U postgres -l`

**Valid words not loading:**
- Ensure `backend/data/words_filtered.txt` exists (97,054 lines)
- Run `python data/load_valid_words.py` from backend directory
- Check console for progress output
