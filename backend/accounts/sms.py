"""OTP send/verify helpers for accounts.

This module provides send_otp and verify_otp used by tests and views.
"""
import random
from datetime import timedelta

from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

from .models import PhoneOTP  # pylint: disable=E1101


def _send_direct(phone: str, message: str) -> bool:
    """Attempt to send SMS via configured backend.

    This is a thin abstraction so tests can patch it. In production this
    would call Twilio or another provider.
    """
    sender = getattr(settings, "SMS_SENDER", None)
    if callable(sender):
        return bool(sender(phone, message))
    # No backend configured: simulate failure
    return False


def _generate_code(length: int = 6) -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(length))


def send_otp(phone: str) -> bool:
    """Generate an OTP, persist it, and attempt to send it.

    Returns True if the SMS was sent successfully via the direct sender,
    False if sending failed (but OTP is still saved to DB as fallback).
    """
    code = _generate_code()
    # Rate limiting (cache-backed). Settings controls limits so tests can override.
    limit = getattr(settings, "SMS_RATE_LIMIT_COUNT", 5)
    window = getattr(settings, "SMS_RATE_LIMIT_WINDOW_SECONDS", 60)
    key = f"sms_rl:{phone}"
    current = cache.get(key, 0)
    if current >= limit:
        # Rate-limited: do not persist or send
        return False

    # Persist OTP for fallback/verification
    PhoneOTP.objects.create(phone=phone, code=code)
    # increment counter with TTL
    if cache.get(key) is not None:
        try:
            cache.incr(key)
        except (AttributeError, NotImplementedError, ValueError):
            # Some cache backends may not implement incr or the value
            # may not be an int; fallback to set
            cache.set(key, int(cache.get(key)) + 1, timeout=window)
    else:
        cache.set(key, 1, timeout=window)

    message = f"Your verification code is: {code}"
    try:
        sent = _send_direct(phone, message)
        return bool(sent)
    except Exception:  # pylint: disable=broad-except
        # On error from the external sender, leave OTP in DB and report failure.
        # We intentionally catch all exceptions here because failures can come
        # from many different provider-specific errors; tests mock the sender.
        return False


def verify_otp(phone: str, code: str, expiry_seconds: int = 300) -> bool:
    """Verify an OTP code for a phone number.

    Returns True if the code is valid (not used and not expired). Marks the
    OTP as used on success. Returns False otherwise.
    """
    # Look for the most-recent unused matching OTP for this phone
    otp_qs = PhoneOTP.objects.filter(phone=phone, code=code, used=False).order_by("-created_at")
    otp = otp_qs.first()
    if not otp:
        return False

    # Check expiry
    if (timezone.now() - otp.created_at) > timedelta(seconds=expiry_seconds):
        return False

    # Mark used and save
    otp.used = True
    otp.save(update_fields=["used"])
    return True
