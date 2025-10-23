from rest_framework import serializers

from .models import Document, DocumentEmbedding, Favorite, Tag


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
            "file",
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
        read_only_fields = ["id", "date_added", "filename", "path", "status", "owner"]
        extra_kwargs = {
            "file": {"write_only": False, "required": False},
        }


class FavoriteSerializer(serializers.ModelSerializer):
    """CRUD serializer pour les favoris."""

    class Meta:
        model = Favorite
        fields = ["id", "user", "document", "created_at"]
        read_only_fields = ["id", "created_at"]


class DocumentEmbeddingSerializer(serializers.ModelSerializer):
    """Serializer pour exposer les chunks indexés d'un document."""

    class Meta:
        model = DocumentEmbedding
        fields = [
            "chunk_index",
            "page_number",
            "text",
        ]
        read_only_fields = fields
