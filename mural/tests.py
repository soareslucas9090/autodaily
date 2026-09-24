from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from django.contrib.auth import authenticate
from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone

from mural.models import Categoria, Ciencia, Tarefa
from mural.servicos import (
    duracao_tarefa,
    excluir,
    relatorio_completo,
    relatorio_simples,
    progresso,
    publicar,
    tarefa_atual,
)
from nucleo.models import Papel, Usuario

FUSO_SAO_PAULO = ZoneInfo('America/Sao_Paulo')


class AcessoMembrosCategoriasTest(TestCase):
    def setUp(self):
        self.cliente = Client()
        self.admin = Usuario.objects.create_superuser(
            username='admin_teste',
            password='abc123',
        )
        self.programador = Usuario.objects.create_user(
            username='dev_teste',
            password='abc123',
        )

    def test_programador_get_membros_retorna_403(self):
        self.cliente.force_login(self.programador)
        resposta = self.cliente.get(reverse('membros_lista'))
        self.assertEqual(resposta.status_code, 403)

    def test_programador_get_categorias_retorna_403(self):
        self.cliente.force_login(self.programador)
        resposta = self.cliente.get(reverse('categorias_lista'))
        self.assertEqual(resposta.status_code, 403)

    def test_admin_get_membros_retorna_200(self):
        self.cliente.force_login(self.admin)
        resposta = self.cliente.get(reverse('membros_lista'))
        self.assertEqual(resposta.status_code, 200)


class GestaoMembrosTest(TestCase):
    def setUp(self):
        self.cliente = Client()
        self.admin = Usuario.objects.create_superuser(
            username='admin_gestao',
            password='abc123',
        )
        self.cliente.force_login(self.admin)

    def test_admin_cria_programador_autentica_com_papel_programador(self):
        resposta = self.cliente.post(
            reverse('membros_novo'),
            {'username': 'novo_dev', 'senha': 'abc123'},
        )
        self.assertEqual(resposta.status_code, 302)
        usuario = authenticate(username='novo_dev', password='abc123')
        self.assertIsNotNone(usuario)
        self.assertEqual(usuario.papel, Papel.PROGRAMADOR)

    def test_senha_curta_nao_cria_usuario(self):
        resposta = self.cliente.post(
            reverse('membros_novo'),
            {'username': 'falha_dev', 'senha': '12345'},
        )
        self.assertEqual(resposta.status_code, 200)
        self.assertFalse(Usuario.objects.filter(username='falha_dev').exists())

    def test_desativar_impede_autenticacao_usuario_permanece(self):
        dev = Usuario.objects.create_user(username='para_desativar', password='abc123')
        self.cliente.post(reverse('membros_desativar', args=[dev.pk]))
        self.assertIsNone(authenticate(username='para_desativar', password='abc123'))
        self.assertTrue(Usuario.objects.filter(pk=dev.pk).exists())

    def test_reativar_restaura_autenticacao(self):
        dev = Usuario.objects.create_user(
            username='para_reativar',
            password='abc123',
            is_active=False,
        )
        self.cliente.post(reverse('membros_reativar', args=[dev.pk]))
        self.assertIsNotNone(authenticate(username='para_reativar', password='abc123'))

    def test_redefinir_senha(self):
        dev = Usuario.objects.create_user(username='troca_senha', password='abc123')
        self.cliente.post(
            reverse('membros_senha', args=[dev.pk]),
            {'senha': 'nova654'},
        )
        self.assertIsNone(authenticate(username='troca_senha', password='abc123'))
        self.assertIsNotNone(authenticate(username='troca_senha', password='nova654'))


