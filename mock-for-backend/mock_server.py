from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import requests
import time

app = FastAPI()

# Store task_ids to simulate memory
received_tasks = set()

class TaskRequest(BaseModel):
    task_id: int
    files: list[str]

class TaskIDOnly(BaseModel):
    task_id: int

def delayed_send_result(task_id: int):
    time.sleep(10)  # ⏳ wait 10 seconds

    if task_id not in received_tasks:
        print(f"[MOCK] Task ID {task_id} not found, skipping callback.")
        return

    django_url = "http://web:8000/result/llm_callback/"

    json_payload = {
        "task_id": task_id,
        "markdown_content": "# ✅ Task Completed\nHere is your result."
    }

    try:
        response = requests.post(django_url, json=json_payload)
        print(f"[MOCK] Callback for task {task_id} → {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Callback for task {task_id} failed: {e}")

@app.post("/receive-task/")
async def receive_task(data: TaskRequest, background_tasks: BackgroundTasks):
    print(f"Received task: {data}")
    received_tasks.add(data.task_id)

    # Start background job that sends result after 10s
    background_tasks.add_task(delayed_send_result, data.task_id)

    return {"status": "received", "task_id": data.task_id, "num_files": len(data.files)}


# @app.post("/receive-task/")
# async def receive_task(data: TaskRequest):
#     print(f"data: {data}")
#     # print(f"[MOCK] Received task_id: {data.task_id}")
#     received_tasks.add(data.task_id)
#     return {"status": "received", "task_id": data.task_id, "num_files": len(data.files)}


# @app.post("/send-result/")
# def send_result(data: TaskIDOnly):
#     if data.task_id not in received_tasks:
#         return {
#             "status": "FAILED",
#             "error_message": "Unknown task_id"
#         }, 404

#     django_url = "http://web:8000/result/llm_callback/"

#     json_payload = {
#         "task_id": data.task_id,
#         "markdown_content": "# Task Completed\nHere is your result."
#     }

#     try:
#         response = requests.post(django_url, json=json_payload)
#         return {
#             "status": "SUCCESS" if response.status_code == 200 else "FAILED",
#             "response_code": response.status_code,
#             "response_text": response.text
#         }
#     except Exception as e:
#         print(f"[ERROR] Failed to send result: {e}")
#         return {
#             "status": "FAILED",
#             "error": str(e)
#         }, 500
