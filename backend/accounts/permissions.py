from functools import wraps
from rest_framework.response import Response
from rest_framework import status


def role_required(allowed_roles):
    """Decorator for DRF views to allow only users with specific roles.

    Usage:
        @api_view(['GET'])
        @permission_classes([IsAuthenticated])
        @role_required(['buyer', 'admin'])
        def my_view(request):
            ...
    """

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            user = getattr(request, "user", None)
            if not user or not getattr(user, "is_authenticated", False):
                return Response(
                    {"detail": "Authentication required."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            if user.role not in allowed_roles:
                return Response(
                    {"detail": "Permission denied."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            return view_func(request, *args, **kwargs)

        return _wrapped_view

    return decorator
