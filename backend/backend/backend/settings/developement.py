from .base import *


DEBUG = True

ALLOWED_HOSTS = ['*']

# Database(s)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'cycle',
        'USER': 'postgres', 
        'PASSWORD': '...',  # Replace with your actual password
        'HOST': '127.0.0.1', 
        'PORT': '5432',
    }
}
