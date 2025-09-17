from rest_framework import serializers
from .models import Payment
from accounts.models import Profile

# Nested user profile serializer
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = ["id", "username", "email", "phone", "role", "verified"]


class PaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source="booking.id", read_only=True)
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "booking_id",     # cleaner booking reference
            "user",           # full profile details
            "amount",
            "payment_method",
            "mpesa_checkout_id",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "booking_id",
            "user",
            "mpesa_checkout_id",
            "status",
            "created_at",
            "updated_at",
        ]
