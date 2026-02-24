# Multi-stage build for Ghotidle
# Backend stage
FROM python:3.12-slim AS backend
WORKDIR /app/backend
COPY backend/ ./
RUN python -m venv .venv && \
    .venv/bin/pip install --upgrade pip && \
    .venv/bin/pip install -r requirements.txt

# Frontend stage
FROM node:20-slim AS frontend
WORKDIR /app/frontend
COPY frontend/ ./
RUN npm install

# Final stage: Use base image, run both servers
FROM python:3.12-slim
WORKDIR /app
COPY --from=backend /app/backend ./backend
COPY --from=frontend /app/frontend ./frontend

# Install node for frontend
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Expose ports
EXPOSE 8000 3000

# Start both servers
CMD bash -c "cd backend && .venv/bin/python manage.py migrate && .venv/bin/python manage.py runserver 0.0.0.0:8000 & cd ../frontend && npm start"
