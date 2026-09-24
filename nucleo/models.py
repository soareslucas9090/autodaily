from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class ModeloBase(models.Model):
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Papel(models.TextChoices):
    ADMIN = 'admin', 'Admin'
    PROGRAMADOR = 'programador', 'Programador'


class Tinta(models.TextChoices):
    AZUL = 'azul', 'Azul'
    PRETA = 'preta', 'Preta'


class UsuarioManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('papel', Papel.ADMIN)
        extra_fields.setdefault('is_active', True)
        return super().create_superuser(username, email, password, **extra_fields)


class Usuario(AbstractUser):
    email = models.EmailField(blank=True, default='')
    papel = models.CharField(
        max_length=20,
        choices=Papel.choices,
        default=Papel.PROGRAMADOR,
    )
    tinta = models.CharField(
        max_length=10,
        choices=Tinta.choices,
        default=Tinta.AZUL,
    )

    objects = UsuarioManager()

    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'usuário'
        verbose_name_plural = 'usuários'