class GestaoCategoriasTest(TestCase):
    def setUp(self):
        self.cliente = Client()
        self.admin = Usuario.objects.create_superuser(
            username='admin_cat',
            password='abc123',
        )
        self.programador = Usuario.objects.create_user(
            username='dev_cat',
            password='abc123',
        )

    def test_excluir_categoria_mantem_tarefa_sem_vinculo(self):
        self.cliente.force_login(self.admin)
        self.cliente.post(reverse('categorias_nova'), {'nome': 'Alpha'})
        categoria = Categoria.objects.get(nome='Alpha')
        tarefa = Tarefa.objects.create(autor=self.programador, texto='Teste')
        tarefa.categorias.add(categoria)
        self.cliente.post(reverse('categorias_excluir', args=[categoria.pk]))
        tarefa.refresh_from_db()
        self.assertTrue(Tarefa.objects.filter(pk=tarefa.pk).exists())
        self.assertEqual(tarefa.categorias.count(), 0)

    def test_programador_post_excluir_categoria_retorna_403(self):
        categoria = Categoria.objects.create(nome='Beta')
        self.cliente.force_login(self.programador)
        resposta = self.cliente.post(reverse('categorias_excluir', args=[categoria.pk]))
        self.assertEqual(resposta.status_code, 403)
        self.assertTrue(Categoria.objects.filter(pk=categoria.pk).exists())


class MuralTarefaAtualTest(TestCase):
    def setUp(self):
        self.cliente = Client()
        self.admin = Usuario.objects.create_superuser(
            username='admin_mural',
            password='abc123',
        )
        self.dev_a = Usuario.objects.create_user(
            username='dev_a',
            password='abc123',
        )
        self.dev_b = Usuario.objects.create_user(
            username='dev_b',
            password='abc123',
        )

    def test_mural_programador_mostra_dois_cards_sem_admin(self):
        self.cliente.force_login(self.dev_a)
        resposta = self.cliente.get(reverse('inicio'))
        self.assertEqual(resposta.status_code, 200)
        html = resposta.content.decode()
        self.assertIn('dev_a', html)
        self.assertIn('dev_b', html)
        self.assertNotIn('admin_mural', html)
        self.assertEqual(html.count('id="card-'), 2)

    def test_programador_desativado_nao_aparece_no_mural(self):
        Usuario.objects.create_user(
            username='inativo_mural',
            password='abc123',
            is_active=False,
        )
        self.cliente.force_login(self.dev_a)
        resposta = self.cliente.get(reverse('inicio'))
        html = resposta.content.decode()
        self.assertNotIn('inativo_mural', html)

    def test_publicar_so_texto_cria_tarefa_na_parede(self):
        self.cliente.force_login(self.dev_a)
        self.cliente.post(reverse('tarefa_publicar'), {'texto': 'Fazendo API'})
        tarefa = tarefa_atual(self.dev_a)
        self.assertIsNotNone(tarefa)
        self.assertEqual(tarefa.texto, 'Fazendo API')
        resposta = self.cliente.get(reverse('inicio'))
        self.assertIn('Fazendo API', resposta.content.decode())

    def test_publicar_texto_vazio_nao_cria_tarefa(self):
        self.cliente.force_login(self.dev_a)
        quantidade = Tarefa.objects.count()
        resposta = self.cliente.post(reverse('tarefa_publicar'), {'texto': ''})
        self.assertEqual(Tarefa.objects.count(), quantidade)
        self.assertEqual(resposta.status_code, 400)

    def test_publicar_segunda_tarefa_arquiva_a_primeira(self):
        publicar(self.dev_a, 'primeira')
        primeira = Tarefa.objects.get(autor=self.dev_a, texto='primeira')
        self.cliente.force_login(self.dev_a)
        self.cliente.post(reverse('tarefa_publicar'), {'texto': 'segunda'})
        primeira.refresh_from_db()
        self.assertFalse(primeira.na_parede)
        self.assertIsNotNone(primeira.saiu_em)
        self.assertEqual(primeira.texto, 'primeira')
        self.assertEqual(
            Tarefa.objects.filter(autor=self.dev_a, na_parede=True, saiu_em__isnull=True).count(),
            1,
        )

    def test_editar_atual_nao_cria_tarefa_nem_preenche_saiu_em(self):
        publicar(self.dev_a, 'original')
        tarefa = tarefa_atual(self.dev_a)
        self.cliente.force_login(self.dev_a)
        self.cliente.post(
            reverse('tarefa_editar', args=[tarefa.pk]),
            {'texto': 'alterado'},
        )
        self.assertEqual(Tarefa.objects.filter(autor=self.dev_a).count(), 1)
        tarefa.refresh_from_db()
        self.assertIsNone(tarefa.saiu_em)
        self.assertTrue(tarefa.na_parede)
        self.assertEqual(tarefa.texto, 'alterado')

    def test_rotulo_categorias_alpha_e_beta(self):
        alpha = Categoria.objects.create(nome='Alpha')
        beta = Categoria.objects.create(nome='Beta')
        self.cliente.force_login(self.dev_a)
        self.cliente.post(
            reverse('tarefa_publicar'),
            {'texto': 'com categorias', 'categorias': [alpha.pk, beta.pk]},
        )
        resposta = self.cliente.get(reverse('inicio'))
        self.assertIn('Alpha e mais...', resposta.content.decode())

    def test_programador_sem_tarefa_card_em_branco_com_username(self):
        self.cliente.force_login(self.dev_a)
        resposta = self.cliente.get(reverse('inicio'))
        self.assertIn('dev_a', resposta.content.decode())

    def test_programador_nao_edita_tarefa_de_outro_retorna_403(self):
        publicar(self.dev_b, 'tarefa do colega')
        tarefa = tarefa_atual(self.dev_b)
        self.cliente.force_login(self.dev_a)
        resposta = self.cliente.post(
            reverse('tarefa_editar', args=[tarefa.pk]),
            {'texto': 'invasao'},
        )
        self.assertEqual(resposta.status_code, 403)
        tarefa.refresh_from_db()
        self.assertEqual(tarefa.texto, 'tarefa do colega')


