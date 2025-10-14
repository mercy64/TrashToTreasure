"""Route optimization helpers.

Provides a simple OR-Tools-based CVRP/TSP solver when ortools is installed,
otherwise falls back to the greedy nearest-neighbour solver used earlier.
"""
from typing import List, Tuple

try:
    from ortools.constraint_solver import pywrapcp, routing_enums_pb2  # type: ignore
    ORTOOLS_AVAILABLE = True
except Exception:
    ORTOOLS_AVAILABLE = False


def greedy_order(start: Tuple[float, float], points: List[Tuple[int, float, float]], max_count: int = 50):
    """Greedy nearest neighbour. 'points' is list of (id, lat, lon)."""
    remaining = points.copy()
    order = []
    cur_lat, cur_lon = start
    while remaining and len(order) < max_count:
        next_idx = min(
            range(len(remaining)),
            key=lambda i: (cur_lat - remaining[i][1]) ** 2
            + (cur_lon - remaining[i][2]) ** 2,
        )
        pid, plat, plon = remaining.pop(next_idx)
        order.append(pid)
        cur_lat, cur_lon = plat, plon
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

    # Create distance matrix
    def distance(i, j):
        ax, ay = coords[i]
        bx, by = coords[j]
        # use int distances to satisfy ortools
        return int(((ax - bx) ** 2 + (ay - by) ** 2) ** 0.5 * 100000)

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
                dist_matrix[i][j] = int(((ax - bx) ** 2 + (ay - by) ** 2) ** 0.5 * 100000)

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

    return ordered


def compute_route(start: Tuple[float, float], points: List[Tuple[int, float, float]], max_count: int = 50):
    if ORTOOLS_AVAILABLE:
        return ortools_tsp(start, points, max_count)
    return greedy_order(start, points, max_count)
