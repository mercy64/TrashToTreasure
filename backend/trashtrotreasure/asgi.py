import importlib.util
import os
from django.core.asgi import get_asgi_application


# Minimal ASGI app that optionally wires Django Channels routing if available.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "trashtrotreasure.settings")

django_asgi_app = get_asgi_application()

if importlib.util.find_spec("channels") is not None:
    try:
        from channels.routing import ProtocolTypeRouter, URLRouter
        from channels.auth import AuthMiddlewareStack
        from waste_management import routing as waste_routing  # type: ignore

        application = ProtocolTypeRouter({
            "http": django_asgi_app,
            "websocket": AuthMiddlewareStack(
                URLRouter(waste_routing.websocket_urlpatterns)
            ),
        })
    except Exception:
        # If Channels or routing import fails at runtime, use the plain Django ASGI app
        application = django_asgi_app
else:
    application = django_asgi_app
