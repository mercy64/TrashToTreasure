import json, urllib.request, sys
p='tmp_reg_payload.json'
with open(p,'rb') as f:
    data=f.read()
req=urllib.request.Request('http://127.0.0.1:8001/api/auth/register/', data=data, headers={'Content-Type':'application/json'})
try:
    resp=urllib.request.urlopen(req, timeout=10)
    print('STATUS', resp.getcode())
    print(resp.read().decode())
except urllib.error.HTTPError as e:
    print('STATUS', e.code)
    print(e.read().decode())
except Exception as e:
    print('ERR', e)
