import os
from celery import shared_task
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from topics.models import UploadedFile
from results.models import QAGenerationTask
from results.utils import notify_task_status
import requests

@shared_task
def send_to_llm_service(task_id):
    try:
        task = QAGenerationTask.objects.select_related('topic').get(id=task_id)
    except ObjectDoesNotExist:
        return

    task.status = settings.PROCESSING
    task.save()

    notify_task_status(task)

    topic = task.topic
    files = UploadedFile.objects.filter(topic=topic).order_by('order')

    # --- START: THE FIX IS HERE --- (this is Gemini -Nicolas )

    # Define the absolute path of the mount point inside the container.
    # It's best practice to define this in settings.py if it's used elsewhere.
    SHARED_VOLUME_MOUNT_POINT = "/media-volume"

    # Use f.file.name to get the relative path within the bucket.
    # Then, join it with the mount point to create an absolute path
    # that the llm-worker can use directly.
    file_refs = [os.path.join(SHARED_VOLUME_MOUNT_POINT, f.file.name) for f in files]

    # --- END: THE FIX ---

    # Get file paths or URLs (depends on GCS/local) 
    # There need to be a mechanism with attention to a env variable to switch between local and GCS
    # file_refs = [f.file.url for f in files]  # adjust if using signed GCS URLs

    payload = {
        "task_id": task.id,
        "files": file_refs
    }

    try:
        res = requests.post(settings.LLM_SERVICE_URL, json=payload, timeout=10)
        res.raise_for_status()
    except Exception as e:
        task.status = 'FAILED'
        task.error_message = str(e)
        task.save()

