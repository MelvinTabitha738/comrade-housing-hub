from django.urls import path
from .views import SignupView, LoginView, ProfileView, UserListView

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", ProfileView.as_view(), name="my-profile"),
    path("users/", UserListView.as_view(), name="all-users"),
]