class CienciaProgressoTest(TestCase):
    def setUp(self):
        self.cliente = Client()
        self.programadores = [
            Usuario.objects.create_user(
                username=f'prog_{i}',
                password='abc123',
            )
            for i in range(6)
        ]
        self.autor = self.programadores[0]
        publicar(self.autor, 'tarefa do time')
        self.tarefa = tarefa_atual(self.autor)

    def test_progresso_dois_marcam_mostra_2_5(self):
        Ciencia.objects.create(tarefa=self.tarefa, programador=self.programadores[1])
        Ciencia.objects.create(tarefa=self.tarefa, programador=self.programadores[2])
        dados = progresso(self.tarefa)
        self.assertEqual(dados['x'], 2)
        self.assertEqual(dados['y'], 5)
        self.assertEqual(dados['percentual'], 40)
        self.cliente.force_login(self.programadores[3])
        resposta = self.cliente.get(reverse('inicio'))
        self.assertIn('2/5', resposta.content.decode())

    def test_desmarcar_atualiza_barra_para_1_5(self):
        Ciencia.objects.create(tarefa=self.tarefa, programador=self.programadores[1])
        Ciencia.objects.create(tarefa=self.tarefa, programador=self.programadores[2])
        self.cliente.force_login(self.programadores[2])
        self.cliente.post(reverse('tarefa_ciencia', args=[self.tarefa.pk]))
        dados = progresso(self.tarefa)
        self.assertEqual(dados['x'], 1)
        self.assertEqual(dados['y'], 5)
        self.cliente.force_login(self.programadores[1])
        resposta = self.cliente.get(reverse('inicio'))
        self.assertIn('1/5', resposta.content.decode())

    def test_autor_post_propria_tarefa_retorna_403(self):
        self.cliente.force_login(self.autor)
        resposta = self.cliente.post(reverse('tarefa_ciencia', args=[self.tarefa.pk]))
        self.assertEqual(resposta.status_code, 403)
        self.assertFalse(Ciencia.objects.filter(tarefa=self.tarefa).exists())

    def test_admin_post_ciencia_retorna_403(self):
        admin = Usuario.objects.create_superuser(
            username='admin_ciencia',
            password='abc123',
        )
        self.cliente.force_login(admin)
        resposta = self.cliente.post(reverse('tarefa_ciencia', args=[self.tarefa.pk]))
        self.assertEqual(resposta.status_code, 403)
        self.assertFalse(Ciencia.objects.filter(tarefa=self.tarefa).exists())

    def test_card_colega_so_um_botao_ciencia(self):
        self.cliente.force_login(self.programadores[1])
        resposta = self.cliente.get(reverse('inicio'))
        html = resposta.content.decode()
        self.assertEqual(html.count('ciencia-botao'), 1)
        for username in ('prog_2', 'prog_3', 'prog_4', 'prog_5'):
            self.assertIn(username, html)

    def test_ordem_alfabetica_programadores_no_card(self):
        zoe = Usuario.objects.create_user(username='zoe', password='abc123')
        bravo = Usuario.objects.create_user(username='bravo', password='abc123')
        alpha = Usuario.objects.create_user(username='alpha', password='abc123')
        caio = Usuario.objects.create_user(username='caio', password='abc123')
        publicar(zoe, 'card da zoe')
        tarefa_zoe = tarefa_atual(zoe)
        self.cliente.force_login(alpha)
        resposta = self.cliente.get(reverse('inicio'))
        html = resposta.content.decode()
        inicio_card = html.index(f'id="card-{zoe.pk}"')
        trecho = html[inicio_card:inicio_card + 4000]
        pos_alpha = trecho.index('alpha')
        pos_bravo = trecho.index('bravo')
        pos_caio = trecho.index('caio')
        self.assertLess(pos_alpha, pos_bravo)
        self.assertLess(pos_bravo, pos_caio)
        lista_ciencia = trecho.split('border-t border-stone-200')[1].split('</ul>')[0]
        self.assertNotIn('zoe', lista_ciencia)


