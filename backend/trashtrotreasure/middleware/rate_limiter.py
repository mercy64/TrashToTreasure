from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.conf import settings
from django.http import JsonResponse


class SimpleRateLimiter(MiddlewareMixin):
    """A minimal rate limiter applied to specific endpoints.

    Uses cache to count hits per key (user id or IP). Settings control limits.
    """

    def process_request(self, request):
        path = request.path.lower()
        # Only throttle sensitive endpoints
        sensitive = ["/api/waste/listings/create/", "/api/waste/listings/"]
        # Claim endpoint prefix
        if path.startswith("/api/waste/listings/") and path.endswith("/claim/"):
            sensitive = [path]

        for p in sensitive:
            if path.startswith(p):
                key = None
                if request.user and request.user.is_authenticated:
                    key = f"rl:u:{request.user.id}:{p}"
                else:
                    ip = request.META.get("REMOTE_ADDR", "anon")
                    key = f"rl:ip:{ip}:{p}"

                limit = getattr(settings, "RATE_LIMIT_COUNT", 10)
                window = getattr(settings, "RATE_LIMIT_WINDOW_SECONDS", 60)
                current = cache.get(key, 0)
                if current >= limit:
                    return JsonResponse({"detail": "rate_limited"}, status=429)
                cache.set(key, current + 1, timeout=window)
                break

        return None
