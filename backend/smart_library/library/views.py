import logging
from typing import Optional

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
from .permissions import IsSuperAdmin


def _is_truthy(value) -> bool:
    if isinstance(value, str):
        return value.lower() in {"true", "1", "yes", "on"}
    return bool(value)


logger = logging.getLogger(__name__)


def _metadata_is_complete(document: Document) -> bool:
    return bool(document.title and document.language)


def _process_document_or_raise(document: Document, *, fallback_status: Optional[str] = None) -> None:
    try:
        process_document(document)
    except Exception as exc:
        logger.exception("Document processing failed for %s", document.id, exc_info=exc)
        if fallback_status is not None:
            document.status = fallback_status
        else:
            document.status = 'pending_meta' if document.source == 'general' else 'uploaded'
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
        document.status = 'uploaded'
        document.save(update_fields=['status'])
        if document.source == 'general':
            return
        _process_document_or_raise(document)

    def perform_update(self, serializer):
        document = serializer.save()
        reprocess_flag = self.request.data.get("reprocess")
        has_new_file = "file" in self.request.FILES
        if document.source == 'general':
            metadata_complete = _metadata_is_complete(document)
            if document.status == 'pending_meta' and metadata_complete:
                _process_document_or_raise(document, fallback_status='pending_meta')
            elif has_new_file or _is_truthy(reprocess_flag):
                if not metadata_complete:
                    raise ValidationError({"detail": "Completer les metadonnees avant de relancer le traitement."})
                _process_document_or_raise(
                    document,
                    fallback_status='pending_meta',
                )
        else:
            should_reprocess = has_new_file or _is_truthy(reprocess_flag)
            if should_reprocess:
                _process_document_or_raise(document)

    @action(detail=True, methods=["post"], url_path="reprocess")
    def reprocess(self, request, pk=None):
        document = self.get_object()
        if document.source == 'general' and not _metadata_is_complete(document):
            raise ValidationError({"detail": "Completer les metadonnees avant de relancer le traitement."})
        fallback_status = 'pending_meta' if document.source == 'general' else 'uploaded'
        _process_document_or_raise(document, fallback_status=fallback_status)
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

    @action(
        detail=False,
        methods=["get"],
        url_path="awaiting-approval",
        permission_classes=[permissions.IsAuthenticated, IsSuperAdmin],
    )
    def awaiting_approval(self, request):
        queryset = self.get_queryset().filter(source='general', status='uploaded')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["post"],
        url_path="approve",
        permission_classes=[permissions.IsAuthenticated, IsSuperAdmin],
    )
    def approve(self, request, pk=None):
        document = self.get_object()
        if document.source != 'general':
            raise ValidationError({"detail": "Seuls les documents generaux necessitent une validation."})
        if document.status != 'uploaded':
            raise ValidationError({"detail": "Ce document a deja ete traite."})
        document.status = 'pending_meta'
        document.save(update_fields=['status'])
        if _metadata_is_complete(document):
            _process_document_or_raise(document, fallback_status='pending_meta')
        serializer = self.get_serializer(document)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FavoriteViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les favoris."""

    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Favorite.objects.select_related("user", "document").all().order_by("-created_at")
