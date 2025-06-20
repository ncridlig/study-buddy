from celery import Celery
from app.settings import settings
import time
from decouple import config

celery_app = Celery("llm_tasks")

celery_app.conf.update(
    broker_url=settings.CELERY_BROKER_URL,
    result_backend=settings.CELERY_RESULT_BACKEND,
    task_serializer=settings.CELERY_TASK_SERIALIZER,
    result_serializer=settings.CELERY_RESULT_SERIALIZER,
    accept_content=settings.CELERY_ACCEPT_CONTENT,
    result_expires=settings.CELERY_RESULT_EXPIRES,
    timezone=settings.CELERY_TIMEZONE,
    task_always_eager=settings.CELERY_TASK_ALWAYS_EAGER,
    worker_prefetch_multiplier=settings.CELERY_WORKER_PREFETCH_MULTIPLIER,
)

@celery_app.task
def process_qas_task(file_addresses: list[str], task_id: str):

    try:
        # Call to study_friend here
        # json_payload = produce_QAs(file_addresses, task_id)
        time.sleep(10)

        json_payload = {
            "status": config('TASK_STATUS_SUCCESS'),
            "task_id": task_id,
            "markdown_content": "# ✅ Task Completed\nHere is your result."
        }
    except Exception as e:
        json_payload = {
            "status": config('TASK_STATUS_FAILED'),
            "task_id": task_id,
            "error_message": str(e)
        }
    
    return json_payload
