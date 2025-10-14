from rest_framework import serializers
from .models import (
    WasteListing,
    WasteImage,
    Transaction,
    WastePrice,
    CollectionRoute,
)


class WasteImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteImage
        fields = ["id", "image", "caption", "created_at"]


class WasteListingSerializer(serializers.ModelSerializer):
    images = WasteImageSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField()
    claimed_by = serializers.SerializerMethodField()
    assigned_to = serializers.SerializerMethodField()

    class Meta:
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


class WasteListingCreateSerializer(serializers.ModelSerializer):
    class Meta:
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


class WastePriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WastePrice
        fields = ["id", "type", "price_per_unit", "unit", "active"]


class CollectionRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionRoute
        fields = ["id", "collector", "ordered_listing_ids", "created_at"]


# Notifications are provided by the messaging app's Notification model/serializer


class TransactionSerializer(serializers.ModelSerializer):
    listing = WasteListingSerializer(read_only=True)
    buyer = serializers.StringRelatedField()
    seller = serializers.StringRelatedField()

    class Meta:
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
