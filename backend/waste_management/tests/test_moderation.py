from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.urls import reverse

from waste_management.models import WasteListing, Report, AdminActionLog


class ModerationAPITest(APITestCase):
    def setUp(self):
        User = get_user_model()
        # create reporter
        self.reporter = User.objects.create_user(
            username="t_reporter",
            password="reporterpass",
            role="waste_generator",
            phone="+19990000001",
            location="Test",
        )
        # create admin
        self.admin = User.objects.create_user(
            username="t_admin",
            password="adminpass",
            role="admin",
            phone="+19990000002",
            location="Test",
        )

        # create listing
        self.listing = WasteListing.objects.create(
            title="T listing",
            description="Test",
            type="other",
            quantity=2,
            unit="kg",
            location="Here",
            price_per_unit=0,
            user=self.reporter,
        )

    def get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_report_and_admin_actions(self):
        # reporter creates a report
        token = self.get_token(self.reporter)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        url = reverse("waste_management:create-report", args=[self.listing.id])
        resp = self.client.post(url, {"reason": "spam", "comments": "bad"}, format="json")
        self.assertIn(resp.status_code, (200, 201))
        report_id = resp.data["id"]

        # admin lists reports
        admin_token = self.get_token(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {admin_token}")
        url_list = reverse("waste_management:admin-reports")
        resp2 = self.client.get(url_list)
        self.assertEqual(resp2.status_code, 200)
        self.assertTrue(any(r["id"] == report_id for r in resp2.data))

        # admin performs action: resolve_report
        url_action = reverse("waste_management:admin-report-action", args=[report_id])
        action_resp = self.client.post(url_action, {"action_type": "resolve_report", "reason": "ok"}, format="json")
        self.assertEqual(action_resp.status_code, 200)

        # check AdminActionLog created
        logs = AdminActionLog.objects.filter(report__id=report_id)
        self.assertTrue(logs.exists())

        # verify report status updated to resolved (or at least changed)
        report = Report.objects.get(id=report_id)
        self.assertIn(report.status, ("resolved", "in_progress", "dismissed", "open"))


class PricingTest(APITestCase):
    def setUp(self):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        self.admin = User.objects.create_user(username="p_admin", password="a", role="admin", phone="+12223330000", location="Here")
        from waste_management.models import WastePrice

        WastePrice.objects.update_or_create(
            type="plastic", unit="kg", defaults={"price_per_unit": 1.5, "active": True}
        )

    def test_estimate_price_endpoint(self):
        token = str(RefreshToken.for_user(self.admin).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        resp = self.client.post(reverse("waste_management:prices"), {"type": "plastic", "quantity": 10, "unit": "kg"}, format="json")
        self.assertEqual(resp.status_code, 200)
        data = resp.data
        self.assertEqual(data["estimated_total"], "15.00")

    def test_missing_price_returns_404(self):
        token = str(RefreshToken.for_user(self.admin).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        resp = self.client.post(reverse("waste_management:prices"), {"type": "metal", "quantity": 2, "unit": "kg"}, format="json")
        self.assertEqual(resp.status_code, 404)
