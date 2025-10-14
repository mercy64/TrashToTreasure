"""Migrate Notification rows to messaging.Notification and remove old model."""

from django.conf import settings
from django.db import migrations


def forwards_func(apps, schema_editor):
    OldNotification = apps.get_model("waste_management", "Notification")
    NewNotification = apps.get_model("messaging", "Notification")

    # Copy all old notifications into messaging.Notification
    old_qs = OldNotification.objects.all()
    new_objs = []
    for old in old_qs:
        new = NewNotification(
            user_id=old.user_id,
            type="listing",
            title=old.title,
            message=old.message,
            is_read=old.read,
            created_at=old.created_at,
        )
        new_objs.append(new)

    if new_objs:
        NewNotification.objects.bulk_create(new_objs)


def reverse_func(apps, schema_editor):
    """Reverse the data copy: copy back messaging listing notifications into waste_management.Notification.

    This will only copy notifications with type 'listing' to avoid duplicating unrelated messages.
    """
    OldNotification = apps.get_model("waste_management", "Notification")
    NewNotification = apps.get_model("messaging", "Notification")

    to_copy = NewNotification.objects.filter(type="listing")
    old_objs = []
    for n in to_copy:
        old = OldNotification(
            user_id=n.user_id,
            title=n.title,
            message=n.message,
            read=n.is_read,
            created_at=n.created_at,
        )
        old_objs.append(old)

    if old_objs:
        OldNotification.objects.bulk_create(old_objs)


class Migration(migrations.Migration):

    dependencies = [
        ("waste_management", "0004_notification"),
        ("messaging", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(forwards_func, reverse_func),
        migrations.DeleteModel(name="Notification"),
    ]