class CienciaCongelamentoTest(TestCase):
    def test_congelamento_apos_arquivar_e_desativar(self):
        a = Usuario.objects.create_user(username='autor_a', password='abc123')
        b = Usuario.objects.create_user(username='marcador_b', password='abc123')
        Usuario.objects.create_user(username='leitor_c', password='abc123')
        publicar(a, 'primeira de a')
        tarefa_antiga = tarefa_atual(a)
        Ciencia.objects.create(tarefa=tarefa_antiga, programador=b)
        self.assertEqual(progresso(tarefa_antiga)['x'], 1)
        self.assertEqual(progresso(tarefa_antiga)['y'], 2)
        publicar(a, 'segunda de a')
        tarefa_antiga.refresh_from_db()
        tarefa_nova = tarefa_atual(a)
        self.assertEqual(tarefa_antiga.denominador_congelado, 2)
        b.is_active = False
        b.save(update_fields=['is_active'])
        congelado = progresso(tarefa_antiga)
        self.assertEqual(congelado['x'], 1)
        self.assertEqual(congelado['y'], 2)
        vivo = progresso(tarefa_nova)
        self.assertEqual(vivo['y'], 1)


class ExclusaoRetornoTest(TestCase):
    def setUp(self):
        self.cliente = Client()
        self.admin = Usuario.objects.create_superuser(
            username='admin_exc',
            password='abc123',
        )
        self.dev_a = Usuario.objects.create_user(
            username='dev_exc_a',
            password='abc123',
        )
        self.dev_b = Usuario.objects.create_user(
            username='dev_exc_b',
            password='abc123',
        )

    def test_excluir_atual_com_guardada_mostra_retornar(self):
        publicar(self.dev_a, 'antiga')
        guardada = Tarefa.objects.get(autor=self.dev_a, texto='antiga')
        publicar(self.dev_a, 'atual')
        atual = tarefa_atual(self.dev_a)
        self.cliente.force_login(self.dev_a)
        resposta = self.cliente.post(reverse('tarefa_excluir', args=[atual.pk]))
        self.assertEqual(resposta.status_code, 200)
        self.assertIsNone(tarefa_atual(self.dev_a))
        self.assertFalse(Tarefa.objects.filter(pk=atual.pk).exists())
        self.assertTrue(Tarefa.objects.filter(pk=guardada.pk).exists())
        self.assertIn('Retornar tarefa anterior', resposta.content.decode())

    def test_excluir_atual_sem_guardada_sem_botao_retornar(self):
        publicar(self.dev_a, 'unica')
        atual = tarefa_atual(self.dev_a)
        self.cliente.force_login(self.dev_a)
        resposta = self.cliente.post(reverse('tarefa_excluir', args=[atual.pk]))
        self.assertEqual(resposta.status_code, 200)
        self.assertIsNone(tarefa_atual(self.dev_a))
        self.assertNotIn('Retornar tarefa anterior', resposta.content.decode())

    def test_retornar_restaura_guardada_e_ciencias(self):
        marcador = Usuario.objects.create_user(username='marc_ret', password='abc123')
        publicar(self.dev_a, 'para retornar')
        guardada = Tarefa.objects.get(autor=self.dev_a, texto='para retornar')
        Ciencia.objects.create(tarefa=guardada, programador=marcador)
        Ciencia.objects.create(tarefa=guardada, programador=self.dev_b)
        publicar(self.dev_a, 'vai sair')
        atual = tarefa_atual(self.dev_a)
        marcador.is_active = False
        marcador.save(update_fields=['is_active'])
        Usuario.objects.create_user(username='novo_ret', password='abc123')
        self.cliente.force_login(self.dev_a)
        self.cliente.post(reverse('tarefa_excluir', args=[atual.pk]))
        self.cliente.post(reverse('tarefa_retornar', args=[self.dev_a.pk]))
        guardada.refresh_from_db()
        self.assertTrue(guardada.na_parede)
        self.assertIsNone(guardada.saiu_em)
        self.assertIsNone(guardada.denominador_congelado)
        self.assertFalse(
            guardada.ciencias.filter(programador=marcador).exists(),
        )
        self.assertTrue(
            guardada.ciencias.filter(programador=self.dev_b).exists(),
        )
        novo = Usuario.objects.get(username='novo_ret')
        self.assertFalse(guardada.ciencias.filter(programador=novo).exists())
        self.assertEqual(tarefa_atual(self.dev_a).pk, guardada.pk)

    def test_programador_nao_exclui_tarefa_alheia(self):
        publicar(self.dev_b, 'do colega')
        tarefa = tarefa_atual(self.dev_b)
        self.cliente.force_login(self.dev_a)
        resposta = self.cliente.post(reverse('tarefa_excluir', args=[tarefa.pk]))
        self.assertEqual(resposta.status_code, 403)
        self.assertTrue(Tarefa.objects.filter(pk=tarefa.pk).exists())

    def test_admin_exclui_tarefa_de_outro(self):
        publicar(self.dev_b, 'alvo admin')
        tarefa = tarefa_atual(self.dev_b)
        pk = tarefa.pk
        self.cliente.force_login(self.admin)
        self.cliente.post(reverse('tarefa_excluir', args=[pk]))
        self.assertFalse(Tarefa.objects.filter(pk=pk).exists())


