from django.urls import path

from mural.views import MuralView
from nucleo.views import AlternarCanetaView, EntrarView, SairView

urlpatterns = [
    path('', MuralView.as_view(), name='inicio'),
    path('entrar/', EntrarView.as_view(), name='entrar'),
    path('sair/', SairView.as_view(), name='sair'),
    path('caneta/', AlternarCanetaView.as_view(), name='caneta'),
]
