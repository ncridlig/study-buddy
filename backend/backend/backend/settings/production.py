import sys
sys.path.append('/usr/src/app')

from backend.settings.base import *
from decouple import config 


DEBUG = config('DEBUG')

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]']


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

