from django.core.asgi import get_asgi_application
import django
import os
from decouple import config 


os.environ.setdefault('DJANGO_SETTINGS_MODULE', config('DJANGO_SETTINGS_MODULE'))
django.setup()
application = get_asgi_application()
