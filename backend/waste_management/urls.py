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
    # compatibility alias used in tests and older clients
    path("prices/", views.prices, name="prices"),
    path("prices/manage/", views.manage_price, name="manage-price"),
    path("prices/manage/<int:price_id>/", views.manage_price, name="manage-price-id"),
    path("routes/assign/", views.assign_route, name="assign-route"),
    path("stats/", views.stats, name="waste-stats"),
    path("admin/missing_prices/", views.missing_prices, name="missing-prices"),
    path("admin/material_families/", views.material_families, name="material-families"),
    path("admin/material_families/<int:pk>/", views.material_family_detail, name="material-family-detail"),
    path("listings/<int:listing_id>/unassign/", views.unassign_listing, name="unassign-listing"),
    path("transactions/my/", views.my_transactions, name="my-transactions"),
    # Reporting & moderation
    path("listings/<int:listing_id>/report/", views.create_report, name="create-report"),
    path("admin/reports/", views.admin_reports, name="admin-reports"),
    path("admin/reports/<int:report_id>/", views.get_report, name="get-report"),
    path("admin/reports/<int:report_id>/action/", views.admin_report_action, name="admin-report-action"),
    path("admin/action_logs/", views.admin_action_logs, name="admin-action-logs"),
]
