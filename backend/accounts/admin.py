from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'phone', 'verified', 'created_at')
    search_fields = ('user__username', 'phone')
    list_filter = ('role', 'verified', 'created_at')


# --- Customize the admin panel ---
admin.site.site_header = "Comrade Housing Hub Admin"
admin.site.site_title = "Comrade Housing Hub"
admin.site.index_title = "Welcome to the Housing Hub Dashboard"
