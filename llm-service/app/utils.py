from celery import Task
from app.settings import settings
from app import redis_client
import os

def validate_files_exist(file_paths):
    """
    To mimic the behavior of LLM Q&A generation, thi function
    Checks whether all provided file paths exist inside the base_dir
    """
    for path in file_paths:
        if not os.path.isfile(f"{settings.BASE_DIR}/{path}"):
            raise Exception("File not found: {}".format(path))
    return "# ✅ Task Completed\nHere is your result."


class BaseTaskWithFailureHandler(Task):
    """
    Base task class that handles failures by marking the result as leftover
    in Redis. This is useful for tasks that have their results stored in Redis
    but have not been transferred to the backend.
    """
    def on_failure(self, exc, task_id, args, kwargs, einfo):

        ### These are the arguments passed to the original task
        ## args[0] = file_addresses
        ## args[1] = task_id
        app_task_id = args[1] if len(args) > 1 else None
        json_payload = redis_client.get_json(app_task_id)
        if json_payload:
            json_payload[settings.MARK_LEFTOVER_RESULT_KEY] = True
            redis_client.set_json(app_task_id, json_payload, expire_seconds=settings.ASYNC_JOB_TIMEOUT)


def mark_task_as_dangling(task_id):
    json_payload = redis_client.get_json(task_id)
    if json_payload:
        json_payload[settings.MARK_DANGLING_RESULT_KEY] = True
        redis_client.set_json(task_id, json_payload, expire_seconds=settings.ASYNC_JOB_TIMEOUT)