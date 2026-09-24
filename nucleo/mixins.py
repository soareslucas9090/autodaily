from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseForbidden


class AutenticacaoObrigatoriaMixin(LoginRequiredMixin):
    pass


class PapelExigidoMixin:
    papel_exigido = ''

    def dispatch(self, request, *args, **kwargs):
        if getattr(request.user, 'papel', None) != self.papel_exigido:
            return HttpResponseForbidden()
        return super().dispatch(request, *args, **kwargs)


class DonoRecursoMixin:
    def objeto_eh_do_usuario(self, objeto, usuario):
        return False

    def usuario_eh_admin(self, usuario):
        return getattr(usuario, 'papel', None) == 'admin'

    def assegurar_dono_ou_admin(self, usuario, objeto):
        if self.usuario_eh_admin(usuario):
            return None
        if self.objeto_eh_do_usuario(objeto, usuario):
            return None
        return HttpResponseForbidden()


class RespostaParcialMixin:
    def pedido_htmx(self, request):
        return request.headers.get('HX-Request') == 'true'
