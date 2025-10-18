from django.test import TestCase
from waste_management.optimizers import (
    cache_set_with_start,
    cache_get_with_start,
    cache_set,
    cache_get,
    cache_invalidate_for_listing,
)


class RouteCacheTest(TestCase):
    def test_inmemory_cache_with_start_and_invalidate(self):
        collector = 42
        listing_ids = [1, 2, 3]
        start = (0.0, 0.0)
        route = [2, 3, 1]

        # set and get with start
        cache_set_with_start(collector, listing_ids, start, route)
        got = cache_get_with_start(collector, listing_ids, start)
        self.assertEqual(got, route)

        # set and get without start fallback
        cache_set(collector, listing_ids, route)
        got2 = cache_get(collector, listing_ids)
        self.assertEqual(got2, route)

        # invalidate listing 2
        cache_invalidate_for_listing(2)
        self.assertIsNone(cache_get(collector, listing_ids))
        self.assertIsNone(cache_get_with_start(collector, listing_ids, start))
