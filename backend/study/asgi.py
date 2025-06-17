import django
import os
from decouple import config 

os.environ.setdefault('DJANGO_SETTINGS_MODULE', config('DJANGO_SETTINGS_MODULE'))
django.setup()


from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from study.utils import all_websocket_urlpatterns
# from agents import routings as agents_routings
# from agents.middleware import CustomAuthMiddleWare


django_asgi_app = get_asgi_application()
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                all_websocket_urlpatterns
            )
        )
    ),
})
