from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from nucleo.models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(DjangoUserAdmin):
    list_display = ('username', 'papel', 'is_active', 'is_staff')
    list_filter = ('papel', 'is_active', 'is_staff')
    fieldsets = DjangoUserAdmin.fieldsets + (
        ('AutoDaily', {'fields': ('papel', 'tinta')}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ('AutoDaily', {'fields': ('papel', 'tinta')}),
    )
