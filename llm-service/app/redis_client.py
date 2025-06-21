import redis
from app.settings import settings
import json


redis_conn = redis.Redis(
    host=settings.REDIS_HOST,
    port=6379,
    db=1,  # 0 was for celery
    decode_responses=True
)

def build_key(task_id):
    return f"task_with_id_{task_id}"

def set_json(key: str, data: dict, expire_seconds: int = None):
    redis_conn.set(build_key(key), json.dumps(data), ex=expire_seconds)

def get_json(key: str) -> dict | None:
    val = redis_conn.get(build_key(key))
    try:
        return json.loads(val) if val else None
    except json.JSONDecodeError:
        return None

def key_exists(key: str) -> bool:
    return redis_conn.exists(build_key(key)) == 1

def delete_key(key: str):
    redis_conn.delete(build_key(key))