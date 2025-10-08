import requests

URL = 'http://127.0.0.1:8001/api/auth/register/'
HEADERS = {
    'Origin': 'http://localhost:3007',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type,authorization',
}


def main() -> None:
    try:
        resp = requests.options(URL, headers=HEADERS, timeout=5)
        print('Status', resp.status_code)
        print('Headers:')
        for k, v in resp.headers.items():
            if 'access-control' in k.lower() or k.lower().startswith('allow'):
                print(k, ':', v)
    except requests.exceptions.RequestException as err:
        print('OPTIONS request failed:', err)


if __name__ == '__main__':
    main()
