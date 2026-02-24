# Ghotidle Docker Quickstart

## Requirements
- Docker Desktop (Windows/Mac/Linux)
- Docker Compose (included with Docker Desktop)

## Usage

1. Build and start both servers:

```
docker-compose up --build
```

2. Access the app:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## Notes
- Both backend and frontend code are mounted as volumes for live reload.
- Backend uses Python 3.12, frontend uses Node 20.
- Migrations run automatically on backend start.
- Stop with Ctrl+C or:
```
docker-compose down
```
