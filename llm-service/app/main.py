from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Union, Optional
from app.tasks import process_qas_task

app = FastAPI()

class QARequest(BaseModel):
    task_id: Union[str, int]
    files: List[str]
    image_size: Optional[int] = None
    verbose: Optional[bool] = None
    question_prompt: Optional[str] = None
    answer_prompt: Optional[str] = None
    output_dir: Optional[str] = None

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
    image_size = request.image_size
    verbose = request.verbose if request.verbose is not None else False
    question_prompt = request.question_prompt
    answer_prompt = request.answer_prompt
    output_dir = request.output_dir
    try:
        process_qas_task.delay(
            request.files,
            task_id,
            image_size=image_size,
            verbose=verbose,
            question_prompt=question_prompt,
            answer_prompt=answer_prompt,
            output_dir=output_dir
        )
        return {"message": "Task received", "task_id": task_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/healthz", summary="Health check endpoint")
def health_check():
    return {"status": "ok"}

