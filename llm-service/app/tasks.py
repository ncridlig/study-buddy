from celery import Celery
from celery.utils.log import get_task_logger
from app.settings import settings
from app.utils import validate_files_exist, BaseTaskWithFailureHandler, mark_task_as_dangling
from app import redis_client
import time
import requests
import subprocess
from pathlib import Path
import json

logger = get_task_logger(__name__)
# python -m study_friend.query -d "/pdfs/" -o "/pdfs/out.md" -oi "/pdfs/images/"
# python -m study_friend.query -d '["/pdfs/AlexNet.pdf", "/pdfs/14 evaluation - testing.pdf"]' -o "/pdfs/out.md" -oi "/pdfs/images/"
# python -m study_friend.query -d '["data/14-humans.pdf", "data/10-InformationArchitecture.pdf"]' -oi 'data/images/' -o 'data/question-answer.md' --image_size 300
# python3.11 -m study_friend.query -d "/home/nicolas/Documents/pdfs" -o "/home/nicolas/Documents/pdfs/out.md" -oi "/home/nicolas/Documents/images"
# python3.11 -m study_friend.query -d '["/home/nicolas/Documents/pdfs/AlexNet.pdf", "/home/nicolas/Documents/pdfs/14 evaluation - testing.pdf"]' -o "/home/nicolas/Documents/pdfs/out.md" -oi "/home/nicolas/Documents/images"

def prepare_question_and_answers(files, task_id, **kwargs):
    try:
        print(f"Files: {files}, Task ID: {task_id}, kwargs: {kwargs}")

        dir_name = Path(f"data/task-{task_id}")

        image_size = str(kwargs.get("image_size", 300))
        verbose = kwargs.get("verbose", True)
        question_prompt = kwargs.get("question_prompt")
        answer_prompt = kwargs.get("answer_prompt")
        output_dir = kwargs.get("output_dir", dir_name)

        output_file = output_dir / "question-answer.md"
        print(f"image_size: {image_size}, verbose: {verbose}, question_prompt: {question_prompt}, answer_prompt: {answer_prompt}, outout_file: {output_file}")

        command = [
            "python", "-m", "study_friend.query",
            "-d", json.dumps(files),
            "-oi", str(dir_name),
            "-o", str(output_file),
            "--image_size", image_size
        ]

        if verbose:
            command.append("--verbose")
        
        if question_prompt:
            command.extend(["--question_prompt", question_prompt])

        if answer_prompt:
            command.extend(["--answer_prompt", answer_prompt])

        logger.info(f"[prepare_question_and_answers] Running command: {' '.join(command)}")
        
        try:
            result = subprocess.run(
                command,
                check=True,
                capture_output=True,
                text=True,
                timeout=3600  # 1 hour timeout, make into the same variable as ASYNC_JOB_TIMEOUT
            )
            if not output_file.exists():
                raise FileNotFoundError(f"Expected output file {output_file} not found.")
            
            logger.info(f"STDOUT:\n{result.stdout}")
            logger.warning(f"STDERR:\n{result.stderr}")
            
            return output_file.read_text(encoding="utf-8") # Markdown
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"study_friend query failed: {e.stderr}")
        except subprocess.TimeoutExpired:
            raise RuntimeError("study_friend query timed out")
    except Exception as e:
        logger.error(f"Error in prepare_question_and_answers: {e}", exc_info=True)
        return ""


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
def process_qas_task(self, file_addresses: list[str], task_id: str, **kwargs):

    json_payload = redis_client.get_json(task_id)
    if not(json_payload):
        try:
            ####### Call to study_friend here #######
            validate_files_exist(file_addresses)
            markdown_content = prepare_question_and_answers(files=file_addresses, task_id=task_id, **kwargs)
            #########################################
            json_payload = {
                "task_id": int(task_id),
                "markdown_content": str(markdown_content)
            }
        except Exception as e:
            json_payload = {
                "task_id": int(task_id),
                "markdown_content": str(f"ERROR occurred: {e}")
            }

        redis_client.set_json(task_id, json_payload)

    try:
        response = requests.post(settings.BACKEND_URL, json=json_payload)
        response.raise_for_status()
        logger.info(f"Response from backend for task {task_id}: {response.text} with status code {response.status_code}")
        if response.status_code in settings.VALID_RESPONSE_CODES:
            redis_client.delete_key(task_id)
        else:
            ## If the response code is not valid, mark the task as dangling
            ## This is just for saving the such tasks (if they happened in real scenarios, then we can think about handling them)
            logger.warning(f'Dangling task occurred for {task_id}: {response.text} with status code {response.status_code}')
            # mark_task_as_dangling(task_id)
    except requests.RequestException as exc:
        raise self.retry(exc=exc)

