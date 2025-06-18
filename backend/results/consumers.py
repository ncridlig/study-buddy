from channels.generic.websocket import AsyncJsonWebsocketConsumer
from results.mixins import JWTConsumerAuthMixin


class TaskStatusConsumer(JWTConsumerAuthMixin, AsyncJsonWebsocketConsumer):
    async def connect(self):
        await super().connect()
        if self.scope["user"].is_authenticated:
            self.group_name = f"user_{self.scope['user'].id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def task_update(self, event):
        await self.send_json({
            "type": "task_update",
            "task_id": event["task_id"],
            "status": event["status"]
        })

