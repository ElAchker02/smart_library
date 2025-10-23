import logging

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Document, Favorite, Tag
from .serializers import (
    DocumentEmbeddingSerializer,
    DocumentSerializer,
    FavoriteSerializer,
    TagSerializer,
)
from .services.document_processing import process_document


def _is_truthy(value) -> bool:
    if isinstance(value, str):
        return value.lower() in {"true", "1", "yes", "on"}
    return bool(value)


logger = logging.getLogger(__name__)


def _process_document_or_raise(document: Document) -> None:
    try:
        process_document(document)
    except Exception as exc:
        logger.exception("Document processing failed for %s", document.id, exc_info=exc)
        document.status = 'uploaded'
        document.save(update_fields=['status'])
        raise ValidationError({"detail": "Document processing failed. Consultez les logs serveur."})


class TagViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les tags."""

    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Tag.objects.all().order_by("name")


class DocumentViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les documents."""

    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Document.objects.select_related("tag", "owner").all().order_by("-date_added")

    def perform_create(self, serializer):
        if "file" not in self.request.FILES:
            raise ValidationError({"file": "Un fichier est requis pour lancer le traitement."})
        document = serializer.save(owner=self.request.user)
        _process_document_or_raise(document)

    def perform_update(self, serializer):
        document = serializer.save()
        reprocess_flag = self.request.data.get("reprocess")
        should_reprocess = "file" in self.request.FILES or _is_truthy(reprocess_flag)
        if should_reprocess:
            _process_document_or_raise(document)

    @action(detail=True, methods=["post"], url_path="reprocess")
    def reprocess(self, request, pk=None):
        document = self.get_object()
        _process_document_or_raise(document)
        refreshed = self.get_serializer(document)
        return Response(refreshed.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="chunks")
    def chunks(self, request, pk=None):
        document = self.get_object()
        embeddings = document.embeddings.order_by("chunk_index")
        serializer = DocumentEmbeddingSerializer(embeddings, many=True)
        base = {
            "document_id": str(document.id),
            "document_title": document.title,
            "source": document.source,
            "language": document.language,
            "tag": document.tag.name if document.tag else None,
        }
        payload = []
        for chunk_data in serializer.data:
            payload.append(
                {
                    **base,
                    **chunk_data,
                }
            )
        return Response(payload, status=status.HTTP_200_OK)


class FavoriteViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les favoris."""

    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Favorite.objects.select_related("user", "document").all().order_by("-created_at")
