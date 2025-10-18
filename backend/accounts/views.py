from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserRegistrationSerializer, UserSerializer
from .serializers import GeneratorProfileSerializer
from .models import GeneratorProfile
from .sms import send_otp
from django.core.cache import cache
from django.conf import settings
from django.contrib.auth import get_user_model


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    # Support login via either username or email.
    if not username:
        email = request.data.get("email")
        if email:
            User = get_user_model()
            try:
                user_obj = User.objects.filter(email__iexact=email).first()
                if user_obj:
                    username = getattr(user_obj, 'username', None)
            except Exception:
                username = None

    if username and password:
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )
    return Response(
        {"error": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    return Response(UserSerializer(user).data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def generator_profile(request):
    """GET returns profile if exists. POST creates/updates generator profile for the user."""
    user = request.user
    try:
        profile = user.generator_profile
    except GeneratorProfile.DoesNotExist:
        profile = None

    if request.method == "GET":
        if not profile:
            return Response(
                {"detail": "No profile found"}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(GeneratorProfileSerializer(profile).data)

    # POST
    data = request.data.copy()
    if profile:
        serializer = GeneratorProfileSerializer(profile, data=data, partial=True)
    else:
        serializer = GeneratorProfileSerializer(data=data)
    if serializer.is_valid():
        obj = serializer.save(user=user) if not profile else serializer.save()
        return Response(GeneratorProfileSerializer(obj).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def send_otp_view(request):
    phone = request.data.get("phone")
    if not phone:
        return Response(
            {"success": False, "reason": "phone required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Mirror rate-limit logic to return 429 when limit exceeded before attempting send
    limit = getattr(settings, "SMS_RATE_LIMIT_COUNT", 5)
    key = f"sms_rl:{phone}"
    current = cache.get(key, 0)
    if current >= limit:
        return Response({"success": False, "reason": "rate_limited"}, status=status.HTTP_429_TOO_MANY_REQUESTS)

    sent = send_otp(phone)
    # If not sent (but not rate-limited) return a 200 with reason (fallback saved)
    if sent:
        return Response({"success": True})
    return Response({"success": False, "reason": "not_sent"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_user(request, user_id):
    """Admin endpoint to mark a user as verified after checks."""
    if request.user.role != "admin":
        return Response({"error": "Admin only"}, status=status.HTTP_403_FORBIDDEN)
    User = get_user_model()
    try:
        u = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    setattr(u, 'is_verified', True)
    u.save()
    return Response({"success": True, "user": UserSerializer(u).data})
