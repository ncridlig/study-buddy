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

    if settings.ON_clOUD:
        file_refs = [os.path.join(f'/{settings.GS_BUCKET_MEDIA_NAME}', f.file.name) for f in files]
    else:
        file_refs = [f.file.url for f in files]

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

