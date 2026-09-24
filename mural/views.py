from datetime import date

from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse, reverse_lazy
from django.views import View
from django.views.generic import FormView, ListView, TemplateView, UpdateView

from mural.forms import (
    FormularioCategoria,
    FormularioEditarMembro,
    FormularioEditarTarefa,
    FormularioNovoMembro,
    FormularioPublicarTarefa,
    FormularioSenhaMembro,
)
from mural.models import Categoria, Tarefa
from mural.servicos import (
    alternar_ciencia,
    datas_recorte_atalho,
    editar,
    excluir,
    intervalo_criado_em_aware,
    pode_gerenciar_tarefa,
    progresso,
    programadores_que_marcam,
    publicar,
    relatorio_completo,
    relatorio_simples,
    retornar_anterior,
    rotulo_categorias,
    tarefa_atual,
    tem_tarefa_guardada,
)
from nucleo.mixins import AutenticacaoObrigatoriaMixin, PapelExigidoMixin
from nucleo.models import Papel, Usuario
from nucleo.views import AcaoView


def programadores_no_mural():
    return Usuario.objects.filter(
        papel=Papel.PROGRAMADOR,
        is_active=True,
    ).order_by('username')


def linhas_ciencia(tarefa, usuario_logado):
    if tarefa is None:
        return []
    marcados = set(
        tarefa.ciencias.values_list('programador_id', flat=True),
    )
    eh_programador_ativo = (
        usuario_logado.papel == Papel.PROGRAMADOR and usuario_logado.is_active
    )
    linhas = []
    for outro in programadores_que_marcam(tarefa):
        pode_alternar = (
            eh_programador_ativo
            and outro.pk == usuario_logado.pk
        )
        linhas.append({
            'programador': outro,
            'marcado': outro.pk in marcados,
            'pode_alternar': pode_alternar,
        })
    return linhas


def contexto_card(programador, usuario_logado, form_publicar=None, form_editar=None):
    tarefa = tarefa_atual(programador)
    eh_proprio = usuario_logado.pk == programador.pk
    eh_programador = usuario_logado.papel == Papel.PROGRAMADOR
    eh_admin = usuario_logado.papel == Papel.ADMIN
    pode_publicar = eh_proprio and eh_programador and tarefa is None
    pode_editar = eh_proprio and eh_programador and tarefa is not None
    pode_excluir = (
        tarefa is not None
        and (eh_proprio or eh_admin)
    )
    pode_retornar = (
        tarefa is None
        and tem_tarefa_guardada(programador)
        and (eh_proprio or eh_admin)
    )
    if form_publicar is None and pode_publicar:
        form_publicar = FormularioPublicarTarefa()
    if form_editar is None and pode_editar:
        form_editar = FormularioEditarTarefa(
            initial={
                'texto': tarefa.texto,
                'id_trello': tarefa.id_trello,
                'categorias': list(tarefa.categorias.values_list('pk', flat=True)),
            },
        )
    progresso_tarefa = progresso(tarefa) if tarefa else None
    return {
        'programador': programador,
        'tarefa': tarefa,
        'rotulo_categorias': rotulo_categorias(tarefa) if tarefa else '',
        'pode_publicar': pode_publicar,
        'pode_editar': pode_editar,
        'form_publicar': form_publicar,
        'form_editar': form_editar,
        'progresso': progresso_tarefa,
        'linhas_ciencia': linhas_ciencia(tarefa, usuario_logado),
        'usuario_logado': usuario_logado,
        'pode_excluir': pode_excluir,
        'pode_retornar': pode_retornar,
    }


def renderizar_card(request, programador, usuario_logado, **kwargs):
    contexto = contexto_card(programador, usuario_logado, **kwargs)
    return render(request, 'mural/_card.html', contexto)


class MuralView(AutenticacaoObrigatoriaMixin, TemplateView):
    template_name = 'mural/mural.html'

    def get_context_data(self, **kwargs):
        contexto = super().get_context_data(**kwargs)
        cards = [
            contexto_card(programador, self.request.user)
            for programador in programadores_no_mural()
        ]
        contexto['cards'] = cards
        return contexto


