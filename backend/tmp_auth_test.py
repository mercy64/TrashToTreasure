import requests
import time


BASE_URL = "http://127.0.0.1:8001"

def main():
    unique = str(int(time.time()))
    username = f"testuser_{unique}"
    email = f"{username}@example.com"
    password = "TestPass123!"

    print("Registering user:", username)
    # create a unique phone to avoid duplicate-phone errors on repeated runs
    unique_phone = "+2547" + unique[-6:]

    reg_payload = {
        "username": username,
        "email": email,
        "password": password,
        "confirm_password": password,
        "first_name": "Tmp",
        "last_name": "User",
        # required by serializer in backend
        "phone": unique_phone,
        "role": "waste_generator",
        "location": "Nairobi",
    }

    try:
        r = requests.post(f"{BASE_URL}/api/auth/register/", json=reg_payload, timeout=10)
        print("Register status:", r.status_code)
        try:
            print("Register response:", r.json())
        except ValueError:
            print("Register response text:", r.text)
    except requests.exceptions.RequestException as err:
        print("Register request failed:", err)
        return

    print('\nAttempting login...')
    try:
        r2 = requests.post(
            f"{BASE_URL}/api/auth/login/",
            json={"username": username, "password": password},
            timeout=10,
        )
        print("Login status:", r2.status_code)
        try:
            print("Login response:", r2.json())
        except ValueError:
            print("Login response text:", r2.text)
    except requests.exceptions.RequestException as err:
        print("Login request failed:", err)
        return

    if r2.status_code == 200:
        data = r2.json()
        access = data.get('access') or data.get('token') or data.get('access_token')
        if not access:
            print('No access token found in login response')
            return
        headers = {"Authorization": f"Bearer {access}"}
        try:
            rp = requests.get(
                f"{BASE_URL}/api/auth/profile/", headers=headers, timeout=10
            )
            print('Profile status:', rp.status_code)
            try:
                print('Profile response:', rp.json())
            except ValueError:
                print('Profile text:', rp.text)
        except requests.exceptions.RequestException as err:
            print('Profile request failed:', err)


    if __name__ == '__main__':
        main()
