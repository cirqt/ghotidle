# Ghotidle - AI Coding Agent Instructions

## Project Overview
Ghotidle is a Wordle-style game with a phonetics twist - users guess words that can be spelled unconventionally based on English phonetic rules (like "ghoti" for "fish"). This is a **full-stack monorepo** with Django REST backend and React+TypeScript frontend.

## Architecture

### Stack
- **Backend**: Django 4.2 + Django REST Framework + PostgreSQL
- **Frontend**: React 19 + TypeScript (Create React App)
- **Integration**: CORS-enabled REST API on localhost:8000, frontend on localhost:3000

### Project Structure
```
backend/
  ├── manage.py                          # Django CLI entry point
  ├── requirements.txt                   # Python dependencies
  ├── ghotidle_backend/                  # Django project config
  │   └── settings.py                    # CORS: localhost:3000, REST_FRAMEWORK config
  └── game/                              # Main app (currently stubs)
      ├── models.py, views.py, serializers.py, urls.py  # TODO: implement
      └── management/commands/           # Custom Django commands
          └── load_sample_data.py        # Data loading utility

frontend/
  ├── package.json                       # npm dependencies (React 19, TypeScript 4.9)
  └── src/
      ├── api.ts                         # API client pointing to localhost:8000/api
      ├── types.ts                       # TypeScript interfaces (stubbed)
      └── components/                    # Game UI components (stubbed)
          ├── Game.tsx                   # Main game container
          ├── Board.tsx                  # Guess board display
          └── Keyboard.tsx               # On-screen keyboard
```

## Development Workflows

