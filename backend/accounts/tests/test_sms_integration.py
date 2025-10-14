from django.test import TestCase, override_settings
from django.urls import reverse


class SMSIntegrationTests(TestCase):
    @override_settings(SMS_RATE_LIMIT_COUNT=2, SMS_RATE_LIMIT_WINDOW_SECONDS=60)
    def test_send_otp_endpoint_rate_limit(self):
        url = reverse("accounts:send-otp")
        data = {"phone": "+15557770000"}

        resp1 = self.client.post(url, data, content_type="application/json")
        self.assertIn(resp1.status_code, (200, 201, 202))

        resp2 = self.client.post(url, data, content_type="application/json")
        self.assertIn(resp2.status_code, (200, 201, 202))

        resp3 = self.client.post(url, data, content_type="application/json")
        self.assertEqual(resp3.status_code, 429)

    def test_send_otp_endpoint_with_mocked_sender(self):
        calls = []

        def fake_sender(phone, message):
            calls.append((phone, message))
            return True

        url = reverse("accounts:send-otp")
        with override_settings(SMS_SENDER=fake_sender):
            resp = self.client.post(url, {"phone": "+15558880000"}, content_type="application/json")
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(len(calls), 1)
