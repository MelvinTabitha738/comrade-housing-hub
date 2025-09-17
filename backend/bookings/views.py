from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Booking
from .serializers import BookingSerializer


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, "profile", None)

        if not profile:
            return Booking.objects.none()

        if user.is_staff:
            return Booking.objects.all()

        if profile.role == "landlord":
            return Booking.objects.filter(room__apartment__landlord=profile)

        if profile.role == "student":
            return Booking.objects.filter(student=profile)

        return Booking.objects.none()

    def perform_create(self, serializer):
        profile = self.request.user.profile
        if profile.role != "student":
            raise PermissionDenied("Only students can make bookings.")
        serializer.save(student=profile)
