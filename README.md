# Ghotidle

Wordle but for phonetics - a game where you guess words that can be spelled unconventionally based on English phonetic rules (like spelling 'fish' as 'ghoti').

## Project Structure

- `backend/` - Django REST API backend
- `frontend/` - React + TypeScript frontend

## Setup and Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Load sample data (optional):
```bash
python manage.py load_sample_data
```

6. Start the development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## How to Play

1. Make sure both backend and frontend servers are running
2. Open `http://localhost:3000` in your browser
3. Try to guess the word by typing letters
4. Each guess must be the correct length
5. After each guess, the color of the tiles will change:
   - **Green**: Letter is in the correct position
   - **Yellow**: Letter is in the word but in the wrong position
   - **Gray**: Letter is not in the word
6. You have 6 attempts to guess the word
7. Words can be spelled phonetically (e.g., "ghoti" for "fish")

## API Endpoints

- `GET /api/word/random/` - Get a random word to guess
- `GET /api/word/<id>/` - Get a specific word by ID
- `POST /api/validate/` - Validate a guess

## Technologies Used

### Backend
- Django 4.2
- Django REST Framework
- Django CORS Headers
- SQLite (default database)

### Frontend
- React 18
- TypeScript
- CSS3

## Development

### Adding New Words

You can add new words and phonetic patterns through the Django admin interface:

1. Create a superuser:
```bash
cd backend
python manage.py createsuperuser
```

2. Access the admin panel at `http://localhost:8000/admin`
3. Add words and their phonetic patterns

### Project Features

- Random word selection
- Guess validation with feedback
- Visual feedback for letter positions
- On-screen keyboard
- Physical keyboard support
- Game state management
- Alternative spelling explanations

