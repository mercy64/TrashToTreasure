from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
from .models import Conversation, Message, Notification
from .serializers import ConversationSerializer, MessageSerializer, MessageCreateSerializer, NotificationSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_conversations(request):
    conversations = Conversation.objects.filter(participants=request.user)
    serializer = ConversationSerializer(conversations, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    conversation_id = request.data.get('conversation_id')
    receiver_id = request.data.get('receiver_id')
    
    # Get or create conversation
    if conversation_id:
        conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
    elif receiver_id:
        from accounts.models import User
        receiver = get_object_or_404(User, id=receiver_id)
        conversation, created = Conversation.objects.get_or_create(
            defaults={'created_at': models.functions.Now()}
        )
        conversation.participants.add(request.user, receiver)
    else:
        return Response({'error': 'conversation_id or receiver_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = MessageCreateSerializer(data=request.data)
    if serializer.is_valid():
        message = serializer.save(conversation=conversation, sender=request.user)
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_messages(request, conversation_id):
    conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
    messages = conversation.messages.all()
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    notifications = Notification.objects.filter(user=request.user)
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.is_read = True
    notification.save()
    return Response({'status': 'marked as read'})