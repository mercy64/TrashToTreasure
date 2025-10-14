import requests

base_url = "http://127.0.0.1:8001"

print("🔍 DEBUGGING TRASHTROTREASURE API CONNECTION")
print("=" * 50)

# Test basic connectivity
try:
    print("Testing basic connectivity...")
    response = requests.get(f"{base_url}/api/test/", timeout=5)
    print("✅ SUCCESS! Server is responding")
    print("Status Code:", response.status_code)
    try:
        print("Response:", response.json())
    except ValueError:
        # Not JSON; ignore
        pass
    print()

    # Now test the actual endpoints
    print("Testing actual API endpoints:")

    # Test waste listings (should work - no auth required)
    try:
        response = requests.get(f"{base_url}/api/waste/listings/", timeout=5)
        print(f"✅ /api/waste/listings/ - Status: {response.status_code}")
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"   Found {len(data)} waste listings")
            except ValueError:
                pass
    except requests.exceptions.RequestException as e:
        print(f"❌ /api/waste/listings/ - Error: {e}")

    # Test auth endpoints (will likely return 405 for GET requests)
    auth_endpoints = ["/api/auth/register/", "/api/auth/login/", "/api/auth/profile/"]
    for endpoint in auth_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            status = "✅" if response.status_code in [200, 405, 401] else "❌"
            print(f"{status} {endpoint} - Status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint} - Error: {e}")

    # Test messaging (auth required, expect 401)
    try:
        response = requests.get(f"{base_url}/api/messaging/notifications/", timeout=5)
        status = "✅" if response.status_code in [200, 401] else "❌"
        print(f"{status} /api/messaging/notifications/ - Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ /api/messaging/notifications/ - Error: {e}")

except requests.exceptions.ConnectionError as e:
    print(f"❌ CONNECTIVITY FAILED: {e}")
    print("The Django server might not be running or accessible.")
except requests.exceptions.RequestException as e:
    print(f"❌ NETWORK ERROR: {e}")
except Exception as e:  # pylint: disable=broad-except
    # Last-resort catch; print and continue. Keep this minimal to aid debugging.
    # This script is a dev helper; a broad except here intentionally prevents
    # the script from crashing during exploratory checks.
    print(f"❌ UNEXPECTED ERROR: {e}")

print()
print(
    "Note: Status codes 405 = Method not allowed (normal for POST endpoints tested with GET)"
)
print(
    "Note: Status codes 401 = Authentication required (normal for protected endpoints)"
)
