from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
from .models import WasteListing, Transaction
from .serializers import WasteListingSerializer, WasteListingCreateSerializer, TransactionSerializer

class WasteListingListView(generics.ListAPIView):
    queryset = WasteListing.objects.filter(status='available')
    serializer_class = WasteListingSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        waste_type = self.request.query_params.get('type')
        location = self.request.query_params.get('location')
        min_quantity = self.request.query_params.get('min_quantity')
        
        if waste_type:
            queryset = queryset.filter(type=waste_type)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if min_quantity:
            queryset = queryset.filter(quantity__gte=min_quantity)
            
        return queryset

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_listing(request):
    serializer = WasteListingCreateSerializer(data=request.data)
    if serializer.is_valid():
        listing = serializer.save(user=request.user)
        return Response(WasteListingSerializer(listing).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_listings(request):
    listings = WasteListing.objects.filter(user=request.user)
    serializer = WasteListingSerializer(listings, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_transactions(request):
    transactions = Transaction.objects.filter(
        models.Q(buyer=request.user) | models.Q(seller=request.user)
    )
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)