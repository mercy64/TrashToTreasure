from django.urls import re_path

from .consumers import NotificationConsumer


websocket_urlpatterns = [
    re_path(r"ws/notifications/$", NotificationConsumer.as_asgi()),
]


class JwtAuthMiddleware:
    """ASGI middleware that authenticates a user from a Simple JWT access
    token provided in the querystring as ?token=<access_token> or via an
    Authorization header (Bearer <token>) inside the scope headers.

    This middleware is async and safe to use in Channels' ProtocolTypeRouter.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        from urllib.parse import parse_qs
        from django.conf import settings
        from django.contrib.auth import get_user_model
        from django.contrib.auth.models import AnonymousUser
        from rest_framework_simplejwt.backends import TokenBackend
        from asgiref.sync import sync_to_async

        token = None
        # Querystring token
        q = scope.get("query_string", b"").decode()
        params = parse_qs(q)
        if params.get("token"):
            token = params.get("token")[0]

        # Authorization header
        if not token:
            headers = dict((k.decode().lower(), v.decode()) for k, v in scope.get("headers", []))
            auth = headers.get("authorization")
            if auth and auth.lower().startswith("bearer "):
                token = auth.split(" ", 1)[1]

        User = get_user_model()
        user = AnonymousUser()

        if token:
            try:
                alg = getattr(settings, 'SIMPLE_JWT', {}).get('ALGORITHM', 'HS256')
                tb = TokenBackend(algorithm=alg, signing_key=settings.SECRET_KEY)
                payload = tb.decode(token, verify=True)
                uid = payload.get('user_id') or payload.get('user')
                if uid:
                    # fetch user in thread-safe manner
                    try:
                        user = await sync_to_async(User.objects.get)(id=uid)
                    except Exception:
                        user = AnonymousUser()
            except Exception:
                user = AnonymousUser()

        scope['user'] = user
        return await self.app(scope, receive, send)


def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(inner)
