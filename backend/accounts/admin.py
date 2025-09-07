from django.contrib import admin
from .models import LandlordProfile

@admin.register(LandlordProfile)
class LandlordProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'verified', 'created_at')
    search_fields = ('user__username', 'phone')
    list_filter = ('verified', 'created_at')

#customize the admin pannel

from django.contrib import admin

admin.site.site_header = "Comrade Housing Hub Admin"
admin.site.site_title = "Comrade Housing Hub"
admin.site.index_title = "Welcome to the Housing Hub Dashboard"

