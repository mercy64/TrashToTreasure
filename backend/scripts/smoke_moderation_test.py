from django.test import Client
import json
from django.contrib.auth import get_user_model
from waste_management.models import WasteListing
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
client = Client()

# create admin and reporter (provide required unique phone and location)
admin, created = User.objects.get_or_create(
    username="smoke_admin",
    defaults={"role": "admin", "phone": "+10000000001", "location": "Test City"},
)
if created:
    admin.set_password("adminpass")
    admin.save()

reporter, created = User.objects.get_or_create(
    username="smoke_reporter",
    defaults={"role": "waste_generator", "phone": "+10000000002", "location": "Test City"},
)
if created:
    reporter.set_password("reporterpass")
    reporter.save()

# create a listing
lst = WasteListing.objects.create(
    title="Smoke listing",
    description="for smoke test",
    user=reporter,
    quantity=1,
    unit="kg",
    price_per_unit=0.0,
)
print("created listing id", lst.id)

# reporter creates a report via API
reporter_token = str(RefreshToken.for_user(reporter).access_token)
client.defaults["HTTP_AUTHORIZATION"] = f"Bearer {reporter_token}"
resp = client.post(
    f"/api/waste/listings/{lst.id}/report/",
    json.dumps({"reason": "spam", "comments": "auto smoke"}),
    content_type="application/json",
)
print("create_report status", resp.status_code)
print("create_report body:", resp.content[:200])

# admin lists reports
admin_token = str(RefreshToken.for_user(admin).access_token)
client.defaults["HTTP_AUTHORIZATION"] = f"Bearer {admin_token}"
resp2 = client.get("/api/waste/admin/reports/")
print("admin_reports status", resp2.status_code)
print("admin_reports body:", resp2.content[:800])

# parse and perform action
try:
    data = json.loads(resp2.content.decode() or "[]")
except Exception as e:
    print("failed to parse admin reports", e)
    data = []

if data:
    rid = data[0].get("id")
    action_resp = client.post(
        f"/api/waste/admin/reports/{rid}/action/",
        json.dumps({"action_type": "resolve_report", "reason": "handled"}),
        content_type="application/json",
    )
    print("action status", action_resp.status_code)
    print("action body:", action_resp.content[:200])
else:
    print("no reports returned")
