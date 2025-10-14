from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.core.mail import send_mail


from .models import WasteListing
try:
    # prefer the messaging app's Notification model to avoid duplicates
    from messaging.models import Notification as MessagingNotification
except Exception:
    MessagingNotification = None

try:
    # Reuse accounts.sms._send_direct like send_otp does by using the sender setting
    from accounts.sms import _send_direct as sms_send
except Exception:
    sms_send = None


def _notify_user(user, title, message):
    # Create in-app notification
    # Create notification in messaging app model when available to consolidate
    if MessagingNotification is not None:
        notif = MessagingNotification.objects.create(user=user, type="listing", title=title, message=message)
    else:
        # Fallback to local Notification model if messaging not present
        from .models import Notification as LocalNotification

        notif = LocalNotification.objects.create(user=user, title=title, message=message)
    # Also publish to channels group if available
    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        from .serializers import NotificationSerializer

        channel_layer = get_channel_layer()
        group = f"notifications_{user.id}"
        payload = NotificationSerializer(notif).data
        async_to_sync(channel_layer.group_send)(
            group, {"type": "send_notification", "notification": payload}
        )
    except Exception:
        # Channels may not be installed or import may fail in tests; ignore.
        pass
    # Send email if configured
    if getattr(settings, "EMAIL_NOTIFICATIONS", False):
        try:
            send_mail(title, message, settings.DEFAULT_FROM_EMAIL, [user.email])
        except Exception:
            pass
    # Send SMS if configured and phone available
    if sms_send and getattr(settings, "SMS_NOTIFICATIONS", False):
        try:
            phone = getattr(user, "phone", None)
            if phone:
                sms_send(phone, message)
        except Exception:
            pass


@receiver(post_save, sender=WasteListing)
def listing_change_notify(sender, instance: WasteListing, created, **kwargs):
    # Notify relevant parties when claimed, assigned, or unassigned
    # We detect state changes via fields on the instance; for reliable diffs,
    # callers may send explicit signals, but this simple approach handles the
    # common flows where claim/assign handlers saved the listing.
    if created:
        return

    # If listing has been claimed
    if instance.claimed_by:
        title = "Listing claimed"
        message = f"Your listing '{instance.title}' has been claimed by {instance.claimed_by.username}."
        _notify_user(instance.user, title, message)
        _notify_user(instance.claimed_by, "You claimed a listing", f"You claimed '{instance.title}'.")
        return

    # If listing has been assigned to a collector
    if instance.assigned_to:
        title = "Listing assigned"
        message = f"Listing '{instance.title}' was assigned to {instance.assigned_to.username}."
        _notify_user(instance.user, title, message)
        _notify_user(instance.assigned_to, title, message)
        return

    # If became unassigned/unclaimed, send an update to owner
    title = "Listing available"
    message = f"Listing '{instance.title}' is now available."
    _notify_user(instance.user, title, message)
