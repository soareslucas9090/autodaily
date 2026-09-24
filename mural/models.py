from django.db import models

from nucleo.models import ModeloBase


class Categoria(ModeloBase):
    nome = models.CharField(max_length=80, unique=True)

    def __str__(self):
        return self.nome

    class Meta:
        ordering = ['nome']


class Tarefa(ModeloBase):
    autor = models.ForeignKey(
        'nucleo.Usuario',
        on_delete=models.CASCADE,
        related_name='tarefas',
    )
    texto = models.TextField()
    id_trello = models.CharField(max_length=120, blank=True)
    categorias = models.ManyToManyField(
        Categoria,
        blank=True,
        related_name='tarefas',
    )
    na_parede = models.BooleanField(default=True)
    saiu_em = models.DateTimeField(null=True, blank=True)
    denominador_congelado = models.PositiveIntegerField(null=True, blank=True)


class Ciencia(ModeloBase):
    tarefa = models.ForeignKey(
        Tarefa,
        on_delete=models.CASCADE,
        related_name='ciencias',
    )
    programador = models.ForeignKey(
        'nucleo.Usuario',
        on_delete=models.CASCADE,
        related_name='ciencias',
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['tarefa', 'programador'],
                name='ciencia_unica_por_tarefa_programador',
            ),
        ]
