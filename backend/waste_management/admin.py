from django.contrib import admin
from .models import WasteListing, WasteImage, Transaction


class WasteImageInline(admin.TabularInline):
    model = WasteImage
    extra = 1


@admin.register(WasteListing)
class WasteListingAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "quantity", "unit", "price_per_unit", "status", "user", "created_at")
    list_filter = ("type", "status", "created_at")
    search_fields = ("title", "description", "location", "user__username")
    inlines = [WasteImageInline]
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Basic Information", {"fields": ("title", "description", "type", "user")}),
        ("Quantity & Pricing", {"fields": ("quantity", "unit", "price_per_unit")}),
        ("Location", {"fields": ("location", "latitude", "longitude")}),
        ("Status", {"fields": ("status",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("listing", "buyer", "seller", "quantity", "total_amount", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("listing__title", "buyer__username", "seller__username", "payment_reference")
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Transaction Details", {"fields": ("listing", "buyer", "seller", "quantity", "total_amount")}),
        ("Payment & Delivery", {"fields": ("status", "payment_reference", "delivery_address", "pickup_date")}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )
