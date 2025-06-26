from celery import Task
from app.settings import settings
from app import redis_client
import os

def validate_files_exist(file_paths):
    """
    Checks whether all provided file paths exist inside BASE_DIR.

    Args:
        file_paths (list of str): Relative paths to check.

    Returns:
        bool: True if all files exist, otherwise raises an exception.
    """
    base_dir = os.path.abspath(settings.BASE_DIR)

    for relative_path in file_paths:
        full_path = os.path.abspath(os.path.join(base_dir, relative_path))

        # Safety check: prevent path traversal attacks outside BASE_DIR
        if not full_path.startswith(base_dir):
            raise Exception(f"Unsafe file path detected: {relative_path}")

        if not os.path.isfile(full_path):
            raise Exception(f"File not found: {relative_path}")

    return True


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