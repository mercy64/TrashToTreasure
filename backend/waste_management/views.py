# pylint: disable=E1101,E0401
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import models, transaction as db_transaction
from .models import WasteListing, Transaction, WastePrice
from .serializers import (
    WasteListingSerializer,
    WasteListingCreateSerializer,
    TransactionSerializer,
    WastePriceSerializer,
    CollectionRouteSerializer,
    
)


class WasteListingListView(generics.ListAPIView):
    queryset = WasteListing.objects.filter(status="available")
    serializer_class = WasteListingSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        waste_type = self.request.query_params.get("type")
        location = self.request.query_params.get("location")
        min_quantity = self.request.query_params.get("min_quantity")

        if waste_type:
            queryset = queryset.filter(type=waste_type)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if min_quantity:
            queryset = queryset.filter(quantity__gte=min_quantity)

        return queryset


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_listing(request):
    serializer = WasteListingCreateSerializer(data=request.data)
    if serializer.is_valid():
        # Prevent unverified users from creating bulk business listings to reduce scam risk
        if getattr(request.user, "role", None) != "waste_generator":
            return Response({"error": "Only waste generators may create listings"}, status=status.HTTP_403_FORBIDDEN)
        if not request.user.is_verified and request.user.role == "waste_generator":
            return Response({"error": "Account not verified"}, status=status.HTTP_403_FORBIDDEN)
        listing = serializer.save(user=request.user)
        return Response(
            WasteListingSerializer(listing).data, status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_listings(request):
    listings = WasteListing.objects.filter(user=request.user)
    serializer = WasteListingSerializer(listings, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_transactions(request):
    transactions = Transaction.objects.filter(
        models.Q(buyer=request.user) | models.Q(seller=request.user)
    )
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def claim_listing(request, listing_id):
    """Allows a recycler/buyer to claim a listing. Uses an atomic update to avoid race conditions."""
    try:
        with db_transaction.atomic():
            listing = WasteListing.objects.select_for_update().get(id=listing_id)
            # If already claimed by someone else, return conflict
            if listing.claimed_by and listing.claimed_by != request.user:
                return Response(
                    {"error": "Listing already claimed"},
                    status=status.HTTP_409_CONFLICT,
                )
            if listing.status != "available":
                return Response({"error": "Listing not available"}, status=status.HTTP_400_BAD_REQUEST)
            listing.claimed_by = request.user
            listing.status = "reserved"
            listing.save()
            return Response(WasteListingSerializer(listing).data)
    except WasteListing.DoesNotExist:
        return Response(
            {"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unclaim_listing(request, listing_id):
    try:
        with db_transaction.atomic():
            listing = WasteListing.objects.select_for_update().get(id=listing_id)
            if listing.claimed_by != request.user and request.user.role != "admin":
                return Response(
                    {"error": "Not permitted to unclaim"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            listing.claimed_by = None
            listing.status = "available"
            listing.save()
            return Response(WasteListingSerializer(listing).data)
    except WasteListing.DoesNotExist:
        return Response(
            {"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def prices(request):
    """GET: list active prices. POST: estimate total price for a given type and quantity.

    POST body: { "type": "plastic", "quantity": 12.5, "unit": "kg" }
    """
    if request.method == "GET":
        qs = WastePrice.objects.filter(active=True)
        serializer = WastePriceSerializer(qs, many=True)
        return Response(serializer.data)

    # POST - estimate
    wtype = request.data.get("type")
    qty = request.data.get("quantity")
    unit = request.data.get("unit", "kg")
    if not wtype or qty is None:
        return Response(
            {"error": "type and quantity required"}, status=status.HTTP_400_BAD_REQUEST
        )
    # Look up price and compute estimate. Catch specific exceptions only.
    price = WastePrice.objects.filter(type=wtype, unit=unit, active=True).first()
    if not price:
        return Response(
            {"error": "No price configured for this type/unit"},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        total = float(price.price_per_unit) * float(qty)
    except (TypeError, ValueError):
        return Response({"error": "Invalid numeric value for quantity or price"}, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {
            "type": wtype,
            "unit": unit,
            "quantity": qty,
            "price_per_unit": price.price_per_unit,
            "estimated_total": total,
        }
    )


@api_view(["POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def manage_price(request, price_id=None):
    """Admins can create/update/delete price configs. POST to create, PUT to update, DELETE to remove.

    POST body: type, price_per_unit, unit
    PUT body: any fields to update
    """
    if request.user.role != "admin":
        return Response({"error": "Admin only"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "POST":
        serializer = WastePriceSerializer(data=request.data)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(WastePriceSerializer(obj).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # For PUT/DELETE we must have price_id
    try:
        price = WastePrice.objects.get(id=price_id)
    except WastePrice.DoesNotExist:
        return Response({"error": "Price not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PUT":
        serializer = WastePriceSerializer(price, data=request.data, partial=True)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(WastePriceSerializer(obj).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    price.delete()
    return Response({"success": True})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def assign_route(request):
    """Simple greedy nearest-neighbour assignment for a collector. Expects collector id and optional max_count.

    Body: { "collector_id": 5, "max_count": 10 }
    Returns created CollectionRoute with ordered listing ids.
    """
    collector_id = request.data.get("collector_id")
    max_count = int(request.data.get("max_count", 10))
    try:
        collector = request.user if request.user.role == "delivery" else None
        if not collector:
            # admins can assign for any collector
            if request.user.role != "admin":
                return Response(
                    {"error": "Only delivery users or admin may create routes"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            from django.contrib.auth import get_user_model

            User = get_user_model()
            collector = User.objects.get(id=collector_id)
    except Exception:
        return Response({"error": "Collector not found or invalid"}, status=status.HTTP_400_BAD_REQUEST)

    # Pull available listings with latitude/longitude first
    listings = list(
        WasteListing.objects.filter(
            status="available", latitude__isnull=False, longitude__isnull=False
        )[:200]
    )
    if not listings:
        return Response({"ordered_listing_ids": []})

    # Build points list and delegate to optimizer (ORTools if available, else greedy)
    start_lat = float(getattr(collector, "latitude", listings[0].latitude or 0.0) or 0.0)
    start_lon = float(getattr(collector, "longitude", listings[0].longitude or 0.0) or 0.0)
    points = [
        (listing_obj.id, float(listing_obj.latitude or 0.0), float(listing_obj.longitude or 0.0))
        for listing_obj in listings
    ]

    from .optimizers import compute_route

    order = compute_route((start_lat, start_lon), points, max_count=max_count)

    # mark assigned_to for the chosen listings
    with db_transaction.atomic():
        qs = WasteListing.objects.select_for_update().filter(id__in=order)
        for listing_obj in qs:
            listing_obj.assigned_to = collector
            listing_obj.save()

    # Create CollectionRoute
    from .models import CollectionRoute

    route = CollectionRoute.objects.create(collector=collector, ordered_listing_ids=order)
    serializer = CollectionRouteSerializer(route)
    return Response(serializer.data)


# Notification endpoints are provided by the messaging app: /api/messaging/notifications/


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unassign_listing(request, listing_id):
    try:
        with db_transaction.atomic():
            listing = WasteListing.objects.select_for_update().get(id=listing_id)
            if listing.assigned_to != request.user and request.user.role != "admin":
                return Response({"error": "Not permitted to unassign"}, status=status.HTTP_403_FORBIDDEN)
            listing.assigned_to = None
            listing.status = "available"
            listing.save()
            return Response(WasteListingSerializer(listing).data)
    except WasteListing.DoesNotExist:
        return Response({"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND)
