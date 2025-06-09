FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY ./backend /app/backend
# COPY .env /app/.env

# Set PYTHONPATH environment variable
ENV PYTHONPATH=/app/backend

# Collect static files (optional step for production)
# RUN python /app/backend/manage.py collectstatic --noinput
RUN ["sh", "-c", "python /app/backend/manage.py collectstatic --noinput || true"]

# Start Gunicorn server
# CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
CMD ["gunicorn", "backend.wsgi:application", "--chdir", "/app/backend", "--bind", "0.0.0.0:8000", "--workers", "3"]
