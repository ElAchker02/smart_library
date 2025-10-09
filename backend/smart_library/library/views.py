from rest_framework import permissions, viewsets

from .models import Document, Favorite, Tag
from .serializers import DocumentSerializer, FavoriteSerializer, TagSerializer


class TagViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les tags."""

    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Tag.objects.all().order_by("name")


class DocumentViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les documents."""

    serializer_class = DocumentSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Document.objects.select_related("tag", "owner").all().order_by("-date_added")


class FavoriteViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les favoris."""

    serializer_class = FavoriteSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Favorite.objects.select_related("user", "document").all().order_by("-created_at")
