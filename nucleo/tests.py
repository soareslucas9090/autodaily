from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.test import Client, SimpleTestCase, TestCase
from django.urls import reverse

from nucleo.models import ModeloBase, Papel, Tinta, Usuario


class ModeloBaseTest(SimpleTestCase):
    def test_modelo_base_e_abstrato(self):
        self.assertTrue(ModeloBase._meta.abstract)

    def test_modelo_base_tem_campos_de_auditoria(self):
        nomes = {campo.name for campo in ModeloBase._meta.get_fields()}
        self.assertIn('criado_em', nomes)
        self.assertIn('atualizado_em', nomes)


class ValidacaoSenhaTest(TestCase):
    def test_senha_cinco_caracteres_e_recusada(self):
        with self.assertRaises(ValidationError):
            validate_password('abcde')

    def test_senha_abc123_e_aceita(self):
        validate_password('abc123')

    def test_senha_so_numeros_seis_digitos_e_aceita(self):
        validate_password('123456')


class AutenticacaoUsuarioTest(TestCase):
    def test_programador_inativo_nao_autentica(self):
        Usuario.objects.create_user(
            username='inativo',
            password='abc123',
            is_active=False,
        )
        self.assertIsNone(authenticate(username='inativo', password='abc123'))

    def test_programador_ativo_autentica(self):
        Usuario.objects.create_user(
            username='ativo',
            password='abc123',
        )
        usuario = authenticate(username='ativo', password='abc123')
        self.assertIsNotNone(usuario)
        self.assertEqual(usuario.papel, Papel.PROGRAMADOR)

    def test_create_superuser_cria_admin_e_autentica(self):
        Usuario.objects.create_superuser(
            username='super',
            password='abc123',
        )
        usuario = Usuario.objects.get(username='super')
        self.assertEqual(usuario.papel, Papel.ADMIN)
        self.assertTrue(usuario.is_staff)
        self.assertTrue(usuario.is_superuser)
        self.assertIsNotNone(authenticate(username='super', password='abc123'))


class EntrarViewTest(TestCase):
    def setUp(self):
        self.cliente = Client()

    def test_post_entrar_desativado_nao_cria_sessao(self):
        Usuario.objects.create_user(
            username='bloqueado',
            password='abc123',
            is_active=False,
        )
        resposta = self.cliente.post(
            reverse('entrar'),
            {'username': 'bloqueado', 'password': 'abc123'},
        )
        self.assertEqual(resposta.status_code, 200)
        self.assertNotIn('_auth_user_id', self.cliente.session)

    def test_post_entrar_ativo_redireciona_para_inicio(self):
        Usuario.objects.create_user(
            username='livre',
            password='abc123',
        )
        resposta = self.cliente.post(
            reverse('entrar'),
            {'username': 'livre', 'password': 'abc123'},
        )
        self.assertRedirects(resposta, reverse('inicio'))


class AlternarCanetaViewTest(TestCase):
    def setUp(self):
        self.cliente = Client()
        self.programador = Usuario.objects.create_user(
            username='dev_caneta',
            password='abc123',
        )
        self.assertEqual(self.programador.tinta, Tinta.AZUL)

    def test_anonimo_post_caneta_redireciona_login(self):
        resposta = self.cliente.post(reverse('caneta'))
        self.assertEqual(resposta.status_code, 302)
        self.assertIn(reverse('entrar'), resposta.url)

    def test_autenticado_post_caneta_alterna_azul_para_preta(self):
        self.cliente.force_login(self.programador)
        resposta = self.cliente.post(reverse('caneta'))
        self.assertRedirects(resposta, reverse('inicio'))
        self.programador.refresh_from_db()
        self.assertEqual(self.programador.tinta, Tinta.PRETA)

    def test_segundo_post_caneta_volta_para_azul(self):
        self.cliente.force_login(self.programador)
        self.cliente.post(reverse('caneta'))
        self.cliente.post(reverse('caneta'))
        self.programador.refresh_from_db()
        self.assertEqual(self.programador.tinta, Tinta.AZUL)
