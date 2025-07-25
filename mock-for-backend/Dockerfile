# Dockerfile
FROM python:3.10-slim

# Set work directory
WORKDIR /app

# Copy requirements (inline or separate file)
COPY mock_server.py /app/mock_server.py

# Install FastAPI and Uvicorn
RUN pip install --no-cache-dir fastapi uvicorn requests

# Expose port
EXPOSE 8001

# Start the app
CMD ["uvicorn", "mock_server:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
