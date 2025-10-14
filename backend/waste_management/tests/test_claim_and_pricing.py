from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User
from waste_management.models import WasteListing, WastePrice


class ClaimAndPricingTests(APITestCase):
    def setUp(self):
        self.user_seller = User.objects.create_user(
            username="seller",
            password="pass",
            phone="1234567890",
            role="waste_generator",
            location="Loc",
        )
        self.user_buyer = User.objects.create_user(
            username="buyer",
            password="pass",
            phone="0987654321",
            role="buyer",
            location="Loc",
        )
        self.listing = WasteListing.objects.create(
            title="Test",
            description="desc",
            type="plastic",
            quantity=10,
            unit="kg",
            location="Loc",
            price_per_unit=15.0,
            user=self.user_seller,
        )
        WastePrice.objects.create(
            type="plastic", price_per_unit=12.5, unit="kg", active=True
        )

    def test_claim_listing(self):
        self.client.force_authenticate(user=self.user_buyer)
        url = reverse("waste_management:claim-listing", args=[self.listing.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.claimed_by, self.user_buyer)
        self.assertEqual(self.listing.status, "reserved")

    def test_price_estimate(self):
        url = reverse("waste_management:waste-prices")
        resp = self.client.post(
            url, {"type": "plastic", "quantity": 3, "unit": "kg"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertIn("estimated_total", data)
        self.assertEqual(float(data["estimated_total"]), 37.5)