### Starting Both Servers
**Backend** (PowerShell):
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # http://localhost:8000
```

**Frontend** (separate PowerShell terminal):
```powershell
cd frontend
npm install
npm start  # http://localhost:3000
```

### Testing
- **Frontend**: `npm test` (Jest + React Testing Library)
- **Backend**: `python manage.py test` (Django test framework)

### Database Management
- **Database**: PostgreSQL (shared with user accounts/leaderboards)
- Migrations: `python manage.py makemigrations` → `python manage.py migrate`
- Sample data: `python manage.py load_sample_data` (requires implementation)
- Admin: `python manage.py createsuperuser` → http://localhost:8000/admin

## Critical Implementation Patterns

### Backend API Structure (Currently TODO)
Expected API endpoints:
- `GET /api/word/daily/` - Get today's daily puzzle word (phonetic spelling shown, standard hidden)
- `GET /api/word/random/` - Random practice word
- `GET /api/word/<id>/` - Specific word retrieval (for review/sharing)
- `POST /api/validate/` - Guess validation with letter feedback + phonetic mapping highlights
- `POST /api/user/register/` - User registration (future: leaderboards)
- `GET /api/user/stats/` - User statistics (future feature)

**Django patterns to follow**:
1. Define models in `game/models.py`:
   - `Word` (standard_spelling, phonetic_spelling, pronunciation, date)
   - `PhoneticPattern` (letters, sound, example_word, example_position)
   - `PhoneticComponent` (links Word ↔ PhoneticPattern with positions)
   - `User` (extend Django User for future stats/leaderboards)
2. Create serializers in `game/serializers.py`:
   - `WordSerializer` (hide standard_spelling for game, reveal phonetic_spelling)
   - `GuessValidationSerializer` (input: guess, word_id; output: letter_feedback, phonetic_matches)
   - `PhoneticExplanationSerializer` (for end-game reveal: gh→f from "enough")
3. Implement views in `game/views.py`:
   - Use `@api_view` decorators or DRF viewsets
   - Daily word logic: filter by `date=today()`, create if doesn't exist
   - Validation logic: compare guess sounds to hidden word sounds using PhoneticComponent mappings
4. Wire URLs in `game/urls.py` → included in `ghotidle_backend/urls.py` at `/api/`

### Frontend API Integration (Currently TODO)
- All API calls go through `api.ts` module with `API_BASE_URL = 'http://localhost:8000/api'`
- Define TypeScript interfaces in `types.ts` matching Django serializers:
  ```typescript
  interface Word {
    id: number;
    phonetic_spelling: string;  // "ghoti" - shown to user
    // standard_spelling hidden until game ends
    length: number;
    date?: string;
  }
  
  interface LetterFeedback {
    letter: string;
    status: 'correct' | 'present' | 'absent';  // green | yellow | gray
    position: number;
  }
  
  interface PhoneticMatch {
    guess_letters: string;      // "sh" in user's guess
    phonetic_letters: string;   // "ti" in displayed "GHOTI"
    position_in_guess: number;
    position_in_phonetic: number;
  }
  
  interface GuessResponse {
    feedback: LetterFeedback[];
    phonetic_matches: PhoneticMatch[];  // Highlight when sounds align
    length_match: boolean;              // ✓ if lengths equal
    is_correct: boolean;
  }
  ```
- Components: `Game.tsx` (state manager) → `Board.tsx` (display guesses + phonetic word) + `Keyboard.tsx` (input)

### Game Logic Flow (Reverse Phonetic Puzzle)
**The twist**: Players see the oddly-spelled word (e.g., "ghoti") and must guess the standard spelling ("fish")

1. Frontend fetches daily word from `/api/word/daily/` (or `/api/word/random/` for practice)
2. **Display the phonetic spelling** to user (e.g., "GHOTI" at top of screen)
3. User guesses standard word → POST to `/api/validate/` with guess string
4. Backend validates guess and returns:
   - **Letter-level feedback**: 
     - Green if letter is correct position in hidden word (e.g., "sh" in "trash" → marks "ti" in "GHOTI" green)
     - Yellow if letter exists in hidden word but wrong position
     - Gray if letter not in hidden word
   - **Length match indicator**: ✓ if guess length = hidden word length
   - **Phonetic mapping highlights**: When a sound matches (e.g., user guesses "sh", highlight "ti" in displayed "GHOTI")
5. 6 attempts max, then reveal answer with phonetic explanations

**Example flow**:
- Display: "GHOTI"
- User guesses: "trash" (5 letters ✓)
- Backend response: 
  - Letters: t=gray, r=gray, a=gray, s=yellow (exists in "fish"), h=yellow
  - **Phonetic match**: "sh" sound detected → highlight "ti" in "GHOTI" green + "sh" in guess green
- User eventually guesses: "fish" → WIN!
- Show explanation: gh→f (enough), o→i (women), ti→sh (nation)

## Project-Specific Conventions

### Phonetic Mapping Database
**Three-table structure** in PostgreSQL for phonetic correlations:

1. **`PhoneticPattern`** - Maps letter combinations to sounds
   - `letters`: "gh", "o", "ti"
   - `sound`: "f", "i", "sh"
   - `example_word`: "enough", "women", "nation"
   - `example_position`: Position in example where pattern occurs

2. **`Word`** - Daily puzzle words
   - `standard_spelling`: "fish"
   - `phonetic_spelling`: "ghoti"
   - `pronunciation`: "f-i-sh" (IPA or simplified)
   - `length`: 4
   - `day_number`: Sequential index for daily puzzle selection

3. **`PhoneticComponent`** - Links words to their phonetic breakdown
   - `word_id`: FK to Word
   - `pattern_id`: FK to PhoneticPattern
   - `position_in_phonetic`: Position in "ghoti" (0-based: gh=0, o=2, ti=3)
   - `position_in_standard`: Position in "fish" (0-based: f=0, i=1, sh=2)

**Example data for "fish" with multiple phonetic spellings**:
```python
# PhoneticPattern entries
{"letters": "gh", "sound": "f", "example_word": "enough", "example_position": 4}
{"letters": "o", "sound": "i", "example_word": "women", "example_position": 1}
{"letters": "ea", "sound": "i", "example_word": "eagle", "example_position": 0}
{"letters": "ti", "sound": "sh", "example_word": "nation", "example_position": 3}

