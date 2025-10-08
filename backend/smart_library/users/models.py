from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class User(AbstractUser):
    """Modèle utilisateur étendu avec des champs personnalisés"""
    
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('user', 'User'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name="Nom complet")
    email = models.EmailField(max_length=100, unique=True, verbose_name="Email")
    password = models.TextField(verbose_name="Mot de passe")
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='user',
        verbose_name="Rôle"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    # Désactiver les champs par défaut d'AbstractUser non utilisés
    username = None
    first_name = None
    last_name = None
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = "users"
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.email})"


class Setting(models.Model):
    """Modèle pour stocker les paramètres de l'application"""
    
    id = models.AutoField(primary_key=True)
    key = models.CharField(max_length=50, unique=True, verbose_name="Clé")
    value = models.TextField(verbose_name="Valeur")
    
    class Meta:
        db_table = 'settings'
        verbose_name = "Paramètre"
        verbose_name_plural = "Paramètres"
        ordering = ['key']
    
    def __str__(self):
        return f"{self.key}: {self.value[:50]}"
    
    @classmethod
    def get_value(cls, key, default=None):
        """Récupère la valeur d'un paramètre par sa clé"""
        try:
            return cls.objects.get(key=key).value
        except cls.DoesNotExist:
            return default
    
    @classmethod
    def set_value(cls, key, value):
        """Définit ou met à jour un paramètre"""
        obj, created = cls.objects.update_or_create(
            key=key,
            defaults={'value': value}
        )
        return obj
