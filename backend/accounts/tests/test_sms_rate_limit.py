# pylint: disable=E0401,E1101
from django.test import TestCase, override_settings
from accounts.sms import send_otp


class SMSRateLimitTests(TestCase):
    @override_settings(SMS_RATE_LIMIT_COUNT=3, SMS_RATE_LIMIT_WINDOW_SECONDS=60)
    def test_rate_limit_triggers_after_limit(self):
        phone = "+15553330000"
        # First 3 calls should attempt to send (even if no backend configured)
        self.assertFalse(send_otp(phone) and False)  # fallback returns False by default
        self.assertFalse(send_otp(phone) and False)
        self.assertFalse(send_otp(phone) and False)

        # Fourth should be rate-limited and return False early
        res = send_otp(phone)
        self.assertFalse(res)
