from decimal import Decimal
from django.test import TestCase

from waste_management.pricing import estimate_price
from waste_management.models import WastePrice, MaterialFamily


class PricingTests(TestCase):
    def test_estimate_exact_match(self):
        WastePrice.objects.create(type='plastic', unit='kg', price_per_unit=Decimal('1.50'), active=True)
        res = estimate_price('plastic', 2.0, 'kg')
        self.assertEqual(res['unit_price_used'], Decimal('1.50'))
        self.assertAlmostEqual(float(res['total']), 3.00, places=6)

    def test_unit_conversion(self):
        WastePrice.objects.create(type='plastic', unit='kg', price_per_unit=Decimal('1.50'), active=True)
        res = estimate_price('plastic', 1500, 'g')
        self.assertAlmostEqual(float(res.get('quantity_in_price_unit', 0)), 1.5, places=6)
        self.assertAlmostEqual(float(res['total']), 2.25, places=6)

    def test_family_fallback(self):
        WastePrice.objects.create(type='hdpe', unit='kg', price_per_unit=Decimal('2.00'), active=True)
        MaterialFamily.objects.create(name='plastic', aliases=['hdpe'], description='Plastics')
        res = estimate_price('plastic', 1.0, 'kg')
        self.assertIn(res.get('source'), ('family_fallback', 'family_weighted_fallback', 'unit_price'))

    def test_global_fallback(self):
        WastePrice.objects.create(type='cardboard', unit='kg', price_per_unit=Decimal('0.50'), active=True)
        res = estimate_price('mystery_material', 10, 'kg')
        self.assertEqual(res.get('source'), 'global_average_fallback')

    def test_include_tax(self):
        WastePrice.objects.create(type='plastic', unit='kg', price_per_unit=Decimal('1.00'), active=True)
        res = estimate_price('plastic', 10, 'kg', include_tax=True, tax_rate=0.16)
        self.assertAlmostEqual(float(res.get('tax', 0)), 1.6, places=6)
