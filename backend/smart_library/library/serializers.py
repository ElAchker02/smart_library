from rest_framework import serializers

from .models import Document, Favorite, Tag


class TagSerializer(serializers.ModelSerializer):
    """CRUD serializer pour les tags."""

    class Meta:
        model = Tag
        fields = ["id", "name"]
        read_only_fields = ["id"]


class DocumentSerializer(serializers.ModelSerializer):
    """CRUD serializer pour les documents."""

    class Meta:
        model = Document
        fields = [
            "id",
            "tag",
            "title",
            "filename",
            "owner",
            "source",
            "language",
            "status",
            "date_added",
            "path",
        ]
        read_only_fields = ["id", "date_added"]


class FavoriteSerializer(serializers.ModelSerializer):
    """CRUD serializer pour les favoris."""

    class Meta:
        model = Favorite
        fields = ["id", "user", "document", "created_at"]
        read_only_fields = ["id", "created_at"]

