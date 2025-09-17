from django.contrib import admin
from django.utils.html import format_html
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "booking",
        "user",
        "amount",
        "payment_method",
        "colored_status",   # custom field instead of raw status
        "mpesa_checkout_id",
        "created_at",
        "updated_at",
    )
    list_filter = ("payment_method", "status", "created_at")
    search_fields = (
        "booking__student__user__username",
        "booking__student__full_name",
        "user__user__username",
        "mpesa_checkout_id",
    )
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")

    # ----------------- CUSTOM DISPLAY -----------------
    def colored_status(self, obj):
        """Show colored status labels in admin list."""
        color_map = {
            "PAID": "green",
            "FAILED": "red",
            "NOT_PAID": "orange",
        }
        color = color_map.get(obj.status, "black")
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display(),
        )

    colored_status.short_description = "Status"

    # ----------------- CUSTOM ACTIONS -----------------
    actions = ["mark_as_paid", "mark_as_failed"]

    def mark_as_paid(self, request, queryset):
        updated = queryset.update(status="PAID")
        self.message_user(request, f"{updated} payment(s) marked as Paid 💰")

    def mark_as_failed(self, request, queryset):
        updated = queryset.update(status="FAILED")
        self.message_user(request, f"{updated} payment(s) marked as Failed ❌")

    mark_as_paid.short_description = "Mark selected payments as Paid"
    mark_as_failed.short_description = "Mark selected payments as Failed"
