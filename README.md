# Ghotidle

A daily word puzzle game with a phonetics twist! Players see an oddly-spelled word (like "ghoti") and must deduce the standard spelling ("fish") using phonetic clues and letter feedback.

## The Unique Twist

Unlike traditional Wordle, Ghotidle is a **reverse phonetic puzzle**:
- The game **displays** an unconventionally-spelled word (e.g., "GHOTI")
- Players **guess** the standard spelling (e.g., "fish")
- When correct sounds are guessed, both the guess letters AND the phonetic letters highlight green
- Example: Guessing "trash" highlights "sh" in your guess and "ti" in "GHOTI" (both make the "sh" sound!)

The name comes from the famous example: "ghoti" = "fish"
- **gh** = "f" (as in "enough")
- **o** = "i" (as in "women")  
- **ti** = "sh" (as in "nation")

## Project Structure

```
backend/          - Django 4.2 + DRF + PostgreSQL
frontend/         - React 19 + TypeScript
.github/          - Copilot instructions for AI agents
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL

### Backend Setup (PowerShell)

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # For admin access
python manage.py runserver  # http://localhost:8000
```

### Frontend Setup (Separate Terminal)

```powershell
cd frontend
npm install
npm start  # http://localhost:3000
```

## How to Play

1. **See the phonetic word** displayed at the top (e.g., "GHOTI")
2. **Guess the standard spelling** - must be a valid dictionary word
3. **Receive feedback**:
   - **Green**: Letter in correct position in hidden word
   - **Yellow**: Letter exists in hidden word, wrong position
   - **Gray**: Letter not in hidden word
   - **Length indicator**: Shows if your guess length matches
   - **Phonetic highlights**: When sounds match (e.g., "sh" ↔ "ti"), both get highlighted
4. **6 attempts** to solve the puzzle
5. **Daily puzzle** changes every 24 hours (NYT Wordle style)

### Example Game Flow

```
Display: "GHOTI" (4 letters)

Guess 1: "trash" (5 letters ✗)
Feedback: t=gray, r=gray, a=gray, s=yellow, h=yellow
Phonetic: "sh" → "ti" highlighted (sound match!)

Guess 2: "fish" (4 letters ✓)
Result: WIN!
Explanation:
  gh → f (enough)
  o → i (women)
  ti → sh (nation)
```

## Setup and Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL

### Backend Setup (PowerShell)

### Backend Setup (PowerShell)

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # For admin access
python manage.py load_sample_data  # Optional: load sample phonetic patterns
python manage.py runserver  # http://localhost:8000
```

### Frontend Setup (Separate Terminal)

```powershell
cd frontend
npm install
npm start  # http://localhost:3000
```

## API Endpoints

### Word Retrieval
- `GET /api/word/daily/` - Today's daily puzzle (phonetic spelling shown, standard hidden)
- `GET /api/word/random/` - Random practice word
- `GET /api/word/<id>/` - Specific word retrieval

### Game Logic
- `POST /api/validate/` - Validate guess with letter feedback + phonetic mapping highlights
  - Returns: letter-by-letter feedback, phonetic sound matches, length validation
  - Validates against dictionary (rejects nonsense like "abcdefgh")
  - Provides partial feedback even if length mismatches

### User Management (Future)
- `POST /api/user/register/` - User registration
- `GET /api/user/stats/` - User statistics and leaderboard data

## Technologies Used

### Backend
- Django 4.2
- Django REST Framework
- Django CORS Headers
- PostgreSQL (user accounts + phonetic patterns)

### Frontend
- React 19
- TypeScript 4.9
- Create React App
- Jest + React Testing Library

### Database Schema
Three-table structure for phonetic correlations:
1. **PhoneticPattern** - Letter combinations → sounds (e.g., "gh" → "f" from "enough")
2. **Word** - Daily puzzles (standard + phonetic spellings, day_number for sequencing)
3. **PhoneticComponent** - Junction table linking words to their phonetic breakdown

## Contributing

### For Developers

1. **Read AI Instructions**: Check `.github/copilot-instructions.md` for comprehensive architecture details
2. **Database**: PostgreSQL required (phonetic patterns + future user accounts)
3. **Testing**: Run `npm test` (frontend) and `python manage.py test` (backend)
4. **Migrations**: Always run `makemigrations` after model changes

### Adding New Words

Through Django admin (`http://localhost:8000/admin`):

1. Create **PhoneticPattern** entries (e.g., "gh" → "f", example: "enough")
2. Create **Word** entry (standard + phonetic spelling, assign day_number)
3. Create **PhoneticComponent** links (map positions between spellings)

Example: For "ghoti" → "fish":
- Pattern: gh(0)→f(0), o(2)→i(1), ti(3)→sh(2)
- Each component stores positions in both phonetic and standard spellings

### Key Features

- **Daily puzzle system** (NYT Wordle-style: deterministic word selection by date)
- **Dictionary validation** (only real words accepted)
- **Phonetic sound matching** (highlights corresponding letters in both guess and display)
- **Length-agnostic feedback** (provides clues even if guess length is wrong)
- **Multiple phonetic spellings** (same word can have variants: "ghoti" vs "gheati" for "fish")
- **User accounts & leaderboards** (planned)
- **Game statistics tracking** (planned)

### Project Conventions

- **CORS**: Frontend on `:3000`, backend on `:8000` (pre-configured in `settings.py`)
- **Component styling**: Each React component has dedicated CSS file (e.g., `Board.css`)
- **Pronunciation format**: Simplified notation (e.g., "f-i-sh") not IPA
- **Virtual environment**: Always activate before backend work (`venv\Scripts\activate`)
- **Daily word logic**: `word_index = (today - start_date).days % total_words`

### Common Pitfalls

1. Must activate virtual environment before backend commands
2. PostgreSQL must be running and configured
3. Run migrations after any model changes
4. Backend must be on port 8000, frontend on 3000 (hardcoded)
5. React 19 + TypeScript 4.9 - ensure type annotations match

## Documentation

- **AI Agent Instructions**: `.github/copilot-instructions.md` - Comprehensive guide for AI coding assistants
- **Game Mechanics**: Reverse phonetic puzzle design documented above
- **Database Schema**: Three-table structure for phonetic mappings

## Design Philosophy

This game explores the quirks of English phonetics in an accessible, puzzle-like format. By reversing the traditional spelling→phonetics direction, players discover how the same sounds can be represented by wildly different letter combinations. The game is educational while remaining fun and challenging!

---

**Status**: Active Development  
**License**: TBD  
**Maintainer**: [@cirqt](https://github.com/cirqt)

