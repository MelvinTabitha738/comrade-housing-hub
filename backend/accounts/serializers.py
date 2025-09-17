from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Profile

# ---------------- USER SERIALIZER ----------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


# ---------------- PROFILE SERIALIZER ----------------
class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ["id", "user", "role", "phone", "verified", "created_at"]
        read_only_fields = ["id", "verified", "created_at"]


# ---------------- SIGNUP SERIALIZER ----------------
class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    def create(self, validated_data):
        """
        Create User and Profile together.
        """
        role = validated_data.pop("role")
        password = validated_data.pop("password")

        # Ensure email is unique
        if User.objects.filter(email=validated_data.get("email")).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})

        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        # Create the Profile linked to user
        Profile.objects.create(user=user, role=role)

        return user


# ---------------- LOGIN SERIALIZER ----------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Validate and authenticate user using email + password.
        """
        email = data.get("email")
        password = data.get("password")

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email.")

        user = authenticate(username=user_obj.username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials.")

        data["user"] = user
        return data
