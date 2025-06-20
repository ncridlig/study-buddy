from pydantic.v1 import BaseSettings
from datetime import timedelta
from decouple import config

class Settings(BaseSettings):
    DJANGO_SETTINGS_MODULE: str = ""
    REDIS_HOST: str = config('REDIS_HOST', default='localhost')

    @property
    def CELERY_BROKER_URL(self):
        return f"redis://{self.REDIS_HOST}:6379/0"

    @property
    def CELERY_RESULT_BACKEND(self):
        return f"redis://{self.REDIS_HOST}:6379/0"

    CELERY_TASK_SERIALIZER: str = "json"
    CELERY_RESULT_SERIALIZER: str = "json"
    CELERY_ACCEPT_CONTENT: list[str] = ["json"]
    CELERY_RESULT_EXPIRES: int = timedelta(days=1).total_seconds()
    CELERY_TIMEZONE: str = "UTC"
    CELERY_TASK_ALWAYS_EAGER: bool = False
    CELERY_WORKER_PREFETCH_MULTIPLIER: int = 4

settings = Settings()
