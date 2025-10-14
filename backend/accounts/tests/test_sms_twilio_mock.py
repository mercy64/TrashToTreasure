# pylint: disable=E0401,E1101
from django.test import TestCase, override_settings
from accounts.sms import send_otp


class SMSTwilioMockTests(TestCase):
    def test_twilio_sender_success_and_failure(self):
        calls = []

        def fake_twilio(phone, message):
            calls.append((phone, message))
            return True

        with override_settings(SMS_SENDER=fake_twilio):
            sent = send_otp("+15554445555")
            self.assertTrue(sent)
            self.assertEqual(len(calls), 1)

        # Simulate failing sender
        def fake_fail(phone, message):
            raise RuntimeError("down")

        with override_settings(SMS_SENDER=fake_fail):
            sent = send_otp("+15554449999")
            self.assertFalse(sent)
