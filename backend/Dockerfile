# FROM python:3.10-slim

# ENV PYTHONDONTWRITEBYTECODE=1
# ENV PYTHONUNBUFFERED=1

# WORKDIR /app

# COPY requirements.txt /app/
# RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# COPY . /app/

# ENV PYTHONPATH=/app

# RUN python /app/manage.py collectstatic --noinput

# EXPOSE 8000

FROM python:3.10-slim

# These are standard best practices for Python in Docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Copy and install requirements
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app/

ENV PYTHONPATH=/app

# This line IS needed for the build process.
# It allows the 'collectstatic' command to find the correct settings.
ENV DJANGO_SETTINGS_MODULE=study.settings.production

# This command runs during the build on the GitHub runner
RUN python /app/manage.py collectstatic --noinput

# This tells Cloud Run which port your application listens on
EXPOSE 8000
