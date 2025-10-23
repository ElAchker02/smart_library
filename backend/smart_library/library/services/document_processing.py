import logging
import mimetypes
import os
import re
from dataclasses import dataclass
from functools import lru_cache
from typing import Iterable, List, Tuple

import easyocr
import fitz  # PyMuPDF
from django.conf import settings
from django.db import transaction
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from sentence_transformers import SentenceTransformer

from library.models import Document, DocumentEmbedding

logger = logging.getLogger(__name__)


@dataclass
class Chunk:
    """Représente un segment de texte prêt à être vectorisé."""

    text: str
    page_number: int
    index: int


def _ensure_storage_dir():
    """Create the local Qdrant storage directory when using the embedded engine."""
    path = settings.QDRANT.get("PATH")
    if path:
        os.makedirs(path, exist_ok=True)


@lru_cache(maxsize=1)
def get_qdrant_client() -> QdrantClient:
    """Instancie et met en cache le client Qdrant."""
    cfg = settings.QDRANT
    if cfg.get("URL"):
        client = QdrantClient(
            url=cfg["URL"],
            api_key=cfg.get("API_KEY"),
        )
    else:
        _ensure_storage_dir()
        client = QdrantClient(path=cfg["PATH"])
    _ensure_collection(client)
    return client


def _ensure_collection(client: QdrantClient) -> None:
    """Garantit l'existence de la collection utilisée pour indexer les documents."""
    cfg = settings.QDRANT
    collection = cfg["COLLECTION"]
    try:
        client.get_collection(collection)
    except Exception:
        logger.info("Creating Qdrant collection '%s'", collection)
        client.recreate_collection(
            collection_name=collection,
            vectors_config=qmodels.VectorParams(
                size=cfg["VECTOR_SIZE"],
                distance=_distance_from_string(cfg["DISTANCE"]),
            ),
        )


def _distance_from_string(name: str) -> qmodels.Distance:
    """Mappe une chaîne de configuration vers l'enum Distance de Qdrant."""
    mapping = {
        "cosine": qmodels.Distance.COSINE,
        "dot": qmodels.Distance.DOT,
        "euclid": qmodels.Distance.EUCLID,
        "l2": qmodels.Distance.EUCLID,
        "manhattan": qmodels.Distance.MANHATTAN,
    }
    return mapping.get(name.lower(), qmodels.Distance.COSINE)


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    """Charge une seule fois le modèle SentenceTransformer défini en configuration."""
    model_name = settings.QDRANT["EMBEDDING_MODEL"]
    logger.info("Loading embedding model %s", model_name)
    return SentenceTransformer(model_name)


@lru_cache(maxsize=1)
def get_easyocr_reader() -> easyocr.Reader:
    """Initialise EasyOCR avec les langues et la politique GPU configurées."""
    cfg = settings.DOCUMENT_PROCESSING
    languages = cfg.get("OCR_LANGUAGES", ["en"])
    logger.info("Loading EasyOCR with languages %s", languages)
    return easyocr.Reader(languages, gpu=cfg.get("EASYOCR_GPU", False))


def extract_text_from_pdf(file_path: str) -> List[Tuple[int, str]]:
    """Retourne le texte d'un PDF page par page."""
    texts: List[Tuple[int, str]] = []
    with fitz.open(file_path) as doc:
        for idx, page in enumerate(doc, start=1):
            texts.append((idx, page.get_text("text")))
    return texts


def extract_text_from_image(file_path: str) -> List[Tuple[int, str]]:
    """Extrait le texte d'une image à l'aide d'EasyOCR."""
    reader = get_easyocr_reader()
    results = reader.readtext(file_path)
    text = " ".join([content for (_, content, _) in results])
    return [(1, text)]


def clean_text(raw_text: str) -> str:
    """Nettoie et restructure le texte pour faciliter le découpage."""
    text = raw_text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[|~•·▪◆●■□¤▪️]", " ", text)
    text = re.sub(r"\s([?.!,;:])", r"\1", text)
    text = text.strip()
    text = re.sub(r"([.?!])\s+(?=[A-ZÀ-ÖØ-Ý])", r"\1\n", text)
    lines = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        if len(line.split()) <= 6 and line.isupper():
            lines.append(f"\n{line}\n")
        else:
            lines.append(line)
    text = "\n".join(lines)
    text = re.sub(r"\n{2,}", "\n\n", text.strip())
    return text


def generate_chunks(text: str, chunk_size: int, overlap: int) -> Iterable[str]:
    """Découpe un texte en portions avec recouvrement pour limiter la perte de contexte."""
    if chunk_size <= overlap:
        raise ValueError("chunk_size must be greater than overlap")
    words = text.split()
    if not words:
        return []
    start = 0
    length = len(words)
    while start < length:
        end = min(length, start + chunk_size)
        chunk = " ".join(words[start:end]).strip()
        if chunk:
            yield chunk
        if end == length:
            break
        start += max(1, chunk_size - overlap)


