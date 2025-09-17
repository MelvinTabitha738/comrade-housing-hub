# universities/views.py
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import University
from .serializers import UniversityReadSerializer, UniversityWriteSerializer
from apartments.models import Apartment
from apartments.serializers import ApartmentReadSerializer


class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all().annotate(
        total_apartments=Count("apartments")  # from Apartment model related_name
    )
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]  # ✅ search by university name only
    ordering_fields = ["name", "total_apartments"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]  # only admins can edit universities
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return UniversityReadSerializer
        return UniversityWriteSerializer

    # ✅ Custom action to fetch apartments near a university
    @action(detail=True, methods=["get"], url_path="apartments")
    def apartments(self, request, pk=None):
        university = self.get_object()
        apartments = Apartment.objects.filter(university=university, is_approved=True)

        # Attach distance dynamically
        for apt in apartments:
            apt.distance_km = apt.distance_from_university()

        serializer = ApartmentReadSerializer(apartments, many=True, context={"request": request})
        return Response(serializer.data)
