from rest_framework import serializers

from .models import Conversation, Message, MessageReference


class ConversationSerializer(serializers.ModelSerializer):
    """CRUD serializer pour les conversations."""

    class Meta:
        model = Conversation
        fields = [
            "id",
            "user",
            "title",
            "started_at",
            "last_activity",
            "mode",
            "is_active",
        ]
        read_only_fields = ["id", "started_at", "last_activity"]


class MessageSerializer(serializers.ModelSerializer):
    """CRUD serializer pour les messages."""

    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender",
            "content",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class MessageReferenceSerializer(serializers.ModelSerializer):
    """CRUD serializer pour les références de messages."""

    class Meta:
        model = MessageReference
        fields = [
            "id",
            "message",
            "document",
            "source_type",
            "citation",
        ]
        read_only_fields = ["id"]

