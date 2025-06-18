import sys
sys.path.append('/usr/src/app')

from study.settings.base import *
from decouple import config 


DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="").split()

CORS_ALLOWED_ORIGINS = config("ALLOWED_ORIGINS", default="").split()

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('NAME'),
        'USER': config('USER'), 
        'PASSWORD': config('PASSWORD'),
        'HOST': config('HOST'),
        'PORT': config('PORT'),
    }
}

