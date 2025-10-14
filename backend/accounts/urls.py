from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("profile/", views.profile, name="profile"),
    path("generator-profile/", views.generator_profile, name="generator-profile"),
    path("send-otp/", views.send_otp_view, name="send-otp"),
    path("verify-user/<int:user_id>/", views.verify_user, name="verify-user"),
]