# Word entries (same word, multiple phonetic variants)
{"standard_spelling": "fish", "phonetic_spelling": "ghoti", "pronunciation": "f-i-sh", "length": 4, "day_number": 1}
{"standard_spelling": "fish", "phonetic_spelling": "gheati", "pronunciation": "f-i-sh", "length": 6, "day_number": 50}
```

**Note**: Use simplified pronunciation format (e.g., "f-i-sh") not IPA notation for accessibility.

### Validation Logic (Non-deterministic Handling)
- **Sound-to-letters mapping is one-to-many**: "f" sound can be "f", "ph", "gh"
- Backend must check if guessed letters produce the correct **sounds** when matched against hidden word
- Store **one canonical example word** per pattern for UI explanations
- When multiple patterns exist for same sound, prioritize by frequency/commonality
- **Dictionary validation**: User input must be validated against a word dictionary before processing
  - Prevents random letter sequences like "abcdefghijklmnopqrstuvwxyz"
  - Return error if word not in dictionary: `{"valid_word": false, "message": "Not in word list"}`
  - Consider using a Python library like `nltk.corpus.words` or maintain custom valid words list
- **Length mismatch with partial feedback**: If user guesses "selfish" (7 letters) for "fish" (4 letters):
  - Return length_match: false (show ✗ indicator)
  - Still provide letter-by-letter feedback (yellow/gray for letters that exist in hidden word)
  - Example: "selfish" → s=yellow, e=gray, l=gray, f=green, i=green, s=yellow, h=green
  - Helps user narrow down the word even if length is wrong
  
  Example response for "selfish" when hidden word is "fish":
  ```json
  {
    "length_match": false,
    "feedback": [
      {"letter": "s", "status": "present", "position": 0},
      {"letter": "e", "status": "absent", "position": 1},
      {"letter": "l", "status": "absent", "position": 2},
      {"letter": "f", "status": "correct", "position": 3},
      {"letter": "i", "status": "correct", "position": 4},
      {"letter": "s", "status": "present", "position": 5},
      {"letter": "h", "status": "correct", "position": 6}
    ],
    "phonetic_matches": [
      {"guess_letters": "sh", "phonetic_letters": "ti", "position_in_guess": 5, "position_in_phonetic": 3}
    ],
    "is_correct": false,
    "message": "Word must be 4 letters"
  }
  ```

### CORS Configuration
`settings.py` explicitly allows `localhost:3000` and `127.0.0.1:3000`. When adding new frontend URLs or deployment, update `CORS_ALLOWED_ORIGINS`.

### Component Styling
Each component has a dedicated CSS file (e.g., `Board.css` for `Board.tsx`). Keep styles component-scoped.

## Common Pitfalls

1. **Virtual environment**: Always activate `venv\Scripts\activate` before backend work
2. **CORS errors**: Ensure backend is running and `corsheaders` middleware is active
3. **Migration conflicts**: Run `makemigrations` after model changes
4. **Port conflicts**: Backend must be on 8000, frontend on 3000 (hardcoded in configs)
5. **TypeScript strict mode**: React 19 + TS 4.9 - ensure type annotations match

## Next Steps for Implementation
Based on TODOs found throughout codebase:
1. Define `Word` model in `backend/game/models.py`
2. Create DRF serializers and views for word retrieval + validation
3. Implement `load_sample_data.py` management command
4. Define TypeScript interfaces in `frontend/src/types.ts`
5. Build game state management in `Game.tsx`
6. Implement Board and Keyboard rendering logic
7. Connect frontend to API via `api.ts` methods

## Remaining Clarifications

1. **~~Pronunciation format~~**: ✅ Use simplified hyphenated sounds (e.g., "f-i-sh") not IPA

2. **~~Multiple valid phonetic spellings~~**: ✅ Yes - "fish" can be "ghoti" OR "gheati" (store multiple Word records)

3. **~~Partial sound matching~~**: ✅ Reject length mismatches upfront - no partial validation

4. **Daily word selection**: Should follow NYT Wordle pattern - **pre-curated word list** with deterministic date-based selection:
   - Store all puzzle words in DB with sequential `day_number` field
   - `/api/word/daily/` calculates days since epoch (e.g., Jan 1, 2025) and returns word at that index
   - Benefits: consistent across users, no timezone issues, easy testing (just change date)
   - Implementation: `word_index = (today - start_date).days % total_words`