class PublicarTarefaView(AutenticacaoObrigatoriaMixin, AcaoView):
    def executar(self, request, *args, **kwargs):
        if request.user.papel != Papel.PROGRAMADOR:
            return HttpResponseForbidden()
        form = FormularioPublicarTarefa(request.POST)
        if not form.is_valid():
            resposta = renderizar_card(
                request,
                request.user,
                request.user,
                form_publicar=form,
            )
            resposta.status_code = 400
            return resposta
        publicar(
            request.user,
            form.cleaned_data['texto'],
            form.cleaned_data.get('id_trello', ''),
            list(form.cleaned_data.get('categorias') or []),
        )
        return self._resposta_card(request, request.user)

    def _resposta_card(self, request, programador):
        resposta = renderizar_card(request, programador, request.user)
        if self.pedido_htmx(request):
            return resposta
        return redirect('inicio')


class AlternarCienciaView(AutenticacaoObrigatoriaMixin, AcaoView):
    def executar(self, request, tarefa_id, *args, **kwargs):
        usuario = request.user
        if usuario.papel != Papel.PROGRAMADOR or not usuario.is_active:
            return HttpResponseForbidden()
        tarefa = get_object_or_404(Tarefa, pk=tarefa_id)
        if tarefa.autor_id == usuario.pk:
            return HttpResponseForbidden()
        if not tarefa.na_parede or tarefa.saiu_em is not None:
            return HttpResponseForbidden()
        alternar_ciencia(tarefa, usuario)
        return PublicarTarefaView._resposta_card(self, request, tarefa.autor)


class EditarTarefaView(AutenticacaoObrigatoriaMixin, AcaoView):
    def executar(self, request, tarefa_id, *args, **kwargs):
        if request.user.papel != Papel.PROGRAMADOR:
            return HttpResponseForbidden()
        tarefa = get_object_or_404(Tarefa, pk=tarefa_id)
        if tarefa.autor_id != request.user.pk:
            return HttpResponseForbidden()
        if not tarefa.na_parede or tarefa.saiu_em is not None:
            return HttpResponseForbidden()
        form = FormularioEditarTarefa(request.POST)
        if not form.is_valid():
            resposta = renderizar_card(
                request,
                request.user,
                request.user,
                form_editar=form,
            )
            resposta.status_code = 400
            return resposta
        editar(
            tarefa,
            form.cleaned_data['texto'],
            form.cleaned_data.get('id_trello', ''),
            list(form.cleaned_data.get('categorias') or []),
        )
        return PublicarTarefaView._resposta_card(self, request, request.user)


class ExcluirTarefaView(AutenticacaoObrigatoriaMixin, AcaoView):
    def executar(self, request, tarefa_id, *args, **kwargs):
        tarefa = get_object_or_404(Tarefa, pk=tarefa_id)
        if not pode_gerenciar_tarefa(request.user, tarefa):
            return HttpResponseForbidden()
        programador = tarefa.autor
        excluir(tarefa)
        proximo = request.POST.get('proximo') or request.GET.get('proximo')
        if proximo == 'historico':
            return redirect(request.POST.get('retorno') or request.GET.get('retorno', reverse('historico')))
        return renderizar_card(request, programador, request.user)


class RetornarAnteriorView(AutenticacaoObrigatoriaMixin, AcaoView):
    def executar(self, request, programador_id, *args, **kwargs):
        programador = get_object_or_404(
            Usuario.objects.filter(papel=Papel.PROGRAMADOR),
            pk=programador_id,
        )
        usuario = request.user
        if usuario.papel != Papel.ADMIN and usuario.pk != programador.pk:
            return HttpResponseForbidden()
        if retornar_anterior(programador) is None:
            return redirect('inicio')
        return renderizar_card(request, programador, request.user)


