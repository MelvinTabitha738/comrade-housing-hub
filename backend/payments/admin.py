from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('booking', 'amount', 'mpesa_status', 'created_at')
    list_filter = ('mpesa_status', 'created_at')
    search_fields = ('booking__student__username', 'mpesa_checkout_id')
    ordering = ('-created_at',)
