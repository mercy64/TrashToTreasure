from django.urls import path
from . import views

urlpatterns = [
    path('listings/', views.WasteListingListView.as_view(), name='waste-listings'),
    path('listings/create/', views.create_listing, name='create-listing'),
    path('listings/my/', views.my_listings, name='my-listings'),
    path('transactions/my/', views.my_transactions, name='my-transactions'),
]