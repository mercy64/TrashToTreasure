from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any

from .models import WastePrice
from .models import MaterialFamily, Transaction


def _round_amount(amount: Decimal, places: int = 2) -> Decimal:
    # simpler quantization
    fmt = (
        Decimal("0." + "0" * (places - 1) + "1")
        if places > 0
        else Decimal("1")
    )
    return amount.quantize(fmt, rounding=ROUND_HALF_UP)


def estimate_price(
    waste_type: str,
    quantity: float,
    unit: str = "kg",
    include_tax: bool = False,
    tax_rate: float = 0.0,
) -> Dict[str, Any]:
    """Estimate price using WastePrice.price_per_unit. Returns breakdown dict.

    Simple behavior (Option A): price = price_per_unit * quantity
    """
    # normalize inputs
    waste_type_norm = (waste_type or '').strip().lower()
    req_unit = (unit or 'kg').strip().lower()

    # conversion factors to kilograms
    TO_KG = {
        'g': Decimal('0.001'),
        'gram': Decimal('0.001'),
        'grams': Decimal('0.001'),
        'kg': Decimal('1'),
        'kilogram': Decimal('1'),
        'kilograms': Decimal('1'),
        'tonne': Decimal('1000'),
        't': Decimal('1000'),
        'metric_ton': Decimal('1000'),
        'ton': Decimal('907.18474'),  # short ton (US) in kg
        'lb': Decimal('0.45359237'),
        'lbs': Decimal('0.45359237'),
        'pound': Decimal('0.45359237'),
        'pounds': Decimal('0.45359237'),
        'oz': Decimal('0.0283495231'),
    }

    def _to_kg(qty_dec: Decimal, from_u: str) -> Decimal:
        f = TO_KG.get(from_u.lower())
        if f is None:
            # unknown unit -> assume same as kg
            return qty_dec
        return qty_dec * f

    def _from_kg(qty_kg: Decimal, to_u: str) -> Decimal:
        f = TO_KG.get(to_u.lower())
        if f is None or f == 0:
            return qty_kg
        return qty_kg / f

    qty_dec = Decimal(str(quantity))

    # find a price object: try exact match (case-insensitive), then try plural/singular
    price_obj = WastePrice.objects.filter(type__iexact=waste_type_norm, unit__iexact=req_unit, active=True).first()
    if not price_obj:
        # try plural/singular variations
        alt_types = set([waste_type_norm, waste_type_norm.rstrip('s'), waste_type_norm + 's'])
        candidates = WastePrice.objects.filter(type__in=alt_types, active=True)
        # prefer same unit among candidates
        price_obj = None
        for c in candidates:
            if (c.unit or '').strip().lower() == req_unit:
                price_obj = c
                break
        # if still not found, pick any candidate and we'll convert units
        if not price_obj and candidates.exists():
            price_obj = candidates.first()

    if not price_obj:
        # try case-insensitive type matching across all types and pick closest
        price_obj = WastePrice.objects.filter(type__iexact=waste_type_norm, active=True).first()

    if not price_obj:
        # Before falling back to a global average, attempt a per-family lookup
        # using MaterialFamily records defined in the DB. If found, compute a
        # weighted average price-per-kg across available prices where weights are
        # derived from historical transaction volumes (kg). This provides a more
        # representative estimate than a simple mean.
        matched_family = None
        try:
            mf_qs = MaterialFamily.objects.all()
            for mf in mf_qs:
                aliases = [mf.name] + [a for a in (mf.aliases or [])]
                aliases_norm = [a.strip().lower() for a in aliases if a]
                if waste_type_norm in aliases_norm:
                    matched_family = (mf, aliases_norm)
                    break
        except Exception:
            matched_family = None

        if matched_family:
            fam_aliases = matched_family[1]
            fam_prices = WastePrice.objects.filter(type__in=fam_aliases, active=True)

            # Build price_per_kg mapping for types with configured prices
            price_per_kg_map = {}
            for p in fam_prices:
                try:
                    pu = Decimal(str(p.price_per_unit))
                    p_unit = (p.unit or 'kg').strip().lower()
                    kg_factor = TO_KG.get(p_unit, Decimal('1'))
                    if kg_factor == 0:
                        continue
                    price_per_kg_map[p.type.strip().lower()] = pu / kg_factor
                except Exception:
                    continue

            # Compute historical kg per type from transactions (completed/confirmed)
            hist_qs = Transaction.objects.filter(listing__type__in=fam_aliases, status__in=['confirmed', 'completed'])
            hist_kg_by_type = {}
            total_hist_kg = Decimal('0')
            for t in hist_qs.select_related('listing'):
                try:
                    listing_unit = (t.listing.unit or 'kg').strip().lower()
                    qty = Decimal(str(t.quantity))
                    kg = _to_kg(qty, listing_unit)
                    lt = (t.listing.type or '').strip().lower()
                    hist_kg_by_type[lt] = hist_kg_by_type.get(lt, Decimal('0')) + kg
                    total_hist_kg += kg
                except Exception:
                    continue

            # If we have historical weights, compute weighted average; else fall back to simple average
            if total_hist_kg > 0 and price_per_kg_map:
                numerator = Decimal('0')
                denom = Decimal('0')
                for ttype, ppk in price_per_kg_map.items():
                    weight = hist_kg_by_type.get(ttype, Decimal('0'))
                    if weight > 0:
                        numerator += ppk * weight
                        denom += weight
                # If denom is zero (no matching hist for priced types), fallback to simple avg
                if denom > 0:
                    weighted_price_per_kg = numerator / denom
                else:
                    weighted_price_per_kg = sum(price_per_kg_map.values()) / Decimal(len(price_per_kg_map))
            elif price_per_kg_map:
                weighted_price_per_kg = sum(price_per_kg_map.values()) / Decimal(len(price_per_kg_map))
            else:
                weighted_price_per_kg = None

            if weighted_price_per_kg is not None:
                price_unit = 'kg'
                unit_price = weighted_price_per_kg
                qty_in_kg = _to_kg(qty_dec, req_unit)
                subtotal = unit_price * qty_in_kg
                tax = Decimal('0.0')
                if include_tax and tax_rate:
                    tax = (subtotal * Decimal(str(tax_rate)))
                    tax = _round_amount(tax, 2)
                total = subtotal + tax

                return {
                    "type": waste_type,
                    "requested_unit": req_unit,
                    "requested_quantity": float(qty_dec),
                    "price_unit": price_unit,
                    "unit_price_used": _round_amount(unit_price, 4),
                    "quantity_in_price_unit": float(qty_in_kg),
                    "subtotal": _round_amount(subtotal, 2),
                    "tax": _round_amount(tax, 2),
                    "total": _round_amount(total, 2),
                    "source": "family_weighted_fallback",
                    "price_source_id": None,
                }

        # No family match or no family prices — fall back to global average
        # No explicit price configured for this type/unit. As a fallback, compute a
        # global average price-per-kg across all active WastePrice entries and use
        # that to estimate the requested quantity. This helps provide best-effort
        # estimates for types that haven't been configured yet.
        prices = WastePrice.objects.filter(active=True)
        per_kg_prices = []
        for p in prices:
            try:
                pu = Decimal(str(p.price_per_unit))
                p_unit = (p.unit or 'kg').strip().lower()
                # convert unit price -> price per kg
                # price_per_kg = price_per_unit / (units in kg per price unit)
                kg_factor = TO_KG.get(p_unit, Decimal('1'))
                if kg_factor == 0:
                    continue
                price_per_kg = pu / kg_factor
                per_kg_prices.append(price_per_kg)
            except Exception:
                continue

        if per_kg_prices:
            avg_price_per_kg = sum(per_kg_prices) / Decimal(len(per_kg_prices))
            # We'll treat the fallback as if a price object existed with unit 'kg'
            price_unit = 'kg'
            unit_price = avg_price_per_kg
            # compute subtotal directly using requested qty converted to kg
            qty_in_kg = _to_kg(qty_dec, req_unit)
            subtotal = unit_price * qty_in_kg
            tax = Decimal('0.0')
            if include_tax and tax_rate:
                tax = (subtotal * Decimal(str(tax_rate)))
                tax = _round_amount(tax, 2)
            total = subtotal + tax

            return {
                "type": waste_type,
                "requested_unit": req_unit,
                "requested_quantity": float(qty_dec),
                "price_unit": price_unit,
                "unit_price_used": _round_amount(unit_price, 4),
                "quantity_in_price_unit": float(qty_in_kg),
                "subtotal": _round_amount(subtotal, 2),
                "tax": _round_amount(tax, 2),
                "total": _round_amount(total, 2),
                "source": "global_average_fallback",
                "price_source_id": None,
            }

        # give up if no prices at all are configured
        raise ValueError("No price configured for this waste type/unit and no fallback prices available")

    # Convert requested quantity into the price object's unit
    price_unit = (price_obj.unit or 'kg').strip().lower()
    # Convert requested qty -> kg -> price_unit
    qty_in_kg = _to_kg(qty_dec, req_unit)
    qty_converted = _from_kg(qty_in_kg, price_unit)

    unit_price = Decimal(str(price_obj.price_per_unit))
    subtotal = unit_price * qty_converted
    tax = Decimal("0.0")
    if include_tax and tax_rate:
        tax = (subtotal * Decimal(str(tax_rate)))
        tax = _round_amount(tax, 2)

    total = subtotal + tax

    return {
        "type": waste_type,
        "requested_unit": req_unit,
        "requested_quantity": float(qty_dec),
        "price_unit": price_unit,
        "unit_price_used": unit_price,
        "quantity_in_price_unit": float(qty_converted),
        "subtotal": _round_amount(subtotal, 2),
        "tax": _round_amount(tax, 2),
        "total": _round_amount(total, 2),
        "source": "unit_price",
        "price_source_id": getattr(price_obj, 'pk', None),
    }
