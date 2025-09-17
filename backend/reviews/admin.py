from django.contrib import admin
from django.utils.html import format_html
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "apartment",
        "user",
        "colored_rating",   # show stars/colors instead of plain number
        "short_comment",    # preview comment
        "created_at",
    )
    list_filter = ("rating", "created_at")
    search_fields = ("apartment__name", "user__username", "comment")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)

    # ----------------- CUSTOM DISPLAY -----------------
    def colored_rating(self, obj):
        """Show rating in stars and colors."""
        stars = "⭐" * obj.rating
        color_map = {
            5: "green",
            4: "darkgreen",
            3: "orange",
            2: "orangered",
            1: "red",
        }
        color = color_map.get(obj.rating, "black")
        return format_html('<span style="color:{}; font-weight:bold;">{} ({}/5)</span>',
                           color, stars, obj.rating)

    colored_rating.short_description = "Rating"

    def short_comment(self, obj):
        """Show a short preview of the comment."""
        return (obj.comment[:50] + "...") if len(obj.comment) > 50 else obj.comment

    short_comment.short_description = "Comment Preview"
