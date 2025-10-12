# universities/views.py
from django.db.models import Count, Case, When, IntegerField, Value
from django.db.models.functions import Length
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import University
from .serializers import UniversityReadSerializer, UniversityWriteSerializer
from apartments.models import Apartment
from apartments.serializers import ApartmentReadSerializer


# ✅ Custom pagination for apartments
class UniversityApartmentPagination(PageNumberPagination):
    page_size = 20  # default 20 apartments per page
    page_size_query_param = "page_size"  # allow ?page_size=30
    max_page_size = 50


class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all().annotate(
        total_apartments=Count("apartments")
    )
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "total_apartments"]

    def get_queryset(self):
        qs = super().get_queryset()
        search_term = self.request.query_params.get("search")

        if search_term:
            # Rank results: exact match > startswith > contains
            qs = qs.annotate(
                rank=Case(
                    When(name__iexact=search_term, then=Value(1)),
                    When(name__istartswith=search_term, then=Value(2)),
                    When(name__icontains=search_term, then=Value(3)),
                    default=Value(4),
                    output_field=IntegerField()
                )
            ).order_by("rank", Length("name"))  # shorter names first on tie

        return qs

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return UniversityReadSerializer
        return UniversityWriteSerializer

    # ✅ Custom action: fetch paginated apartments for a university
    @action(detail=True, methods=["get"], url_path="apartments")
    def apartments(self, request, pk=None):
        university = self.get_object()
        apartments = Apartment.objects.filter(
            university=university,
            is_approved=True
        )

        # ✅ Apply pagination
        paginator = UniversityApartmentPagination()
        page = paginator.paginate_queryset(apartments, request)

        serializer = ApartmentReadSerializer(
            page,
            many=True,
            context={"request": request, "university": university}
        )
        return paginator.get_paginated_response(serializer.data)
