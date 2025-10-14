from django.urls import path
from . import views

app_name = "waste_management"

urlpatterns = [
    path("listings/", views.WasteListingListView.as_view(), name="waste-listings"),
    path("listings/create/", views.create_listing, name="create-listing"),
    path("listings/my/", views.my_listings, name="my-listings"),
    path("listings/<int:listing_id>/claim/", views.claim_listing, name="claim-listing"),
    path(
        "listings/<int:listing_id>/unclaim/",
        views.unclaim_listing,
        name="unclaim-listing",
    ),
    path("prices/", views.prices, name="waste-prices"),
    path("prices/manage/", views.manage_price, name="manage-price"),
    path("prices/manage/<int:price_id>/", views.manage_price, name="manage-price-id"),
    path("routes/assign/", views.assign_route, name="assign-route"),
    path("listings/<int:listing_id>/unassign/", views.unassign_listing, name="unassign-listing"),
    path("transactions/my/", views.my_transactions, name="my-transactions"),
]
