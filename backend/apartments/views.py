from django.db import models
from rest_framework.permissions import IsAuthenticated

from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum
from payments.models import Payment
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from universities.models import University
from math import radians, sin, cos, sqrt, atan2



from .models import Apartment, ApartmentImage, Room, RoomVideo
from .serializers import (
    ApartmentReadSerializer, ApartmentWriteSerializer,
    ApartmentImageSerializer, RoomSerializer, RoomVideoSerializer
)
from reviews.models import Review
from bookings.models import Booking


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
            return obj.landlord == request.user.profile
        if hasattr(obj, "apartment"):  # Image, Room, RoomVideo
            return obj.apartment.landlord == request.user.profile
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

        if user.is_authenticated and hasattr(user, "profile") and user.profile.role == "landlord":
            return qs.filter(landlord=user.profile)

        return qs.filter(is_approved=True)

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, "profile") or user.profile.role != "landlord":
            raise PermissionDenied("Only landlords can create apartments.")
        serializer.save(landlord=user.profile)


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
        if user.is_authenticated and hasattr(user, "profile") and user.profile.role == "landlord":
            return ApartmentImage.objects.filter(apartment__landlord=user.profile)
        return ApartmentImage.objects.all()

    def perform_create(self, serializer):
      apartment = serializer.validated_data["apartment"]

    # ✅ Ensure landlord owns the apartment
      if apartment.landlord != self.request.user.profile:
        raise PermissionDenied("You can only upload images for your own apartments.")

    # ✅ Check if apartment already has a cover image
      if ApartmentImage.objects.filter(apartment=apartment).exists():
        raise PermissionDenied("This apartment already has a cover image. You can only upload one.")

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
        if user.is_authenticated and hasattr(user, "profile") and user.profile.role == "landlord":
            return Room.objects.filter(apartment__landlord=user.profile)
        return Room.objects.all()

    def perform_create(self, serializer):
        apartment = serializer.validated_data["apartment"]
        if apartment.landlord != self.request.user.profile:
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
        if user.is_authenticated and hasattr(user, "profile") and user.profile.role == "landlord":
            return RoomVideo.objects.filter(apartment__landlord=user.profile)
        return RoomVideo.objects.all()

    def perform_create(self, serializer):
        apartment = serializer.validated_data["apartment"]
        if apartment.landlord != self.request.user.profile:
            raise PermissionDenied("You can only upload videos for your own apartments.")
        serializer.save()


# --- Landlord Stats Endpoint ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def landlord_stats(request):
    landlord = request.user.profile  # adjust if using a different profile model
    apartments = Apartment.objects.filter(landlord=landlord)

    total_apartments = apartments.count()
    total_rooms = Room.objects.filter(apartment__in=apartments).count()
    pending_bookings = Booking.objects.filter(
        room__apartment__in=apartments, status='pending'
    ).count()
    confirmed_bookings = Booking.objects.filter(
        room__apartment__in=apartments, status='confirmed'
    ).count()

    total_earnings = Payment.objects.filter(
        booking__room__apartment__in=apartments
    ).aggregate(total=models.Sum('amount'))['total'] or 0

    # ✅ Always include apartments list (id, name, location, etc.)
    apartments_data = []
    for apt in apartments:
        apartments_data.append({
            "id": apt.id,
            "name": apt.name,
            "description": apt.description,
            "university": apt.university.name,
            "monthly_rent": float(apt.monthly_rent),
            "address": apt.address,
            "is_approved": apt.is_approved,
            "distance_km": apt.distance_from_university(),
            "amenities": apt.amenities,
            "images": [img.image.url for img in apt.images.all()],
            "videos": [vid.video.url for vid in apt.videos.all()],
            "created_at": apt.created_at,
        })

    return Response({
        "apartments": apartments_data,  # <-- Now React can safely map this
        "totalApartments": total_apartments,
        "totalRooms": total_rooms,
        "pendingBookings": pending_bookings,
        "confirmedBookings": confirmed_bookings,
        "totalEarnings": total_earnings,
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def calculate_distance(request):
    """
    Calculate the distance between a university and an apartment.
    Expected query parameters:
    - uni_lat, uni_lon (float)
    - apt_lat, apt_lon (float)
    """
    try:
        uni_lat = request.query_params.get("uni_lat")
        uni_lon = request.query_params.get("uni_lon")
        apt_lat = request.query_params.get("apt_lat")
        apt_lon = request.query_params.get("apt_lon")

        # Check if any are missing
        if None in [uni_lat, uni_lon, apt_lat, apt_lon]:
            return Response(
                {"error": "Missing latitude or longitude values."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Convert to float safely
        uni_lat, uni_lon = float(uni_lat), float(uni_lon)
        apt_lat, apt_lon = float(apt_lat), float(apt_lon)

        # Haversine formula
        R = 6371  # Earth radius in km
        d_lat = radians(apt_lat - uni_lat)
        d_lon = radians(apt_lon - uni_lon)

        a = sin(d_lat / 2) ** 2 + cos(radians(uni_lat)) * cos(radians(apt_lat)) * sin(d_lon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        distance = R * c

        return Response({"distance_km": round(distance, 2)})

    except ValueError:
        return Response(
            {"error": "Invalid latitude or longitude format."},
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )