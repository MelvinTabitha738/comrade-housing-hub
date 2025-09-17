from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "room",
        "status",
        "phone",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "student__user__username",
        "student__user__email",
        "full_name",
        "phone",
        "room__label",
        "room__apartment__name",
    )
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)

    # ----------------- CUSTOM ACTIONS -----------------
    actions = ["mark_as_confirmed", "mark_as_cancelled"]

    def mark_as_confirmed(self, request, queryset):
        updated = queryset.update(status="CONFIRMED")
        self.message_user(request, f"{updated} booking(s) marked as Confirmed ✅")

    def mark_as_cancelled(self, request, queryset):
        updated = queryset.update(status="CANCELLED")
        self.message_user(request, f"{updated} booking(s) marked as Cancelled ❌")

    mark_as_confirmed.short_description = "Mark selected bookings as Confirmed"
    mark_as_cancelled.short_description = "Mark selected bookings as Cancelled"
