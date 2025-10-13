from django.contrib import admin
from django.db import models
from .models import Apartment, ApartmentImage, Room, RoomVideo


# ------------------ INLINES ------------------
class ApartmentImageInline(admin.TabularInline):
    model = ApartmentImage
    extra = 1


class RoomInline(admin.TabularInline):
    model = Room
    extra = 1


class RoomVideoInline(admin.TabularInline):
    model = RoomVideo
    extra = 1


# ------------------ APARTMENT ADMIN ------------------
@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "university",
        "landlord",
        "average_rent",
        "is_approved",
        "created_at",
        "distance_from_university",  # shows km if lat/lon + university coords exist
    )
    list_filter = ("university", "is_approved", "created_at")
    search_fields = (
        "name",
        "address",
        "landlord__user__username",
        "university__name",
    )
    inlines = [ApartmentImageInline, RoomInline, RoomVideoInline]

    fieldsets = (
        ("Basic Info", {
            "fields": (
                "university",
                "landlord",
                "name",
                "description",
                "address",
            )
        }),
        ("Additional Details", {
            "fields": (
                "amenities",
                "is_approved",
            )
        }),
    )

    readonly_fields = ("created_at",)

    # ✅ Dynamically calculate average rent from related rooms
    def average_rent(self, obj):
        avg = obj.rooms.aggregate(models.Avg("monthly_rent"))["monthly_rent__avg"]
        return f"Ksh {avg:.2f}" if avg else "N/A"
    average_rent.short_description = "Avg Monthly Rent"


# ------------------ OTHER ADMINS ------------------
@admin.register(ApartmentImage)
class ApartmentImageAdmin(admin.ModelAdmin):
    list_display = ("apartment", "caption")
    search_fields = ("apartment__name", "caption")


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("label", "apartment", "room_type", "monthly_rent", "is_vacant")
    list_filter = ("room_type", "is_vacant")
    search_fields = ("label", "apartment__name")


@admin.register(RoomVideo)
class RoomVideoAdmin(admin.ModelAdmin):
    list_display = ("apartment", "room_type")
    search_fields = ("apartment__name", "room_type")
