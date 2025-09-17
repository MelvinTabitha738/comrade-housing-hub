from django.urls import path, include
from rest_framework_nested import routers
from apartments.views import ApartmentViewSet
from .views import ReviewViewSet

# Main router
router = routers.DefaultRouter()
router.register(r"apartments", ApartmentViewSet, basename="apartment")

# Nested router for reviews under apartments
apartments_router = routers.NestedDefaultRouter(router, r"apartments", lookup="apartment")
apartments_router.register(r"reviews", ReviewViewSet, basename="apartment-reviews")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(apartments_router.urls)),
]
