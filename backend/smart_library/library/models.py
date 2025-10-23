import os
import uuid

from django.conf import settings
from django.db import models


class Tag(models.Model):
    """Modèle pour gérer les tags/étiquettes des documents"""
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True, verbose_name="Nom du tag")
    
    class Meta:
        db_table = 'tags'
        verbose_name = "Tag"
        verbose_name_plural = "Tags"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Document(models.Model):
    """Modèle pour gérer les documents"""
    
    SOURCE_CHOICES = [
        ('general', 'General'),
        ('personal', 'Personal'),
    ]
    
    STATUS_CHOICES = [
        ('pending_meta', 'Pending Metadata'),
        ('uploaded', 'Uploaded'),
        ('processed', 'Processed'),
        ('indexed', 'Indexed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='documents/', blank=True, null=True, verbose_name="Fichier")
    tag = models.ForeignKey(
        Tag,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents',
        verbose_name="Tag"
    )
    title = models.CharField(max_length=255, verbose_name="Titre")
    filename = models.CharField(max_length=255, blank=True, verbose_name="Nom du fichier")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_documents',
        verbose_name="Propriétaire"
    )
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default='personal',
        verbose_name="Source"
    )
    language = models.CharField(max_length=10, blank=True, verbose_name="Langue")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='uploaded',
        verbose_name="Statut"
    )
    date_added = models.DateTimeField(auto_now_add=True, verbose_name="Date d'ajout")
    path = models.TextField(blank=True, verbose_name="Chemin du fichier")
    
    class Meta:
        db_table = 'documents'
        verbose_name = "Document"
        verbose_name_plural = "Documents"
        ordering = ['-date_added']
    
    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.file:
            self.filename = os.path.basename(self.file.name)
        else:
            self.filename = ""

        super().save(*args, **kwargs)

        if self.file:
            try:
                actual_path = self.file.path
            except (ValueError, NotImplementedError):
                actual_path = ""
        else:
            actual_path = ""

        model = self.__class__
        if actual_path and self.path != actual_path:
            model.objects.filter(pk=self.pk).update(path=actual_path)
            self.path = actual_path
        elif not actual_path and self.path:
            model.objects.filter(pk=self.pk).update(path="")
            self.path = ""


class Favorite(models.Model):
    """Modèle pour gérer les documents favoris des utilisateurs"""
    
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name="Utilisateur"
    )
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='favorited_by',
        verbose_name="Document"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date d'ajout")
    
    class Meta:
        db_table = 'favorites'
        verbose_name = "Favori"
        verbose_name_plural = "Favoris"
        ordering = ['-created_at']
        unique_together = ['user', 'document']
    
    def __str__(self):
        return f"{self.user.name} - {self.document.title}"


class DocumentEmbedding(models.Model):
    """Stocke les métadonnées des chunks indexés dans Qdrant."""

    id = models.AutoField(primary_key=True)
    point_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='embeddings'
    )
    chunk_index = models.PositiveIntegerField()
    page_number = models.PositiveIntegerField(null=True, blank=True)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_embeddings'
        verbose_name = "Chunk de document"
        verbose_name_plural = "Chunks de documents"
        ordering = ['chunk_index']
        unique_together = ('document', 'chunk_index')

    def __str__(self):
        return f"{self.document.title} [chunk {self.chunk_index}]"