def detect_file_type(file_path: str) -> str:
    """Essaye de deviner le type de fichier attendu (pdf vs image)."""
    mimetype, _ = mimetypes.guess_type(file_path)
    if mimetype:
        if "pdf" in mimetype:
            return "pdf"
        if mimetype.startswith("image/"):
            return "image"
    extension = os.path.splitext(file_path)[1].lower()
    if extension == ".pdf":
        return "pdf"
    if extension in {".png", ".jpg", ".jpeg", ".bmp", ".tiff"}:
        return "image"
    return "unknown"


def remove_existing_embeddings(document: Document, client: QdrantClient) -> None:
    """Nettoie les entrées Qdrant et SQL existantes pour un document donné."""
    existing = list(document.embeddings.all())
    if not existing:
        return
    point_ids = [str(entry.point_id) for entry in existing]
    logger.info("Removing %d existing embeddings for %s", len(point_ids), document.id)
    try:
        client.delete(
            collection_name=settings.QDRANT["COLLECTION"],
            points_selector=qmodels.PointIdsList(points=point_ids),
        )
    except Exception as exc:
        logger.warning("Failed to delete existing Qdrant points: %s", exc)
    document.embeddings.all().delete()


def build_qdrant_points(document: Document, chunks: List[Chunk], embeddings: List[List[float]]):
    """Construit les objets PointStruct pour l'upsert dans Qdrant et persiste les chunks."""
    points = []
    for chunk, vector in zip(chunks, embeddings):
        embedding_entry = DocumentEmbedding.objects.create(
            document=document,
            chunk_index=chunk.index,
            page_number=chunk.page_number,
            text=chunk.text,
        )
        points.append(
            qmodels.PointStruct(
                id=str(embedding_entry.point_id),
                vector=vector,
                payload={
                    "document_id": str(document.id),
                    "document_title": document.title,
                    "chunk_index": chunk.index,
                    "page_number": chunk.page_number,
                    "text": chunk.text,
                    "source": document.source,
                    "language": document.language,
                    "tag": document.tag.name if document.tag else None,
                },
            )
        )
    return points


def process_document(document: Document) -> None:
    """Pipeline complet : extraction texte, chunking, embeddings et indexation Qdrant."""
    field_file = document.file
    file_path = ""
    if field_file:
        try:
            file_path = field_file.path
        except (ValueError, NotImplementedError):
            file_path = ""

    if not file_path:
        file_path = document.path

    if not file_path:
        raise ValueError(f"Document {document.id} has no accessible file path.")

    if document.path != file_path:
        document.__class__.objects.filter(pk=document.pk).update(path=file_path)
        document.path = file_path

    cfg = settings.DOCUMENT_PROCESSING
    chunk_size = cfg.get("CHUNK_SIZE", 200)
    overlap = cfg.get("CHUNK_OVERLAP", 40)

    file_type = detect_file_type(file_path)
    logger.info("Processing document %s (%s)", document.id, file_type)

    if file_type == "pdf":
        pages = extract_text_from_pdf(file_path)
    elif file_type == "image":
        pages = extract_text_from_image(file_path)
    else:
        raise ValueError(f"Unsupported file type for {file_path}")

    cleaned_pages: List[Tuple[int, str]] = []
    for page_number, text in pages:
        cleaned = clean_text(text)
        if cleaned:
            cleaned_pages.append((page_number, cleaned))

    if not cleaned_pages:
        raise ValueError("No text extracted from document.")

    document.status = 'processed'
    document.save(update_fields=['status'])

    chunks: List[Chunk] = []
    chunk_index = 1
    for page_number, text in cleaned_pages:
        for chunk_content in generate_chunks(text, chunk_size, overlap):
            chunks.append(Chunk(text=chunk_content, page_number=page_number, index=chunk_index))
            chunk_index += 1

    if not chunks:
        raise ValueError("No chunks generated for document text.")

    model = get_embedding_model()
    embeddings = model.encode([chunk.text for chunk in chunks], convert_to_numpy=True)
    embeddings_list = [vector.tolist() for vector in embeddings]

    client = get_qdrant_client()

    with transaction.atomic():
        remove_existing_embeddings(document, client)
        points = build_qdrant_points(document, chunks, embeddings_list)
        client.upsert(
            collection_name=settings.QDRANT["COLLECTION"],
            points=points,
        )
        document.status = 'indexed'
        document.save(update_fields=['status'])
    logger.info("Document %s indexed with %d chunks", document.id, len(points))