class HistoricoTest(TestCase):
    def setUp(self):
        self.cliente = Client()
        self.dev = Usuario.objects.create_user(
            username='dev_hist',
            password='abc123',
        )
        self.cliente.force_login(self.dev)

    def _criado_em_mes_passado(self):
        hoje = timezone.now().astimezone(FUSO_SAO_PAULO).date()
        primeiro = hoje.replace(day=1)
        dia15 = primeiro - timedelta(days=15)
        return timezone.make_aware(
            datetime(dia15.year, dia15.month, 15, 12, 0, 0),
            FUSO_SAO_PAULO,
        )

    def test_padrao_mes_atual_e_atalho_mes_passado(self):
        publicar(self.dev, 'mes passado')
        publicar(self.dev, 'mes atual guardada')
        antiga = Tarefa.objects.get(autor=self.dev, texto='mes passado')
        Tarefa.objects.filter(pk=antiga.pk).update(criado_em=self._criado_em_mes_passado())
        publicar(self.dev, 'na parede')
        resposta = self.cliente.get(reverse('historico'))
        html = resposta.content.decode()
        self.assertIn('mes atual guardada', html)
        self.assertNotIn('mes passado', html)
        resposta_passado = self.cliente.get(
            reverse('historico'),
            {'atalho': 'mes_passado'},
        )
        self.assertIn('mes passado', resposta_passado.content.decode())

    def test_filtros_id_trello_e_programador(self):
        outro = Usuario.objects.create_user(username='outro_hist', password='abc123')
        publicar(self.dev, 'alpha', id_trello='ABC-111')
        publicar(self.dev, 'beta', id_trello='XYZ-999')
        publicar(self.dev, 'descarta atual')
        publicar(outro, 'de outro', id_trello='ABC-222')
        publicar(outro, 'descarta outro')
        resposta = self.cliente.get(
            reverse('historico'),
            {
                'atalho': 'personalizado',
                'inicio': '2000-01-01',
                'fim': '2099-12-31',
                'id_trello': '111',
            },
        )
        html = resposta.content.decode()
        self.assertIn('alpha', html)
        self.assertNotIn('beta', html)
        self.assertNotIn('de outro', html)
        resposta_prog = self.cliente.get(
            reverse('historico'),
            {
                'atalho': 'personalizado',
                'inicio': '2000-01-01',
                'fim': '2099-12-31',
                'programador': outro.pk,
            },
        )
        self.assertIn('de outro', resposta_prog.content.decode())
        self.assertNotIn('alpha', resposta_prog.content.decode())

    def test_ordem_crescente(self):
        publicar(self.dev, 'primeira ordem')
        publicar(self.dev, 'segunda ordem')
        publicar(self.dev, 'descarta ordem')
        resposta = self.cliente.get(
            reverse('historico'),
            {
                'atalho': 'personalizado',
                'inicio': '2000-01-01',
                'fim': '2099-12-31',
                'ordem': 'crescente',
            },
        )
        html = resposta.content.decode()
        self.assertLess(html.index('primeira ordem'), html.index('segunda ordem'))

    def test_paginacao_vinte_e_cinquenta(self):
        for i in range(22):
            publicar(self.dev, f'tarefa pag {i}')
        resposta = self.cliente.get(reverse('historico'))
        self.assertEqual(len(resposta.context['tarefas']), 20)
        self.assertTrue(resposta.context['page_obj'].has_next())
        resposta50 = self.cliente.get(reverse('historico'), {'tamanho': '50'})
        self.assertEqual(len(resposta50.context['tarefas']), 21)


