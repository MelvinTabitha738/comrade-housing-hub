from django.contrib import admin
from .models import University

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'town', 'lat', 'lng')
    search_fields = ('name', 'town')
    ordering = ('name',)
