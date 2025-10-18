import os
import sys
import pprint

# Ensure the project root (backend/) is on sys.path so Django settings can be imported
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trashtrotreasure.settings')
import django  # noqa: E402
django.setup()
from waste_management.pricing import estimate_price  # noqa: E402

cases = [
    ('plastic', 1500, 'g'),
    ('plastic', 1.5, 'kg'),
    ('plastic', 0.002, 'tonne'),
    ('metal', 50, 'lb'),
    ('glass', 32, 'oz'),
]

pp = pprint.pprint

for t, q, u in cases:
    print('CASE', t, q, u)
    try:
        res = estimate_price(t, q, u)
        pp(res)
    except Exception as e:
        print('ERR', e)

print('\nTest script complete')
