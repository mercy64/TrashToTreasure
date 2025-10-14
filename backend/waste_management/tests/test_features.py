from django.test import TestCase
from django.contrib.auth import get_user_model
from waste_management.models import WasteListing, WastePrice
from django.urls import reverse
from rest_framework.test import APIClient


User = get_user_model()


class WasteFeaturesTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.generator = User.objects.create_user(
            username="gen", password="pass", role="waste_generator", phone="12345", location="Loc"
        )
        self.generator.is_verified = True
        self.generator.save()
        self.recycler = User.objects.create_user(
            username="rec", password="pass", role="buyer", phone="54321", location="Loc"
        )
        self.recycler2 = User.objects.create_user(
            username="rec2", password="pass", role="buyer", phone="99999", location="Loc"
        )
        self.listing = WasteListing.objects.create(
            title="Test",
            description="d",
            type="plastic",
            quantity=10,
            unit="kg",
            location="Loc",
            price_per_unit=5.0,
            user=self.generator,
            latitude=1.0,
            longitude=1.0,
        )

    def test_claim_concurrency(self):
        # both recyclers try to claim; only one should succeed
        self.client.force_authenticate(user=self.recycler)
        resp1 = self.client.post(
            reverse("waste_management:claim-listing", args=[self.listing.id])
        )
        self.client.force_authenticate(user=None)

        self.client.force_authenticate(user=self.recycler2)
        resp2 = self.client.post(
            reverse("waste_management:claim-listing", args=[self.listing.id])
        )
        self.client.force_authenticate(user=None)

        # One should be 200 and the other 409
        statuses = {resp1.status_code, resp2.status_code}
        self.assertIn(200, statuses)
        self.assertIn(409, statuses)

    def test_price_estimate(self):
        WastePrice.objects.create(type="plastic", price_per_unit=2.5, unit="kg", active=True)
        resp = self.client.post(
            reverse("waste_management:waste-prices"),
            {"type": "plastic", "quantity": 4, "unit": "kg"},
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(float(data["estimated_total"]), 10.0)

    def test_route_assignment(self):
        # create multiple listings
        for i in range(3):
            WasteListing.objects.create(
                title=f"T{i}",
                description="d",
                type="plastic",
                quantity=1,
                unit="kg",
                location="Loc",
                price_per_unit=1.0,
                user=self.generator,
                latitude=1.0 + i * 0.01,
                longitude=1.0 + i * 0.01,
            )
        # create a delivery user and login
        delivery = User.objects.create_user(
            username="del", password="pass", role="delivery", phone="111", location="Loc"
        )
        self.client.force_authenticate(user=delivery)
        resp = self.client.post(
            reverse("waste_management:assign-route"),
            {"collector_id": delivery.id, "max_count": 2},
            format="json",
        )
        self.client.force_authenticate(user=None)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("ordered_listing_ids", data)
        self.assertLessEqual(len(data["ordered_listing_ids"]), 2)
