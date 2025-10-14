import unittest
from ..optimizers import compute_route, ORTOOLS_AVAILABLE, greedy_order


def euclidean_length(order, points, start=(0.0, 0.0)):
    id_to_point = {pid: (lat, lon) for pid, lat, lon in points}
    cur = start
    total = 0.0
    for pid in order:
        nxt = id_to_point[pid]
        total += ((cur[0]-nxt[0])**2 + (cur[1]-nxt[1])**2) ** 0.5
        cur = nxt
    return total


class OptimizerTest(unittest.TestCase):
    def setUp(self):
        # Small symmetric set of points around origin
        self.points = [
            (1, 0.0, 0.1),
            (2, 0.1, 0.0),
            (3, -0.1, 0.0),
            (4, 0.0, -0.1),
        ]

    def test_ortools_improves_or_equals_greedy(self):
        greedy = greedy_order((0.0, 0.0), self.points, max_count=4)
        greedy_len = euclidean_length(greedy, self.points)

        route = compute_route((0.0, 0.0), self.points, max_count=4)
        route_len = euclidean_length(route, self.points)

        # If OR-Tools not available we still expect compute_route == greedy
        if ORTOOLS_AVAILABLE:
            # route length should be <= greedy
            self.assertLessEqual(route_len, greedy_len)
        else:
            self.assertEqual(route, greedy)


if __name__ == "__main__":
    unittest.main()
