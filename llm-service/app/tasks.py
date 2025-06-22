from celery import Celery
from app.settings import settings
from app.utils import validate_files_exist, BaseTaskWithFailureHandler
from app import redis_client
import time
import requests

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

@celery_app.task(
        bind=True,
        base=BaseTaskWithFailureHandler,
        max_retries=settings.ASYNC_JOB_MAX_RETRIES, # the task runs a total of (max_retries + 1) times
        default_retry_delay=settings.ASYNC_JOB_RETRY_DELAY
        )
def process_qas_task(self, file_addresses: list[str], task_id: str):

    json_payload = redis_client.get_json(task_id)
    if not(json_payload):
        try:
            ####### Call to study_friend here #######
            # json_payload = produce_QAs(file_addresses, task_id)
            time.sleep(10)
            markdown_content = validate_files_exist(file_addresses)
            #########################################
            json_payload = {
                "success": True,
                "task_id": task_id,
                "markdown_content": markdown_content
            }
        except Exception as e:
            json_payload = {
                "success": False,
                "task_id": task_id,
                "error_message": str(e)
            }

        redis_client.set_json(task_id, json_payload)

    try:
        response = requests.post(settings.BACKEND_URL, json=json_payload)
        response.raise_for_status()
        redis_client.delete_key(task_id)
        print(f"Callback for task {task_id} → {response.status_code}")
    except requests.RequestException as exc:
        raise self.retry(exc=exc)

