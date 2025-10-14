from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ("waste_generator", "Waste Generator"),
        ("buyer", "Buyer/Recycler"),
        ("delivery", "Delivery Personnel"),
        ("admin", "Administrator"),
    ]

    phone = models.CharField(max_length=15, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    location = models.CharField(max_length=255)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} - {self.role}"


class GeneratorProfile(models.Model):
    """Additional profile information for waste generators."""

    user = models.OneToOneField(
        "User", on_delete=models.CASCADE, related_name="generator_profile"
    )
    organization = models.CharField(max_length=200, blank=True)
    contact_person = models.CharField(max_length=200, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    generator_type = models.CharField(
        max_length=50,
        choices=[
            ("household", "Household"),
            ("business", "Business"),
            ("institution", "Institution"),
            ("other", "Other"),
        ],
        default="household",
    )
    notes = models.TextField(blank=True)
    verified_by_admin = models.BooleanField(default=False)

    def __str__(self):
        return f"GeneratorProfile: {self.user.username}"


class RegistrationAttempt(models.Model):
    ip_address = models.CharField(max_length=45, null=True, blank=True)
    email = models.EmailField(max_length=254, null=True, blank=True)
    phone = models.CharField(max_length=32, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(
                fields=["ip_address", "created_at"], name="accounts_re_ip_c5b9c6_idx"
            )
        ]

    def __str__(self):
        return f"RegAttempt {self.ip_address} {self.created_at}"


class ProfileFlag(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("reviewed", "Reviewed"),
        ("rejected", "Rejected"),
    ]

    reason = models.TextField()
    auto_flag = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reported_user = models.ForeignKey(
        "User", related_name="flags", on_delete=models.CASCADE
    )
    reporter = models.ForeignKey(
        "User", related_name="reports", null=True, blank=True, on_delete=models.SET_NULL
    )
    reviewed_by = models.ForeignKey(
        "User",
        related_name="reviewed_flags",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    def __str__(self):
        return f"Flag {self.reported_user} - {self.status}"


class FraudScore(models.Model):
    user = models.OneToOneField(
        "User", related_name="fraud_score", on_delete=models.CASCADE
    )
    score = models.FloatField(default=0.0)
    reasons = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"FraudScore {self.user}: {self.score}"


class PhoneOTP(models.Model):
    phone = models.CharField(max_length=32)
    code = models.CharField(max_length=8)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    class Meta:
        # Keep index name <= 30 chars to satisfy database backend limits
        indexes = [
            models.Index(
                fields=["phone", "created_at"], name="accounts_ph_phone_created_idx"
            )
        ]

    def __str__(self):
        return f"PhoneOTP {self.phone} @ {self.created_at}"
