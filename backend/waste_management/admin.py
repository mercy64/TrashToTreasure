from django.contrib import admin
from .models import WasteListing, WasteImage, Transaction
from .models import WastePrice, CollectionRoute
from .models import MaterialFamily


class WasteImageInline(admin.TabularInline):
    model = WasteImage
    extra = 1


@admin.register(WasteListing)
class WasteListingAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "type",
        "quantity",
        "unit",
        "price_per_unit",
        "status",
        "user",
        "claimed_by",
        "assigned_to",
        "created_at",
    )
    list_filter = ("type", "status", "created_at")
    search_fields = ("title", "description", "location", "user__username")
    inlines = [WasteImageInline]
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Basic Information", {"fields": ("title", "description", "type", "user")}),
        ("Quantity & Pricing", {"fields": ("quantity", "unit", "price_per_unit")}),
        ("Location", {"fields": ("location", "latitude", "longitude")}),
        ("Status", {"fields": ("status",)}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "listing",
        "buyer",
        "seller",
        "quantity",
        "total_amount",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "listing__title",
        "buyer__username",
        "seller__username",
        "payment_reference",
    )
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (
            "Transaction Details",
            {"fields": ("listing", "buyer", "seller", "quantity", "total_amount")},
        ),
        (
            "Payment & Delivery",
            {
                "fields": (
                    "status",
                    "payment_reference",
                    "delivery_address",
                    "pickup_date",
                )
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(WastePrice)
class WastePriceAdmin(admin.ModelAdmin):
    list_display = ("type", "price_per_unit", "unit", "active")
    list_filter = ("type", "unit", "active")


@admin.register(CollectionRoute)
class CollectionRouteAdmin(admin.ModelAdmin):
    list_display = ("collector", "created_at")
    readonly_fields = ("ordered_listing_ids", "created_at")


@admin.register(MaterialFamily)
class MaterialFamilyAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
    fieldsets = ((None, {"fields": ("name", "aliases", "description")}),)
