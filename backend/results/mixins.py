from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from channels.db import database_sync_to_async

import jwt


class JWTAuthMixin:
    model = get_user_model()

    @database_sync_to_async
    def get_user(self, access_token):
        try:
            if not access_token:
                raise AuthenticationFailed(_("Invalid token."))

            user_id = jwt.decode(access_token, settings.SECRET_KEY, algorithms=["HS256"])["user_id"]
            user = self.model.objects.get(id=user_id)
            return user
        except (jwt.exceptions.DecodeError, self.model.DoesNotExist, KeyError) as e:
            raise AuthenticationFailed(_("Invalid token.")) from e

    async def authenticate(self, scope):
        headers_dict = dict(scope["headers"])
        cookies_str = headers_dict.get(b"cookie", b"").decode()
        cookies = {}
        for cookie in cookies_str.split("; "):
            if "=" in cookie:
                k, v = cookie.split("=", 1)
                cookies[k] = v
        access_token = cookies.get("access_token")
        scope["user"] = await self.get_user(access_token)


class JWTConsumerAuthMixin(JWTAuthMixin):
    async def connect(self):
        try:
            await self.authenticate(self.scope)
            if self.scope['user'].is_anonymous:
                await self.close(code=4001)
                return
        except AuthenticationFailed:
            await self.close(code=4001)
            return

