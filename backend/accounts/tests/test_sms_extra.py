# pylint: disable=E0401,E1101
from django.test import TestCase
from accounts.sms import send_otp, verify_otp
from accounts.models import PhoneOTP
from django.utils import timezone
from datetime import timedelta


class SMSExtraTests(TestCase):
    def test_verify_otp_marks_used_and_succeeds(self):
        phone = "+15550001111"
        send_otp(phone)
        otp = PhoneOTP.objects.filter(phone=phone).order_by("-created_at").first()
        assert otp is not None

        ok = verify_otp(phone, otp.code)
        self.assertTrue(ok)

        otp.refresh_from_db()
        self.assertTrue(otp.used)

    def test_verify_otp_fails_when_expired(self):
        phone = "+15550002222"
        send_otp(phone)
        otp = PhoneOTP.objects.filter(phone=phone).order_by("-created_at").first()
        assert otp is not None

        # Simulate expiry by moving created_at back
        otp.created_at = timezone.now() - timedelta(seconds=10000)
        otp.save(update_fields=["created_at"])

        ok = verify_otp(phone, otp.code, expiry_seconds=300)
        self.assertFalse(ok)
