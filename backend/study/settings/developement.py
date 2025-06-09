from .base import *
from decouple import config 


DEBUG = True

ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True

# Database(s)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('LOCAL_NAME'),
        'USER': config('LOCAL_USER'),
        'PASSWORD': config('LOCAL_PASSWORD'),
        'HOST': config('LOCAL_HOST'), 
        'PORT': config('LOCAL_PORT')
    }
}
