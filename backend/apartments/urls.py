# apartments/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ApartmentViewSet, ApartmentImageViewSet, RoomViewSet, RoomVideoViewSet

router = DefaultRouter()
router.register(r'apartments', ApartmentViewSet, basename='apartment')
router.register(r'apartment-images', ApartmentImageViewSet, basename='apartmentimage')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'room-videos', RoomVideoViewSet, basename='roomvideo')

urlpatterns = [
    path('', include(router.urls)),
]
