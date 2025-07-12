from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Union
from app.tasks import process_qas_task

app = FastAPI()

class QARequest(BaseModel):
    task_id: Union[str, int]
    files: List[str]

class QAResponse(BaseModel):
    message: str
    task_id: str

@app.post(
    "/receive-task/",
    response_model=QAResponse,
    summary="Start Q&A Generation Task",
    response_description="Returns task acceptance message and task ID"
)
def generate_qas(request: QARequest):
    task_id = str(request.task_id)
    try:
        process_qas_task.delay(request.files, task_id)
        return {"message": "Task received", "task_id": task_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/healthz", summary="Health check endpoint")
def health_check():
    return {"status": "ok"}

