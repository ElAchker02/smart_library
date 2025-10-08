from django.db import models
from django.conf import settings
import uuid


class Conversation(models.Model):
    """Modèle pour gérer les conversations des utilisateurs avec l'assistant"""
    
    MODE_CHOICES = [
        ('general', 'General'),
        ('personal', 'Personal'),
        ('mixed', 'Mixed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations',
        verbose_name="Utilisateur"
    )
    title = models.CharField(max_length=255, verbose_name="Titre")
    started_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de début")
    last_activity = models.DateTimeField(
        auto_now=True,
        verbose_name="Dernière activité"
    )
    mode = models.CharField(
        max_length=20,
        choices=MODE_CHOICES,
        verbose_name="Mode"
    )
    is_active = models.BooleanField(default=True, verbose_name="Active")
    
    class Meta:
        db_table = 'conversations'
        verbose_name = "Conversation"
        verbose_name_plural = "Conversations"
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"{self.title} - {self.user.name}"


class Message(models.Model):
    """Modèle pour gérer les messages dans les conversations"""
    
    SENDER_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name="Conversation"
    )
    sender = models.CharField(
        max_length=10,
        choices=SENDER_CHOICES,
        verbose_name="Expéditeur"
    )
    content = models.TextField(verbose_name="Contenu")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    
    class Meta:
        db_table = 'messages'
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.sender} - {self.content[:50]}"


class MessageReference(models.Model):
    """Modèle pour gérer les références des messages aux documents"""
    
    SOURCE_TYPE_CHOICES = [
        ('general', 'General'),
        ('personal', 'Personal'),
    ]
    
    id = models.AutoField(primary_key=True)
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='references',
        verbose_name="Message"
    )
    document = models.ForeignKey(
        'library.Document',  # Référence au modèle de document de l'application library
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='message_references',
        verbose_name="Document"
    )
    source_type = models.CharField(
        max_length=20,
        choices=SOURCE_TYPE_CHOICES,
        verbose_name="Type de source"
    )
    citation = models.TextField(
        blank=True,
        null=True,
        verbose_name="Citation"
    )
    
    class Meta:
        db_table = 'message_references'
        verbose_name = "Référence de message"
        verbose_name_plural = "Références de messages"
        ordering = ['id']
    
    def __str__(self):
        doc_title = self.document.title if self.document else "Sans document"
        return f"Ref: {doc_title} - {self.source_type}"
