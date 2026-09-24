from django.contrib.auth.views import LoginView, LogoutView
from django.http import HttpResponseBadRequest
from django.shortcuts import redirect
from django.views import View
from django.views.generic import TemplateView

from nucleo.mixins import AutenticacaoObrigatoriaMixin, RespostaParcialMixin
from nucleo.models import Tinta


class EntrarView(LoginView):
    template_name = 'nucleo/entrar.html'


class InicioView(AutenticacaoObrigatoriaMixin, TemplateView):
    template_name = 'nucleo/inicio.html'


class SairView(LogoutView):
    pass


class FragmentoHTMXView(RespostaParcialMixin, TemplateView):
    template_fragmento = None

    def get_template_names(self):
        if self.pedido_htmx(self.request):
            return [self.template_fragmento]
        return super().get_template_names()


class AcaoView(RespostaParcialMixin, View):
    def post(self, request, *args, **kwargs):
        return self.executar(request, *args, **kwargs)

    def executar(self, request, *args, **kwargs):
        return HttpResponseBadRequest('Ação não implementada.')


class AlternarCanetaView(AutenticacaoObrigatoriaMixin, AcaoView):
    def executar(self, request, *args, **kwargs):
        usuario = request.user
        if usuario.tinta == Tinta.AZUL:
            usuario.tinta = Tinta.PRETA
        else:
            usuario.tinta = Tinta.AZUL
        usuario.save(update_fields=['tinta'])
        return redirect('inicio')
