from rest_framework import permissions, viewsets

from .models import Conversation, Message, MessageReference
from .serializers import (
    ConversationSerializer,
    MessageReferenceSerializer,
    MessageSerializer,
)


class ConversationViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les conversations."""

    serializer_class = ConversationSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Conversation.objects.select_related("user").all().order_by("-last_activity")


class MessageViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les messages."""

    serializer_class = MessageSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Message.objects.select_related("conversation").all().order_by("created_at")


class MessageReferenceViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les références de messages."""

    serializer_class = MessageReferenceSerializer
    permission_classes = [permissions.AllowAny]
    queryset = (
        MessageReference.objects.select_related("message", "document")
        .all()
        .order_by("id")
    )
