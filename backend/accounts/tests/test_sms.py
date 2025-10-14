# pylint: disable=E0401,E1101
from django.test import TestCase, override_settings
from accounts.sms import send_otp
from accounts.models import PhoneOTP


class SMSHelperTests(TestCase):
    def test_send_otp_success(self):
        calls = []

        def fake_sender(phone, message):
            calls.append((phone, message))
            return True

        with override_settings(SMS_SENDER=fake_sender):
            result = send_otp("+15551234567")
            self.assertTrue(result)
            # OTP entry should be created
            self.assertEqual(PhoneOTP.objects.filter(phone="+15551234567").count(), 1)

    def test_send_otp_fallback_on_failure(self):
        # No SMS_SENDER configured: send_otp should return False but still
        # persist an OTP in DB as fallback
        result = send_otp("+15559876543")
        self.assertFalse(result)
        self.assertEqual(PhoneOTP.objects.filter(phone="+15559876543").count(), 1)
