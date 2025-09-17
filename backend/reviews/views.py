from rest_framework import viewsets, permissions
from .models import Review
from .serializers import ReviewSerializer


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    - Anyone can read reviews.
    - Only the author or an admin can edit/delete.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user or request.user.is_staff


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        """
        - If nested: return reviews for a specific apartment.
        - Otherwise: return all reviews.
        """
        apartment_id = self.kwargs.get("apartment_pk")  # from nested router
        qs = Review.objects.all().select_related("apartment", "user")
        if apartment_id:
            qs = qs.filter(apartment_id=apartment_id)
        return qs

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthorOrReadOnly()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def perform_create(self, serializer):
        """
        - Attach logged-in user as the review author.
        - Attach the apartment from nested URL.
        """
        apartment_id = self.kwargs.get("apartment_pk")
        serializer.save(user=self.request.user, apartment_id=apartment_id)
