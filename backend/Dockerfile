FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY . /app/

ENV PYTHONPATH=/app

# RUN ["sh", "-c", "python /app/backend/manage.py collectstatic --noinput || true"]
RUN python /app/manage.py collectstatic --noinput

# Start Gunicorn server
# CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
# CMD ["gunicorn", "backend.wsgi:application", "--chdir", "/app/backend", "--bind", "0.0.0.0:8000", "--workers", "3"]

EXPOSE 8000
