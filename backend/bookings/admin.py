from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('student', 'room', 'status', 'phone', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('student__username', 'room__name', 'phone', 'full_name', 'student_id')
    ordering = ('-created_at',)
