from django.db import models
from django.conf import settings
import uuid


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
        ('uploaded', 'Uploaded'),
        ('processed', 'Processed'),
        ('indexed', 'Indexed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tag = models.ForeignKey(
        Tag,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents',
        verbose_name="Tag"
    )
    title = models.CharField(max_length=255, verbose_name="Titre")
    filename = models.CharField(max_length=255, verbose_name="Nom du fichier")
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
    path = models.TextField(verbose_name="Chemin du fichier")
    
    class Meta:
        db_table = 'documents'
        verbose_name = "Document"
        verbose_name_plural = "Documents"
        ordering = ['-date_added']
    
    def __str__(self):
        return self.title


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