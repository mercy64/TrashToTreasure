from django.apps import AppConfig


class WasteManagementConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "waste_management"

    def ready(self):
        # Import signals to register handlers
        try:
            from . import signals  # noqa: F401
        except Exception:
            # In tests or some environments import may fail; ignore to avoid breaking startup
            pass
