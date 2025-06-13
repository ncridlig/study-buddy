import redis
from decouple import config
import os


os.environ.setdefault('DJANGO_SETTINGS_MODULE', config('DJANGO_SETTINGS_MODULE'))

class RedisClient:
    def __init__(self):
        host = 'localhost' if config('DJANGO_SETTINGS_MODULE') == 'study.settings.developement' else config('REDIS_HOST')
        self.db = redis.Redis(host=host, port=6379, db=1)

    def check_key_value_validity(self, key, value):
        try:
            db_value = self.db.get(str(key))
            if db_value is None:
                return False
            return db_value.decode("utf-8") == value
        except (redis.exceptions.RedisError, AttributeError):
            return False

    def check_key_existance(self, key):
        return self.db.exists(str(key)) > 0

    def set_key(self, key, value, ex=None):
        self.db.set(str(key), str(value), ex=ex)

    def delete_key(self, key):
        self.db.delete(str(key))


redis_client = RedisClient()
