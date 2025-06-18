from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def notify_task_status(task):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{task.topic.user.id}",
        {
            "type": "task_update",
            "task_id": task.id,
            "status": task.status
        }
    )