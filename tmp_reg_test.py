import json
import time
from urllib import request, error

url = 'http://127.0.0.1:8001/api/auth/register/'

# generate a unique test identity to avoid duplicate conflicts
ts = int(time.time())
email = f'testuser+{ts}@example.com'
username = f'testuser{ts}'
phone = f'+2547{ts % 1000000:06d}'

payload = {
    'email': email,
    'username': username,
    'password': 'TestPass123!',
    'confirm_password': 'TestPass123!',
    'first_name': 'Test',
    'last_name': 'User',
    'phone': phone,
    'role': 'waste_generator',
    'location': 'Nairobi'
}

req = request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    resp = request.urlopen(req)
    body = resp.read().decode()
    print('STATUS', resp.getcode())
    print(body)
except error.HTTPError as e:
    body = e.read().decode()
    print('STATUS', e.code)
    print(body)
except Exception as e:
    print('ERROR', str(e))
