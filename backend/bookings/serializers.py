from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.username", read_only=True)
    room_label = serializers.CharField(source="room.label", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "student", "student_name", "room", "room_label",
            "full_name", "phone", "status", "created_at"
        ]
        read_only_fields = ["id", "status", "created_at", "student"]

    def create(self, validated_data):
        request = self.context["request"]
        profile = request.user.profile

        if profile.role != "student":
            raise serializers.ValidationError("Only students can create bookings.")

        validated_data["student"] = profile
        return super().create(validated_data)
