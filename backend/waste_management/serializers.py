from rest_framework import serializers
from .models import (
    WasteListing,
    WasteImage,
    Transaction,
    WastePrice,
    CollectionRoute,
    Report,
    AdminActionLog,
)
from .models import MaterialFamily


class WasteImageSerializer(serializers.ModelSerializer):  # type: ignore[override]
    class Meta:  # type: ignore
        model = WasteImage
        fields = ["id", "image", "caption", "created_at"]


class WasteListingSerializer(serializers.ModelSerializer):  # type: ignore[override]
    images = WasteImageSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField()
    claimed_by = serializers.SerializerMethodField()
    assigned_to = serializers.SerializerMethodField()

    class Meta:  # type: ignore
        model = WasteListing
        fields = [
            "id",
            "title",
            "description",
            "type",
            "quantity",
            "unit",
            "location",
            "latitude",
            "longitude",
            "price_per_unit",
            "status",
            "user",
            "claimed_by",
            "assigned_to",
            "images",
            "created_at",
            "updated_at",
        ]

    def get_claimed_by(self, obj):
        return str(obj.claimed_by) if obj.claimed_by else None

    def get_assigned_to(self, obj):
        return str(obj.assigned_to) if obj.assigned_to else None


class WasteListingCreateSerializer(serializers.ModelSerializer):  # type: ignore[override]
    class Meta:  # type: ignore
        model = WasteListing
        fields = [
            "title",
            "description",
            "type",
            "quantity",
            "unit",
            "location",
            "latitude",
            "longitude",
            "price_per_unit",
        ]


class WastePriceSerializer(serializers.ModelSerializer):  # type: ignore[override]
    class Meta:  # type: ignore
        model = WastePrice
        fields = ["id", "type", "price_per_unit", "unit", "active"]


class CollectionRouteSerializer(serializers.ModelSerializer):  # type: ignore[override]
    class Meta:  # type: ignore
        model = CollectionRoute
        fields = ["id", "collector", "ordered_listing_ids", "created_at"]


class TransactionSerializer(serializers.ModelSerializer):  # type: ignore[override]
    listing = WasteListingSerializer(read_only=True)
    buyer = serializers.StringRelatedField()
    seller = serializers.StringRelatedField()

    class Meta:  # type: ignore
        model = Transaction
        fields = [
            "id",
            "listing",
            "buyer",
            "seller",
            "quantity",
            "total_amount",
            "status",
            "payment_reference",
            "delivery_address",
            "pickup_date",
            "created_at",
            "updated_at",
        ]


class ReportSerializer(serializers.ModelSerializer):  # type: ignore[override]
    reporter = serializers.StringRelatedField(read_only=True)
    listing = WasteListingSerializer(read_only=True)
    
    class Meta:  # type: ignore
        model = Report
        fields = ["id", "reporter", "listing", "reason", "comments", "status", "created_at", "updated_at"]


class AdminActionLogSerializer(serializers.ModelSerializer):  # type: ignore[override]
    admin = serializers.StringRelatedField(read_only=True)
    listing = WasteListingSerializer(read_only=True)
    
    class Meta:  # type: ignore
        model = AdminActionLog
        fields = ["id", "admin", "listing", "report", "action_type", "reason", "metadata", "created_at"]


class MaterialFamilySerializer(serializers.ModelSerializer):
    class Meta:  # type: ignore
        model = MaterialFamily
        fields = ["id", "name", "aliases", "description"]

