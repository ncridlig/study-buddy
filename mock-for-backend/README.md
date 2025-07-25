# 🧪 Mock Task Receiver API

This is a mock FastAPI server that simulates receiving tasks, processing them asynchronously (with a delay), and sending a callback to another _backend_ once done.

---

## 🚀 Features

- Accepts tasks via a REST API (`/receive-task/`)
- Simulates processing with a 10-second delay (`time.sleep`)
- Sends a POST callback with dummy results to a specified endpoint (`/result/llm_callback/`)
- Uses background tasks (non-blocking) for realistic async behavior
- Tracks received tasks to avoid sending callbacks for unknown IDs

---

## 🐳 Docker Support

You can run the mock FastAPI server using Docker and Docker Compose.

⚠️ Make sure the app-network already exists. You can create it using:

```bash
docker network create app-network
```

Then, to build and start the container:

```bash
docker compose up -d --build
```

---

## 📮 API Endpoints at

At `POST /receive-task/`, Receives a new task and schedules a callback after 10 seconds (mocking the processing of files).

Request Body (JSON):

```bash
{
  "task_id": 123,
  "files": ["file1.pdf", "file2.pdf"]
}
```

The results will be received in _backend_, at `/result/llm_callback/` as:

```bash
{
    "task_id": 123,
    "markdown_content": "A sample markdown"
}
```

---

## 📡 Task Status Monitoring (WebSocket Client)

To monitor task status (e.g. _Pending_, _Processing_, _Failed_, or _Success_), you can run the file `ws.py` locally.

> **Note**: This file is not dockerized, you need to run it locally.

For Authentication, replace `ACCESS_TOKEN` in the file with a valid access token you receive from the APIs or from the Swagger.