class HistoricoView(AutenticacaoObrigatoriaMixin, ListView):
    model = Tarefa
    template_name = 'mural/historico.html'
    context_object_name = 'tarefas'

    ATALHOS = (
        ('mes_atual', 'Mês atual'),
        ('mes_passado', 'Mês passado'),
        ('semana_passada', 'Semana passada'),
        ('personalizado', 'Personalizado'),
    )

    def _parametros_consulta(self):
        return self.request.GET.copy()

    def _resolver_periodo(self, parametros):
        atalho = parametros.get('atalho') or 'mes_atual'
        if atalho in ('mes_atual', 'mes_passado', 'semana_passada'):
            inicio, fim = datas_recorte_atalho(atalho)
            return atalho, inicio, fim
        inicio_bruto = parametros.get('inicio', '').strip()
        fim_bruto = parametros.get('fim', '').strip()
        if inicio_bruto and fim_bruto:
            try:
                inicio = date.fromisoformat(inicio_bruto)
                fim = date.fromisoformat(fim_bruto)
            except ValueError:
                inicio, fim = datas_recorte_atalho('mes_atual')
                atalho = 'mes_atual'
            else:
                atalho = 'personalizado'
        else:
            inicio, fim = datas_recorte_atalho('mes_atual')
            atalho = 'mes_atual'
        return atalho, inicio, fim

    def get_queryset(self):
        parametros = self._parametros_consulta()
        _, inicio, fim = self._resolver_periodo(parametros)
        inicio_aware, fim_aware = intervalo_criado_em_aware(inicio, fim)
        queryset = (
            Tarefa.objects.filter(na_parede=False)
            .select_related('autor')
            .prefetch_related('categorias')
        )
        id_trello = parametros.get('id_trello', '').strip()
        if id_trello:
            queryset = queryset.filter(id_trello__icontains=id_trello)
        programador = parametros.get('programador', '').strip()
        if programador:
            queryset = queryset.filter(autor_id=programador)
        queryset = queryset.filter(
            criado_em__gte=inicio_aware,
            criado_em__lte=fim_aware,
        )
        ordem = parametros.get('ordem', 'decrescente')
        if ordem == 'crescente':
            queryset = queryset.order_by('criado_em')
        else:
            queryset = queryset.order_by('-criado_em')
        return queryset

    def get_paginate_by(self, queryset):
        tamanho = self.request.GET.get('tamanho', '20')
        if tamanho not in ('20', '50', '100'):
            return 20
        return int(tamanho)

    def get_context_data(self, **kwargs):
        contexto = super().get_context_data(**kwargs)
        parametros = self._parametros_consulta()
        atalho, inicio, fim = self._resolver_periodo(parametros)
        contexto['atalhos'] = self.ATALHOS
        contexto['atalho_atual'] = atalho
        contexto['filtro_inicio'] = inicio.isoformat()
        contexto['filtro_fim'] = fim.isoformat()
        contexto['filtro_id_trello'] = parametros.get('id_trello', '')
        contexto['filtro_programador'] = parametros.get('programador', '')
        contexto['ordem'] = parametros.get('ordem', 'decrescente')
        tamanho = self.request.GET.get('tamanho', '20')
        contexto['tamanho'] = tamanho if tamanho in ('20', '50', '100') else '20'
        contexto['programadores'] = programadores_no_mural()
        parametros_pagina = parametros.copy()
        parametros_pagina.pop('page', None)
        consulta = parametros_pagina.urlencode()
        contexto['consulta_paginacao'] = consulta
        if consulta:
            contexto['url_historico_atual'] = f'{reverse("historico")}?{consulta}'
        else:
            contexto['url_historico_atual'] = reverse('historico')
        return contexto


class RelatoriosView(AutenticacaoObrigatoriaMixin, TemplateView):
    template_name = 'mural/relatorios.html'

    ATALHOS = HistoricoView.ATALHOS

    def _parametros_consulta(self):
        return self.request.GET.copy()

    def _resolver_periodo(self, parametros):
        atalho = parametros.get('atalho') or 'mes_atual'
        if atalho in ('mes_atual', 'mes_passado', 'semana_passada'):
            inicio, fim = datas_recorte_atalho(atalho)
            return atalho, inicio, fim
        inicio_bruto = parametros.get('inicio', '').strip()
        fim_bruto = parametros.get('fim', '').strip()
        if inicio_bruto and fim_bruto:
            try:
                inicio = date.fromisoformat(inicio_bruto)
                fim = date.fromisoformat(fim_bruto)
            except ValueError:
                inicio, fim = datas_recorte_atalho('mes_atual')
                atalho = 'mes_atual'
            else:
                atalho = 'personalizado'
        else:
            inicio, fim = datas_recorte_atalho('mes_atual')
            atalho = 'mes_atual'
        return atalho, inicio, fim

    def get_context_data(self, **kwargs):
        contexto = super().get_context_data(**kwargs)
        parametros = self._parametros_consulta()
        atalho, inicio, fim = self._resolver_periodo(parametros)
        modo = parametros.get('modo', 'simples')
        if modo not in ('simples', 'completo'):
            modo = 'simples'
        if modo == 'completo':
            dados = relatorio_completo(inicio, fim)
        else:
            dados = relatorio_simples(inicio, fim)
        contexto['atalhos'] = self.ATALHOS
        contexto['atalho_atual'] = atalho
        contexto['filtro_inicio'] = inicio.isoformat()
        contexto['filtro_fim'] = fim.isoformat()
        contexto['modo'] = modo
        contexto['dados'] = dados
        return contexto


