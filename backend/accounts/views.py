from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Profile
from .serializers import ProfileSerializer, SignupSerializer, LoginSerializer


# ---------------- SIGNUP + AUTO LOGIN ----------------
class SignupView(generics.CreateAPIView):
    """
    Handles user signup and returns JWT token immediately.
    Frontend can use this response to auto-login.
    """
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        profile = ProfileSerializer(user.profile).data

        return Response({
            "user": profile,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)


# ---------------- LOGIN ----------------
class LoginView(generics.GenericAPIView):
    """
    Handles login with email + password and returns JWT token.
    """
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        profile = ProfileSerializer(user.profile).data

        return Response({
            "user": profile,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        })


# ---------------- PROFILE ----------------
class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Allows authenticated users to view and update their own profile.
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


# ---------------- USER LIST (ADMIN ONLY) ----------------
class UserListView(generics.ListAPIView):
    """
    Allows admins to view all users with their profiles.
    """
    queryset = Profile.objects.select_related("user").all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAdminUser]
