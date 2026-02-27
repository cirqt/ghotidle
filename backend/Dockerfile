# Backend Dockerfile
FROM python:3.12-slim
WORKDIR /app/backend
COPY . ./
RUN python -m venv .venv && \
    .venv/bin/pip install --upgrade pip && \
    .venv/bin/pip install -r requirements.txt && \
    .venv/bin/pip install psycopg2-binary
EXPOSE 8000
