# Ghotidle - AI Coding Agent Instructions

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
The `database/schema.dbml` defines a three-table structure for future implementation:

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
