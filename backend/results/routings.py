from django.urls import path
from results import consumers



websocket_urlpatterns = [
    path('ws/task/status/', consumers.TaskStatusConsumer.as_asgi(), name='ws-task-status'),
]