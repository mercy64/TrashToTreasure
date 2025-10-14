# pylint: disable=E0401,E1101
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from waste_management.models import WasteListing
from accounts.models import GeneratorProfile
from django.urls import reverse
from decimal import Decimal

User = get_user_model()


class GeneratorProfileAndClaimTests(APITestCase):
    def setUp(self):
        self.gen_user = User.objects.create_user(
            username="gen", password="pass", phone="111", role="waste_generator"
        )
        self.recycler1 = User.objects.create_user(
            username="rec1", password="pass", phone="222", role="buyer"
        )
        self.recycler2 = User.objects.create_user(
            username="rec2", password="pass", phone="333", role="buyer"
        )

        self.listing = WasteListing.objects.create(
            title="Pile of plastic",
            description="Lots of bottles",
            type="plastic",
            quantity=10,
            unit="kg",
            price_per_unit=Decimal("0.50"),
            status="available",
            user=self.gen_user,
        )

    def test_generator_profile_create_and_update(self):
        self.client.force_authenticate(user=self.gen_user)
        url = reverse("accounts:generator-profile")
        # Create profile
        resp = self.client.post(
            url,
            {"organization": "MyOrg", "contact_person": "Me", "contact_phone": "111"},
            format="json",
        )
        self.assertIn(resp.status_code, (200, 201))
        profile = GeneratorProfile.objects.get(user=self.gen_user)
        self.assertEqual(profile.organization, "MyOrg")
        # Update profile
        resp2 = self.client.post(url, {"organization": "MyOrg2"}, format="json")
        self.assertIn(resp2.status_code, (200, 201))
        profile.refresh_from_db()
        self.assertEqual(profile.organization, "MyOrg2")

    def test_concurrent_claim_attempts(self):
        claim_url = reverse("waste_management:claim-listing", args=[self.listing.id])

        # First recycler claims
        self.client.force_authenticate(user=self.recycler1)
        resp1 = self.client.post(claim_url)

        # Second recycler attempts to claim after
        client2 = self.client_class()
        client2.force_authenticate(user=self.recycler2)
        resp2 = client2.post(claim_url)

        # One should succeed, the other should be a failure
        statuses = {resp1.status_code, resp2.status_code}
        self.assertTrue(any(s in (200, 201) for s in statuses))
        self.assertTrue(any(s not in (200, 201) for s in statuses))

        self.listing.refresh_from_db()
        claimed_user = self.listing.claimed_by
        self.assertIsNotNone(claimed_user)
