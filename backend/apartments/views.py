from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend

from .models import Apartment, ApartmentImage, Room, RoomVideo
from .serializers import (
    ApartmentReadSerializer, ApartmentWriteSerializer,
    ApartmentImageSerializer, RoomSerializer, RoomVideoSerializer
)
from reviews.models import Review


# --- Custom Permission ---
class IsOwnerOrAdmin(permissions.BasePermission):
    """
    - Admins (is_staff) have full access.
    - Landlords can manage only their own apartments.
    - Students have read-only access.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_staff:
            return True
        if hasattr(obj, "landlord"):  # Apartment
            return obj.landlord == request.user
        if hasattr(obj, "apartment"):  # Image, Room, RoomVideo
            return obj.apartment.landlord == request.user
        return False


# --- Apartment ViewSet ---
class ApartmentViewSet(viewsets.ModelViewSet):
    queryset = Apartment.objects.all().select_related("university", "landlord")
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["university", "is_approved", "monthly_rent"]
    search_fields = ["name", "address"]
    ordering_fields = ["monthly_rent", "created_at"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsOwnerOrAdmin()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ApartmentWriteSerializer
        return ApartmentReadSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Apartment.objects.all().select_related("university", "landlord")

        if user.is_staff:
            return qs

        if user.is_authenticated and getattr(user, "role", None) == "landlord":
            return qs.filter(landlord=user)

        return qs.filter(is_approved=True)

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated or getattr(user, "role", None) != "landlord":
            raise PermissionDenied("Only landlords can create apartments.")
        serializer.save(landlord=user)


# --- ApartmentImage ViewSet ---
class ApartmentImageViewSet(viewsets.ModelViewSet):
    serializer_class = ApartmentImageSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsOwnerOrAdmin()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ApartmentImage.objects.all()
        if user.is_authenticated and getattr(user, "role", None) == "landlord":
            return ApartmentImage.objects.filter(apartment__landlord=user)
        return ApartmentImage.objects.all()

    def perform_create(self, serializer):
        apartment = serializer.validated_data["apartment"]
        if apartment.landlord != self.request.user:
            raise PermissionDenied("You can only upload images for your own apartments.")
        serializer.save()


# --- Room ViewSet ---
class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsOwnerOrAdmin()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Room.objects.all()
        if user.is_authenticated and getattr(user, "role", None) == "landlord":
            return Room.objects.filter(apartment__landlord=user)
        return Room.objects.all()

    def perform_create(self, serializer):
        apartment = serializer.validated_data["apartment"]
        if apartment.landlord != self.request.user:
            raise PermissionDenied("You can only add rooms to your own apartments.")
        serializer.save()


# --- RoomVideo ViewSet ---
class RoomVideoViewSet(viewsets.ModelViewSet):
    serializer_class = RoomVideoSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsOwnerOrAdmin()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return RoomVideo.objects.all()
        if user.is_authenticated and getattr(user, "role", None) == "landlord":
            return RoomVideo.objects.filter(apartment__landlord=user)
        return RoomVideo.objects.all()

    def perform_create(self, serializer):
        apartment = serializer.validated_data["apartment"]
        if apartment.landlord != self.request.user:
            raise PermissionDenied("You can only upload videos for your own apartments.")
        serializer.save()
