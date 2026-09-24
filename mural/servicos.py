from calendar import monthrange
from collections import defaultdict
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from django.utils import timezone

from mural.models import Ciencia, Tarefa
from nucleo.models import Papel, Usuario

FUSO_SAO_PAULO = ZoneInfo('America/Sao_Paulo')


def tarefa_atual(autor):
    return (
        Tarefa.objects.filter(autor=autor, na_parede=True, saiu_em__isnull=True)
        .first()
    )


def programadores_que_marcam(tarefa):
    return Usuario.objects.filter(
        papel=Papel.PROGRAMADOR,
        is_active=True,
    ).exclude(pk=tarefa.autor_id).order_by('username')


def progresso(tarefa):
    na_parede = tarefa.na_parede and tarefa.saiu_em is None
    if na_parede:
        y = programadores_que_marcam(tarefa).count()
        x = (
            tarefa.ciencias.filter(
                programador__papel=Papel.PROGRAMADOR,
                programador__is_active=True,
            )
            .exclude(programador_id=tarefa.autor_id)
            .count()
        )
    else:
        y = tarefa.denominador_congelado or 0
        x = tarefa.ciencias.count()
    if y:
        percentual = round(x / y * 100)
    else:
        percentual = 0
    completo = y > 0 and x == y
    return {
        'x': x,
        'y': y,
        'percentual': percentual,
        'completo': completo,
    }


def alternar_ciencia(tarefa, programador):
    existente = Ciencia.objects.filter(tarefa=tarefa, programador=programador).first()
    if existente is not None:
        existente.delete()
        return False
    Ciencia.objects.create(tarefa=tarefa, programador=programador)
    return True


def publicar(autor, texto, id_trello='', categorias=None):
    if categorias is None:
        categorias = []
    atual = tarefa_atual(autor)
    if atual is not None:
        atual.na_parede = False
        atual.saiu_em = timezone.now()
        atual.denominador_congelado = programadores_que_marcam(atual).count()
        atual.save(
            update_fields=[
                'na_parede',
                'saiu_em',
                'denominador_congelado',
                'atualizado_em',
            ],
        )
    tarefa = Tarefa.objects.create(
        autor=autor,
        texto=texto,
        id_trello=id_trello or '',
        na_parede=True,
    )
    if categorias:
        tarefa.categorias.set(categorias)
    return tarefa


def editar(tarefa, texto, id_trello='', categorias=None):
    if categorias is None:
        categorias = []
    tarefa.texto = texto
    tarefa.id_trello = id_trello or ''
    tarefa.save(update_fields=['texto', 'id_trello', 'atualizado_em'])
    tarefa.categorias.set(categorias)
    return tarefa


def rotulo_categorias(tarefa):
    nomes = list(tarefa.categorias.order_by('nome').values_list('nome', flat=True))
    if not nomes:
        return ''
    if len(nomes) == 1:
        return nomes[0]
    return f'{nomes[0]} e mais...'


def pode_gerenciar_tarefa(usuario, tarefa):
    if usuario.papel == Papel.ADMIN:
        return True
    return tarefa.autor_id == usuario.pk


def tarefa_guardada_mais_recente(autor):
    return (
        Tarefa.objects.filter(autor=autor, na_parede=False)
        .order_by('-saiu_em')
        .first()
    )


def tem_tarefa_guardada(autor):
    return Tarefa.objects.filter(autor=autor, na_parede=False).exists()


def excluir(tarefa):
    tarefa.delete()


def retornar_anterior(autor):
    guardada = tarefa_guardada_mais_recente(autor)
    if guardada is None:
        return None
    guardada.na_parede = True
    guardada.saiu_em = None
    guardada.denominador_congelado = None
    guardada.save(
        update_fields=[
            'na_parede',
            'saiu_em',
            'denominador_congelado',
            'atualizado_em',
        ],
    )
    guardada.ciencias.filter(programador__is_active=False).delete()
    return guardada


def data_hoje_sao_paulo():
    return timezone.now().astimezone(FUSO_SAO_PAULO).date()


def _ultimo_dia_mes(ano, mes):
    return monthrange(ano, mes)[1]