class AdminObrigatorioMixin(AutenticacaoObrigatoriaMixin, PapelExigidoMixin):
    papel_exigido = Papel.ADMIN


class ListaMembrosView(AdminObrigatorioMixin, ListView):
    model = Usuario
    template_name = 'mural/membros_lista.html'
    context_object_name = 'membros'

    def get_queryset(self):
        return Usuario.objects.filter(papel=Papel.PROGRAMADOR).order_by('username')


class NovoMembroView(AdminObrigatorioMixin, FormView):
    template_name = 'mural/membros_novo.html'
    form_class = FormularioNovoMembro
    success_url = reverse_lazy('membros_lista')

    def form_valid(self, form):
        form.salvar()
        return super().form_valid(form)


class EditarMembroView(AdminObrigatorioMixin, UpdateView):
    model = Usuario
    form_class = FormularioEditarMembro
    template_name = 'mural/membros_editar.html'
    context_object_name = 'membro'
    pk_url_kwarg = 'membro_id'

    def get_queryset(self):
        return Usuario.objects.filter(papel=Papel.PROGRAMADOR)

    def get_success_url(self):
        return reverse_lazy('membros_lista')


class SenhaMembroView(AdminObrigatorioMixin, FormView):
    template_name = 'mural/membros_senha.html'
    form_class = FormularioSenhaMembro
    pk_url_kwarg = 'membro_id'

    def dispatch(self, request, *args, **kwargs):
        self.membro = get_object_or_404(
            Usuario.objects.filter(papel=Papel.PROGRAMADOR),
            pk=kwargs[self.pk_url_kwarg],
        )
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        contexto = super().get_context_data(**kwargs)
        contexto['membro'] = self.membro
        return contexto

    def form_valid(self, form):
        self.membro.set_password(form.cleaned_data['senha'])
        self.membro.save()
        return redirect('membros_lista')


class DesativarMembroView(AdminObrigatorioMixin, View):
    def post(self, request, membro_id):
        membro = get_object_or_404(
            Usuario.objects.filter(papel=Papel.PROGRAMADOR),
            pk=membro_id,
        )
        membro.is_active = False
        membro.save(update_fields=['is_active'])
        return redirect('membros_lista')

    def get(self, request, membro_id):
        return HttpResponseForbidden()


class ReativarMembroView(AdminObrigatorioMixin, View):
    def post(self, request, membro_id):
        membro = get_object_or_404(
            Usuario.objects.filter(papel=Papel.PROGRAMADOR),
            pk=membro_id,
        )
        membro.is_active = True
        membro.save(update_fields=['is_active'])
        return redirect('membros_lista')

    def get(self, request, membro_id):
        return HttpResponseForbidden()


class ListaCategoriasView(AdminObrigatorioMixin, ListView):
    model = Categoria
    template_name = 'mural/categorias_lista.html'
    context_object_name = 'categorias'


class NovaCategoriaView(AdminObrigatorioMixin, FormView):
    template_name = 'mural/categorias_nova.html'
    form_class = FormularioCategoria
    success_url = reverse_lazy('categorias_lista')

    def form_valid(self, form):
        form.save()
        return super().form_valid(form)


class ExcluirCategoriaView(AdminObrigatorioMixin, View):
    def post(self, request, categoria_id):
        categoria = get_object_or_404(Categoria, pk=categoria_id)
        categoria.delete()
        return redirect('categorias_lista')

    def get(self, request, categoria_id):
        return HttpResponseForbidden()
