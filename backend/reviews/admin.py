from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('apartment', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('apartment__name', 'user__username', 'comment')
    ordering = ('-created_at',)
