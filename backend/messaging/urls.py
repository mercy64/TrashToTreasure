from django.urls import path
from . import views

urlpatterns = [
    path("conversations/", views.my_conversations, name="my-conversations"),
    path("conversations/<int:conversation_id>/messages/", views.conversation_messages, name="conversation-messages"),
    path("messages/send/", views.send_message, name="send-message"),
    path("notifications/", views.my_notifications, name="my-notifications"),
    path("notifications/<int:notification_id>/read/", views.mark_notification_read, name="mark-notification-read"),
]
