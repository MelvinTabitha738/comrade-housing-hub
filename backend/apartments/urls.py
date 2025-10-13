# apartments/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ApartmentViewSet,
    ApartmentImageViewSet,
    RoomViewSet,
    RoomVideoViewSet,
    landlord_stats,
    calculate_distance,
)

# ------------------ ROUTER ------------------
router = DefaultRouter()
router.register(r'apartments', ApartmentViewSet, basename='apartment')
router.register(r'apartment-images', ApartmentImageViewSet, basename='apartmentimage')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'room-videos', RoomVideoViewSet, basename='roomvideo')

# ------------------ URL PATTERNS ------------------
urlpatterns = [
    path('landlord/stats/', landlord_stats, name='landlord-stats'),
    path('calculate-distance/', calculate_distance, name='calculate-distance'),
    path('', include(router.urls)),
]
