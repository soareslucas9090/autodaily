from django import forms
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from mural.models import Categoria
from nucleo.models import Papel, Usuario


class FormularioNovoMembro(forms.Form):
    username = forms.CharField(max_length=150, label='Usuário')
    senha = forms.CharField(
        widget=forms.PasswordInput,
        label='Senha',
        min_length=6,
    )

    def clean_username(self):
        username = self.cleaned_data['username']
        if Usuario.objects.filter(username=username).exists():
            raise ValidationError('Este usuário já existe.')
        return username

    def clean_senha(self):
        senha = self.cleaned_data['senha']
        validate_password(senha)
        return senha

    def salvar(self):
        return Usuario.objects.create_user(
            username=self.cleaned_data['username'],
            password=self.cleaned_data['senha'],
            papel=Papel.PROGRAMADOR,
            is_active=True,
        )


class FormularioEditarMembro(forms.ModelForm):
    class Meta:
        model = Usuario
        fields = ['username']

    def clean_username(self):
        username = self.cleaned_data['username']
        conflito = Usuario.objects.filter(username=username).exclude(pk=self.instance.pk)
        if conflito.exists():
            raise ValidationError('Este usuário já existe.')
        return username


class FormularioSenhaMembro(forms.Form):
    senha = forms.CharField(
        widget=forms.PasswordInput,
        label='Nova senha',
        min_length=6,
    )

    def clean_senha(self):
        senha = self.cleaned_data['senha']
        validate_password(senha)
        return senha


class FormularioCategoria(forms.ModelForm):
    class Meta:
        model = Categoria
        fields = ['nome']
        labels = {'nome': 'Nome'}


class FormularioPublicarTarefa(forms.Form):
    texto = forms.CharField(label='Descrição', widget=forms.Textarea(attrs={'rows': 3}))
    id_trello = forms.CharField(label='Id Trello', max_length=120, required=False)
    categorias = forms.ModelMultipleChoiceField(
        queryset=Categoria.objects.all(),
        required=False,
        label='Categorias',
    )

    def clean_texto(self):
        texto = self.cleaned_data.get('texto', '').strip()
        if not texto:
            raise ValidationError('A descrição é obrigatória.')
        return texto


class FormularioEditarTarefa(forms.Form):
    texto = forms.CharField(label='Descrição', widget=forms.Textarea(attrs={'rows': 3}))
    id_trello = forms.CharField(label='Id Trello', max_length=120, required=False)
    categorias = forms.ModelMultipleChoiceField(
        queryset=Categoria.objects.all(),
        required=False,
        label='Categorias',
    )

    def clean_texto(self):
        texto = self.cleaned_data.get('texto', '').strip()
        if not texto:
            raise ValidationError('A descrição é obrigatória.')
        return texto