def datas_recorte_atalho(atalho, referencia=None):
    if referencia is None:
        referencia = data_hoje_sao_paulo()
    if atalho == 'mes_atual':
        return referencia.replace(day=1), referencia.replace(
            day=_ultimo_dia_mes(referencia.year, referencia.month),
        )
    if atalho == 'mes_passado':
        primeiro_mes = referencia.replace(day=1)
        ultimo_mes_anterior = primeiro_mes - timedelta(days=1)
        ano = ultimo_mes_anterior.year
        mes = ultimo_mes_anterior.month
        return date(ano, mes, 1), date(ano, mes, _ultimo_dia_mes(ano, mes))
    if atalho == 'semana_passada':
        segunda_esta = referencia - timedelta(days=referencia.weekday())
        segunda_passada = segunda_esta - timedelta(days=7)
        domingo_passada = segunda_passada + timedelta(days=6)
        return segunda_passada, domingo_passada
    raise ValueError(atalho)


def intervalo_criado_em_aware(inicio, fim):
    inicio_aware = datetime.combine(inicio, time.min, tzinfo=FUSO_SAO_PAULO)
    fim_aware = datetime.combine(
        fim,
        time(23, 59, 59, 999000),
        tzinfo=FUSO_SAO_PAULO,
    )
    return inicio_aware, fim_aware


def tarefas_no_recorte(inicio, fim):
    inicio_aware, fim_aware = intervalo_criado_em_aware(inicio, fim)
    return (
        Tarefa.objects.filter(
            criado_em__gte=inicio_aware,
            criado_em__lte=fim_aware,
        )
        .select_related('autor')
        .prefetch_related('categorias')
        .order_by('criado_em')
    )


def duracao_tarefa(tarefa, agora=None):
    if agora is None:
        agora = timezone.now()
    fim = tarefa.saiu_em if tarefa.saiu_em is not None else agora
    return fim - tarefa.criado_em


def formatar_duracao(duracao):
    total_segundos = duracao.total_seconds()
    horas = total_segundos / 3600
    if horas >= 1:
        arredondado = round(horas, 1)
        if arredondado == int(arredondado):
            return f'{int(arredondado)}h'
        return f'{arredondado}h'
    minutos = int(total_segundos // 60)
    if minutos:
        return f'{minutos}min'
    return '0min'


def relatorio_simples(inicio, fim):
    tarefas = list(tarefas_no_recorte(inicio, fim))
    por_programador_map = defaultdict(int)
    por_dia_map = defaultdict(int)
    for tarefa in tarefas:
        por_programador_map[tarefa.autor.username] += 1
        dia = tarefa.criado_em.astimezone(FUSO_SAO_PAULO).date().isoformat()
        por_dia_map[dia] += 1
    por_programador = [
        {'username': username, 'quantidade': por_programador_map[username]}
        for username in sorted(por_programador_map.keys())
    ]
    por_dia = [
        {'data': dia, 'quantidade': por_dia_map[dia]}
        for dia in sorted(por_dia_map.keys())
    ]
    return {
        'por_programador': por_programador,
        'por_dia': por_dia,
    }


def _rotulo_id_trello(id_bruto):
    return id_bruto if id_bruto else 'sem id'


def relatorio_completo(inicio, fim, agora=None):
    if agora is None:
        agora = timezone.now()
    simples = relatorio_simples(inicio, fim)
    tarefas = list(tarefas_no_recorte(inicio, fim))
    por_id_map = defaultdict(lambda: {'quantidade': 0, 'autores': set()})
    for tarefa in tarefas:
        chave = tarefa.id_trello or ''
        por_id_map[chave]['quantidade'] += 1
        por_id_map[chave]['autores'].add(tarefa.autor_id)
    por_id_trello = sorted(
        [
            {
                'id': _rotulo_id_trello(chave),
                'quantidade': dados['quantidade'],
                'programadores_distintos': len(dados['autores']),
            }
            for chave, dados in por_id_map.items()
        ],
        key=lambda linha: linha['id'],
    )
    duracoes = []
    linhas_tarefas = []
    ciencia_fechadas = 0
    for tarefa in tarefas:
        duracao = duracao_tarefa(tarefa, agora)
        duracoes.append(duracao)
        prog = progresso(tarefa)
        if prog['completo']:
            ciencia_fechadas += 1
        linhas_tarefas.append(
            {
                'tarefa': tarefa,
                'rotulo_categorias': rotulo_categorias(tarefa),
                'duracao': duracao,
                'duracao_texto': formatar_duracao(duracao),
                'progresso': prog,
            },
        )
    if duracoes:
        tempo_medio = sum(duracoes, timedelta()) / len(duracoes)
        tempo_medio_texto = formatar_duracao(tempo_medio)
    else:
        tempo_medio = None
        tempo_medio_texto = None
    return {
        **simples,
        'por_id_trello': por_id_trello,
        'tarefas': linhas_tarefas,
        'tempo_medio': tempo_medio,
        'tempo_medio_texto': tempo_medio_texto,
        'ciencia_fechadas': ciencia_fechadas,
    }
