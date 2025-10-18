"""Route optimization helpers.

Provides a simple OR-Tools-based CVRP/TSP solver when ortools is installed,
otherwise falls back to the greedy nearest-neighbour solver used earlier.
"""
from typing import List, Tuple
import math
import json
from django.conf import settings

try:
    import redis
    REDIS_AVAILABLE = True
except Exception:
    REDIS_AVAILABLE = False

try:
    from ortools.constraint_solver import pywrapcp, routing_enums_pb2  # type: ignore
    ORTOOLS_AVAILABLE = True
except Exception:
    ORTOOLS_AVAILABLE = False


def haversine_meters(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    """Return distance in meters between two (lat, lon) points using haversine."""
    lat1, lon1 = a
    lat2, lon2 = b
    # convert to radians
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    R = 6371000.0  # Earth radius in meters
    h = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def two_opt(route: List[int], coords_map: dict) -> List[int]:
    """Perform a simple 2-opt local improvement on a route represented by listing ids.

    coords_map maps listing id -> (lat, lon). This is a lightweight improvement pass
    good for small-to-medium routes and fast to compute.
    """
    improved = True
    best = route[:]
    def route_length(r):
        total = 0.0
        for i in range(len(r) - 1):
            total += haversine_meters(coords_map[r[i]], coords_map[r[i+1]])
        return total

    if len(best) < 3:
        return best

    best_len = route_length(best)
    while improved:
        improved = False
        n = len(best)
        for i in range(0, n - 2):
            for j in range(i + 2, n):
                if j - i == 1:
                    continue
                new_route = best[:i+1] + best[i+1:j+1][::-1] + best[j+1:]
                new_len = route_length(new_route)
                if new_len + 1e-6 < best_len:
                    best = new_route
                    best_len = new_len
                    improved = True
                    break
            if improved:
                break
    return best


# Simple in-memory cache for computed routes. Key is a frozenset of listing ids + collector id.
# This is intentionally simple (not persistent) and intended for single-process dev setups.
_ROUTE_CACHE = {}
_ROUTE_CACHE_TTL = 60 * 5  # seconds

def _cache_key(collector_id: int, listing_ids: List[int]) -> tuple:
    return (collector_id, tuple(sorted(listing_ids)))


def _cache_key_with_start(collector_id: int, listing_ids: List[int], start: Tuple[float, float]) -> tuple:
    # include start coords rounded to 6 decimals to avoid floating noise
    return (collector_id, tuple(sorted(listing_ids)), round(start[0], 6), round(start[1], 6))

def cache_get(collector_id: int, listing_ids: List[int]):
    # prefer Redis when configured
    redis_url = getattr(settings, "ROUTE_CACHE_REDIS_URL", None)
    start = getattr(settings, "ROUTE_CACHE_USE_REDIS", False)
    if REDIS_AVAILABLE and (redis_url or start):
        try:
            client = redis.from_url(redis_url or "redis://localhost:6379/0")
            key = f"route:{collector_id}:{','.join(map(str, sorted(listing_ids)))}"
            raw = client.get(key)
            if not raw:
                return None
            payload = json.loads(raw.decode())
            if time.time() - payload.get("ts", 0) > _ROUTE_CACHE_TTL:
                client.delete(key)
                return None
            return payload.get("route")
        except Exception:
            # fallback to in-memory
            pass

    key = _cache_key(collector_id, listing_ids)
    entry = _ROUTE_CACHE.get(key)
    if not entry:
        return None
    ts, value = entry
    if (time.time() - ts) > _ROUTE_CACHE_TTL:
        del _ROUTE_CACHE[key]
        return None
    return value

def cache_set(collector_id: int, listing_ids: List[int], route: List[int]):
    redis_url = getattr(settings, "ROUTE_CACHE_REDIS_URL", None)
    start = getattr(settings, "ROUTE_CACHE_USE_REDIS", False)
    if REDIS_AVAILABLE and (redis_url or start):
        try:
            client = redis.from_url(redis_url or "redis://localhost:6379/0")
            key = f"route:{collector_id}:{','.join(map(str, sorted(listing_ids)))}"
            payload = {"ts": time.time(), "route": route}
            client.set(key, json.dumps(payload), ex=_ROUTE_CACHE_TTL)
            return
        except Exception:
            # fall back to in-memory
            pass

    key = _cache_key(collector_id, listing_ids)
    _ROUTE_CACHE[key] = (time.time(), route)


def cache_get_with_start(collector_id: int, listing_ids: List[int], start: Tuple[float, float]):
    # prefer Redis when configured (keying includes start)
    redis_url = getattr(settings, "ROUTE_CACHE_REDIS_URL", None)
    start_flag = getattr(settings, "ROUTE_CACHE_USE_REDIS", False)
    if REDIS_AVAILABLE and (redis_url or start_flag):
        try:
            client = redis.from_url(redis_url or "redis://localhost:6379/0")
            key = f"route:{collector_id}:{','.join(map(str, sorted(listing_ids)))}:s:{round(start[0],6)}:{round(start[1],6)}"
            raw = client.get(key)
            if not raw:
                return None
            payload = json.loads(raw.decode())
            if time.time() - payload.get("ts", 0) > _ROUTE_CACHE_TTL:
                client.delete(key)
                return None
            return payload.get("route")
        except Exception:
            pass
    key = _cache_key_with_start(collector_id, listing_ids, start)
    entry = _ROUTE_CACHE.get(key)
    if not entry:
        return None
    ts, value = entry
    if (time.time() - ts) > _ROUTE_CACHE_TTL:
        del _ROUTE_CACHE[key]
        return None
    return value


def cache_set_with_start(collector_id: int, listing_ids: List[int], start: Tuple[float, float], route: List[int]):
    redis_url = getattr(settings, "ROUTE_CACHE_REDIS_URL", None)
    start_flag = getattr(settings, "ROUTE_CACHE_USE_REDIS", False)
    if REDIS_AVAILABLE and (redis_url or start_flag):
        try:
            client = redis.from_url(redis_url or "redis://localhost:6379/0")
            key = f"route:{collector_id}:{','.join(map(str, sorted(listing_ids)))}:s:{round(start[0],6)}:{round(start[1],6)}"
            payload = {"ts": time.time(), "route": route}
            client.set(key, json.dumps(payload), ex=_ROUTE_CACHE_TTL)
            return
        except Exception:
            pass
    key = _cache_key_with_start(collector_id, listing_ids, start)
    _ROUTE_CACHE[key] = (time.time(), route)

def cache_invalidate_for_listing(listing_id: int):
    # Try Redis first
    redis_url = getattr(settings, "ROUTE_CACHE_REDIS_URL", None)
    start = getattr(settings, "ROUTE_CACHE_USE_REDIS", False)
    if REDIS_AVAILABLE and (redis_url or start):
        try:
            client = redis.from_url(redis_url or "redis://localhost:6379/0")
            # scan keys matching route:* and remove those containing the listing id
            cursor = 0
            pattern = "route:*"
            while True:
                cursor, keys = client.scan(cursor=cursor, match=pattern, count=1000)
                for k in keys:
                    try:
                        raw = client.get(k)
                        if not raw:
                            continue
                        payload = json.loads(raw.decode())
                        route = payload.get("route", [])
                        if listing_id in route:
                            client.delete(k)
                    except Exception:
                        continue
                if cursor == 0:
                    break
            return
        except Exception:
            pass

    # fallback to in-memory cache invalidation
    keys_to_remove = [k for k in list(_ROUTE_CACHE.keys()) if listing_id in k[1]]
    for k in keys_to_remove:
        del _ROUTE_CACHE[k]

import time


def greedy_order(start: Tuple[float, float], points: List[Tuple[int, float, float]], max_count: int = 50):
    """Greedy nearest neighbour using haversine distance. 'points' is list of (id, lat, lon)."""
    remaining = points.copy()
    order = []
    cur = start
    while remaining and len(order) < max_count:
        next_idx = min(
            range(len(remaining)),
            key=lambda i: haversine_meters(cur, (remaining[i][1], remaining[i][2])),
        )
        pid, plat, plon = remaining.pop(next_idx)
        order.append(pid)
        cur = (plat, plon)

    # apply a quick 2-opt improvement using the coords map
    if order:
        coords_map = {pid: (lat, lon) for pid, lat, lon in points}
        improved = two_opt(order, coords_map)
        return improved
    return order


def ortools_tsp(start: Tuple[float, float], points: List[Tuple[int, float, float]], max_count: int = 50):
    """If OR-Tools is available, solve a TSP for up to max_count points and return ordered ids.

    This is a simple TSP on Euclidean distances and is intended for small batches.
    """
    if not ORTOOLS_AVAILABLE:
        return greedy_order(start, points, max_count)

    # Build a reduced list of points to limit size
    pts = points[:max_count]
    coords = [(p[1], p[2]) for p in pts]

    # Create distance matrix using haversine meters
    def distance(i, j):
        ax, ay = coords[i]
        bx, by = coords[j]
        # convert to meters and to int for ortools
        return int(haversine_meters((ax, ay), (bx, by)))

    n = len(coords) + 1  # include start as node 0
    all_coords = [start] + coords
    dist_matrix = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i == j:
                dist_matrix[i][j] = 0
            else:
                ax, ay = all_coords[i]
                bx, by = all_coords[j]
                dist_matrix[i][j] = int(haversine_meters((ax, ay), (bx, by)))

    manager = pywrapcp.RoutingIndexManager(n, 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def dist_callback(from_index, to_index):
        return dist_matrix[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]

    transit_callback_index = routing.RegisterTransitCallback(dist_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC

    solution = routing.SolveWithParameters(search_parameters)
    if not solution:
        return greedy_order(start, points, max_count)

    # Extract route (skip the 0th node which is the start)
    index = routing.Start(0)
    ordered = []
    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        if node != 0:
            ordered.append(pts[node - 1][0])
        index = solution.Value(routing.NextVar(index))

    # apply 2-opt improvement
    if ordered:
        coords_map = {pid: (lat, lon) for pid, lat, lon in pts}
        ordered = two_opt(ordered, coords_map)

    return ordered


def compute_route(start: Tuple[float, float], points: List[Tuple[int, float, float]], max_count: int = 50):
    # If many points, cluster first then route within clusters to scale better.
    if len(points) > 100:
        clusters = kmeans_cluster(points, k=max(2, len(points) // 50))
        final_order = []
        for cluster in clusters:
            order = ortools_tsp(start, cluster, max_count=min(max_count, len(cluster))) if ORTOOLS_AVAILABLE else greedy_order(start, cluster, max_count=min(max_count, len(cluster)))
            final_order.extend(order)
        return final_order

    if ORTOOLS_AVAILABLE:
        return ortools_tsp(start, points, max_count)
    return greedy_order(start, points, max_count)


def kmeans_cluster(points: List[Tuple[int, float, float]], k: int = 4, max_iter: int = 20):
    """Simple k-means on lat/lon (Euclidean on lat/lon degrees). Returns list of point lists."""
    if k <= 1 or len(points) <= k:
        return [points]

    # init centroids as first k points
    centroids = [(p[1], p[2]) for p in points[:k]]
    clusters = [[] for _ in range(k)]
    for _ in range(max_iter):
        clusters = [[] for _ in range(k)]
        for pid, lat, lon in points:
            # assign to nearest centroid (euclidean on degrees is fine for clustering)
            best = min(range(k), key=lambda i: (centroids[i][0] - lat) ** 2 + (centroids[i][1] - lon) ** 2)
            clusters[best].append((pid, lat, lon))
        new_centroids = []
        for c in clusters:
            if not c:
                new_centroids.append((0.0, 0.0))
            else:
                avg_lat = sum(x[1] for x in c) / len(c)
                avg_lon = sum(x[2] for x in c) / len(c)
                new_centroids.append((avg_lat, avg_lon))
        if all(math.isclose(new_centroids[i][0], centroids[i][0]) and math.isclose(new_centroids[i][1], centroids[i][1]) for i in range(k)):
            break
        centroids = new_centroids
    # drop empty clusters
    return [c for c in clusters if c]