class RelatorioTest(TestCase):
    def setUp(self):
        self.cliente = Client()
        self.admin = Usuario.objects.create_superuser(
            username='admin_rel',
            password='abc123',
        )
        self.dev = Usuario.objects.create_user(
            username='dev_rel',
            password='abc123',
        )

    def test_programador_e_admin_autenticados_retornam_200(self):
        self.cliente.force_login(self.dev)
        self.assertEqual(self.cliente.get(reverse('relatorios')).status_code, 200)
        self.cliente.force_login(self.admin)
        self.assertEqual(self.cliente.get(reverse('relatorios')).status_code, 200)

    def test_anonimo_redireciona_para_login(self):
        resposta = self.cliente.get(reverse('relatorios'))
        self.assertEqual(resposta.status_code, 302)
        self.assertIn('/entrar/', resposta.url)

    def test_mesmo_id_trello_conta_duas_publicacoes(self):
        publicar(self.dev, 'primeira', id_trello='CARD-1')
        publicar(self.dev, 'segunda', id_trello='CARD-1')
        dados = relatorio_simples(
            date(2000, 1, 1),
            date(2099, 12, 31),
        )
        linha = next(
            l for l in dados['por_programador'] if l['username'] == 'dev_rel'
        )
        self.assertEqual(linha['quantidade'], 2)

    def test_tarefa_excluida_nao_entra_na_contagem(self):
        publicar(self.dev, 'some', id_trello='X')
        publicar(self.dev, 'vai sumir')
        excluir(tarefa_atual(self.dev))
        dados = relatorio_simples(
            date(2000, 1, 1),
            date(2099, 12, 31),
        )
        total = sum(l['quantidade'] for l in dados['por_programador'])
        self.assertEqual(total, 1)

    def _criado_em_mes_passado(self):
        hoje = timezone.now().astimezone(FUSO_SAO_PAULO).date()
        primeiro = hoje.replace(day=1)
        dia15 = primeiro - timedelta(days=15)
        return timezone.make_aware(
            datetime(dia15.year, dia15.month, 15, 12, 0, 0),
            FUSO_SAO_PAULO,
        )

    def test_tarefa_mes_passado_na_parede_fora_do_mes_atual(self):
        publicar(self.dev, 'antiga na parede')
        antiga = tarefa_atual(self.dev)
        Tarefa.objects.filter(pk=antiga.pk).update(
            criado_em=self._criado_em_mes_passado(),
        )
        antiga.refresh_from_db()
        self.assertTrue(antiga.na_parede)
        dados = relatorio_simples(*self._intervalo_mes_atual())
        total = sum(l['quantidade'] for l in dados['por_programador'])
        self.assertEqual(total, 0)

    def _intervalo_mes_atual(self):
        from mural.servicos import datas_recorte_atalho

        return datas_recorte_atalho('mes_atual')

    def test_duracao_tarefa_guardada_e_na_parede(self):
        agora = timezone.now()
        criado = agora - timedelta(hours=3)
        saiu = criado + timedelta(hours=2)
        publicar(self.dev, 'guardada')
        publicar(self.dev, 'substitui na parede')
        guardada = (
            Tarefa.objects.filter(autor=self.dev, na_parede=False, texto='guardada')
            .first()
        )
        Tarefa.objects.filter(pk=guardada.pk).update(
            criado_em=criado,
            saiu_em=saiu,
        )
        guardada.refresh_from_db()
        self.assertEqual(duracao_tarefa(guardada), timedelta(hours=2))

        publicar(self.dev, 'na parede')
        na_parede = tarefa_atual(self.dev)
        Tarefa.objects.filter(pk=na_parede.pk).update(
            criado_em=criado,
            atualizado_em=agora,
        )
        na_parede.refresh_from_db()
        duracao = duracao_tarefa(na_parede, agora=agora)
        self.assertAlmostEqual(
            duracao.total_seconds(),
            timedelta(hours=3).total_seconds(),
            delta=60,
        )

    def test_completo_id_trello_autores_e_sem_tabela_categoria(self):
        outro = Usuario.objects.create_user(username='outro_rel', password='abc123')
        cat = Categoria.objects.create(nome='Backend')
        publicar(self.dev, 'um', id_trello='SHARED')
        t1 = (
            Tarefa.objects.filter(autor=self.dev, id_trello='SHARED')
            .order_by('-criado_em')
            .first()
        )
        t1.categorias.add(cat)
        publicar(outro, 'dois', id_trello='SHARED')
        dados = relatorio_completo(date(2000, 1, 1), date(2099, 12, 31))
        linha_id = next(l for l in dados['por_id_trello'] if l['id'] == 'SHARED')
        self.assertEqual(linha_id['quantidade'], 2)
        self.assertEqual(linha_id['programadores_distintos'], 2)
        self.cliente.force_login(self.dev)
        resposta = self.cliente.get(
            reverse('relatorios'),
            {
                'modo': 'completo',
                'atalho': 'personalizado',
                'inicio': '2000-01-01',
                'fim': '2099-12-31',
            },
        )
        html = resposta.content.decode()
        self.assertIn('Backend', html)
        self.assertNotIn('por categoria', html.lower())
