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

    # Get file paths or URLs (depends on GCS/local) 
    # There need to be a mechanism with attention to a env variable to switch between local and GCS
    file_refs = [f.file.url for f in files]  # adjust if using signed GCS URLs

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

