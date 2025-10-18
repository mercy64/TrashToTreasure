from django.db import models
from django.conf import settings


class WasteListing(models.Model):
    WASTE_TYPES = [
        ("plastic", "Plastic"),
        ("paper", "Paper"),
        ("metal", "Metal"),
        ("glass", "Glass"),
        ("electronic", "Electronic"),
        ("organic", "Organic"),
        ("textile", "Textile"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("available", "Available"),
        ("reserved", "Reserved"),
        ("sold", "Sold"),
        ("expired", "Expired"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=WASTE_TYPES)
    quantity = models.FloatField()
    unit = models.CharField(max_length=10, default="kg")
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="available"
    )
    # recycler who has claimed/reserved this listing (prevents multiple recyclers coming)
    claimed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="claims",
        on_delete=models.SET_NULL,
    )
    # delivery personnel assigned to pick this listing (optional)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="assigned_pickups",
        on_delete=models.SET_NULL,
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.user.username}"


class WasteImage(models.Model):
    listing = models.ForeignKey(
        WasteListing, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="waste_images/")
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.listing.title}"


class Transaction(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    listing = models.ForeignKey(WasteListing, on_delete=models.CASCADE)
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="purchases"
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sales"
    )
    quantity = models.FloatField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    payment_reference = models.CharField(max_length=100, blank=True)
    delivery_address = models.TextField(blank=True)
    pickup_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Transaction: {self.listing.title} - {self.buyer.username}"


class WastePrice(models.Model):
    """Price configuration per waste type. Admins can update these to set market prices.

    Use this to provide suggested pricing and to calculate estimates.
    """

    type = models.CharField(max_length=20, choices=WasteListing.WASTE_TYPES)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, default="kg")
    active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("type", "unit")

    def __str__(self):
        return f"{self.type} - {self.price_per_unit}/{self.unit}"


class CollectionRoute(models.Model):
    """Stores a computed/created route for a collector.

    The ordered_listing_ids JSON field keeps the ordering determined by the
    route optimization algorithm. Listings referenced are expected to exist
    at creation time; the model is mainly for simple persistence of assignments.
    """

    collector = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="routes",
    )
    ordered_listing_ids = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Route for {self.collector.username} @ {self.created_at}"


class Report(models.Model):
    """User-submitted report about a WasteListing (e.g. inappropriate content, spam)."""

    STATUS_CHOICES = [
        ("open", "Open"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("dismissed", "Dismissed"),
    ]

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="waste_reports",
    )
    listing = models.ForeignKey(WasteListing, on_delete=models.CASCADE, related_name="reports")
    reason = models.CharField(max_length=100)
    comments = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Report {getattr(self, 'id', 'unknown')} on {self.listing} by {self.reporter}"


class AdminActionLog(models.Model):
    """Audit log for admin moderation actions on listings and reports."""

    ACTION_CHOICES = [
        ("remove_listing", "Remove Listing"),
        ("restore_listing", "Restore Listing"),
        ("resolve_report", "Resolve Report"),
        ("dismiss_report", "Dismiss Report"),
        ("other", "Other"),
    ]

    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="admin_actions"
    )
    listing = models.ForeignKey(WasteListing, on_delete=models.SET_NULL, null=True, blank=True)
    report = models.ForeignKey(Report, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=50, choices=ACTION_CHOICES)
    reason = models.CharField(max_length=200, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action_type} by {self.admin} @ {self.created_at}"


class MaterialFamily(models.Model):
    """A grouping of related material types (e.g., plastic: hdpe, pet, pp).

    Admins can manage these families and map canonical aliases for family-based
    fallback pricing.
    """

    name = models.CharField(max_length=50, unique=True)
    aliases = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

