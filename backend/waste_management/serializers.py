from rest_framework import serializers
from .models import WasteListing, WasteImage, Transaction


class WasteImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteImage
        fields = ["id", "image", "caption", "created_at"]


class WasteListingSerializer(serializers.ModelSerializer):
    images = WasteImageSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField()

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
            "images",
            "created_at",
            "updated_at",
        ]


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
