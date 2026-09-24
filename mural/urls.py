from django.urls import path

from mural.views import (
    AlternarCienciaView,
    DesativarMembroView,
    EditarMembroView,
    EditarTarefaView,
    ExcluirCategoriaView,
    ExcluirTarefaView,
    HistoricoView,
    RelatoriosView,
    ListaCategoriasView,
    ListaMembrosView,
    NovaCategoriaView,
    NovoMembroView,
    PublicarTarefaView,
    ReativarMembroView,
    RetornarAnteriorView,
    SenhaMembroView,
)

urlpatterns = [
    path('tarefa/publicar/', PublicarTarefaView.as_view(), name='tarefa_publicar'),
    path('tarefa/<int:tarefa_id>/editar/', EditarTarefaView.as_view(), name='tarefa_editar'),
    path(
        'tarefa/<int:tarefa_id>/ciencia/',
        AlternarCienciaView.as_view(),
        name='tarefa_ciencia',
    ),
    path(
        'tarefa/<int:tarefa_id>/excluir/',
        ExcluirTarefaView.as_view(),
        name='tarefa_excluir',
    ),
    path(
        'programador/<int:programador_id>/retornar/',
        RetornarAnteriorView.as_view(),
        name='tarefa_retornar',
    ),
    path('historico/', HistoricoView.as_view(), name='historico'),
    path('relatorios/', RelatoriosView.as_view(), name='relatorios'),
    path('membros/', ListaMembrosView.as_view(), name='membros_lista'),
    path('membros/novo/', NovoMembroView.as_view(), name='membros_novo'),
    path('membros/<int:membro_id>/editar/', EditarMembroView.as_view(), name='membros_editar'),
    path('membros/<int:membro_id>/senha/', SenhaMembroView.as_view(), name='membros_senha'),
    path('membros/<int:membro_id>/desativar/', DesativarMembroView.as_view(), name='membros_desativar'),
    path('membros/<int:membro_id>/reativar/', ReativarMembroView.as_view(), name='membros_reativar'),
    path('categorias/', ListaCategoriasView.as_view(), name='categorias_lista'),
    path('categorias/nova/', NovaCategoriaView.as_view(), name='categorias_nova'),
    path(
        'categorias/<int:categoria_id>/excluir/',
        ExcluirCategoriaView.as_view(),
        name='categorias_excluir',
    ),
]
