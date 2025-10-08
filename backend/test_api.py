import requests
import time


# Test the API endpoints
BASE_URL = "http://127.0.0.1:8001"
TIMEOUT = 5  # seconds for request timeout


print("=== TESTING TRASHTROTREASURE API ENDPOINTS ===")
print("Waiting for server to be ready...")
time.sleep(2)  # Give server time to fully start
print()


# Test waste listings endpoint
try:
    response = requests.get(f"{BASE_URL}/api/waste/listings/", timeout=TIMEOUT)
    print(f"✅ GET /api/waste/listings/ - Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Found {len(data)} waste listings")
        for listing in data[:2]:  # Show first 2
            print(f'   • {listing["title"]} - ${listing["price_per_unit"]}/{listing["unit"]}')
    else:
        print(f"   Error: {response.text[:200]}")
except requests.exceptions.RequestException as err:
    print(f"❌ GET /api/waste/listings/ - Error: {err}")

print()

# Test auth endpoints
AUTH_ENDPOINTS = ["/api/auth/register/", "/api/auth/login/", "/api/auth/profile/"]

for endpoint in AUTH_ENDPOINTS:
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=TIMEOUT)
        status_icon = "✅" if response.status_code in [200, 405, 401] else "❌"
        print(f"{status_icon} GET {endpoint} - Status: {response.status_code}")
    except requests.exceptions.RequestException as err:
        print(f"❌ GET {endpoint} - Error: {err}")

print()

# Test messaging endpoints
try:
    response = requests.get(f"{BASE_URL}/api/messaging/notifications/", timeout=TIMEOUT)
    status_icon = "✅" if response.status_code in [200, 401] else "❌"
    print(f"{status_icon} GET /api/messaging/notifications/ - Status: {response.status_code}")
except requests.exceptions.RequestException as err:
    print(f"❌ GET /api/messaging/notifications/ - Error: {err}")

print()
print("Note: Status 401 is expected for authenticated endpoints when no token is provided")
print("Note: Status 405 is expected for endpoints that don't accept GET requests")
