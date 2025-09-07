from django.contrib import admin
from .models import Apartment, ApartmentImage, Room, RoomVideo
 


class ApartmentImageInline(admin.TabularInline):
    model = ApartmentImage
    extra = 1


class RoomInline(admin.TabularInline):
    model = Room
    extra = 1


class RoomVideoInline(admin.TabularInline):
    model = RoomVideo
    extra = 1


@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "university", "landlord", "monthly_rent", "is_approved", "created_at")
    list_filter = ("university", "is_approved")
    search_fields = ("name", "address", "landlord__user__username")
    inlines = [ApartmentImageInline, RoomInline, RoomVideoInline]


@admin.register(ApartmentImage)
class ApartmentImageAdmin(admin.ModelAdmin):
    list_display = ("apartment", "caption")


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("label", "apartment", "room_type", "is_vacant")
    list_filter = ("room_type", "is_vacant")


@admin.register(RoomVideo)
class RoomVideoAdmin(admin.ModelAdmin):
    list_display = ("apartment", "room_type")


