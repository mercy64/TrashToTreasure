import requests
import json

url = 'http://127.0.0.1:8001/api/auth/register/'
payload = {
    'email': 'tmp+py@example.com',
    'username': 'tmp_py',
    'password': 'Password123!',
    'confirm_password': 'Password123!',
    'first_name': 'Tmp',
    'last_name': 'Py',
    'phone': '0712345678',
    'role': 'waste_generator',
    'location': 'Nairobi, Kenya',
}

try:
    r = requests.post(url, json=payload, timeout=5)
    print('Status:', r.status_code)
    try:
        print('JSON:', json.dumps(r.json(), indent=2))
    except Exception:
        print('Text:', r.text)
except Exception as e:
    print('Request failed:', e)
