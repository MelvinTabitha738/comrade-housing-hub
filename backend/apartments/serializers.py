from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db.models import Avg
from .models import Apartment, ApartmentImage, Room, RoomVideo
from reviews.models import Review
from accounts.models import Profile


# --- Apartment Image (Cover) Serializer ---
class ApartmentImageSerializer(serializers.ModelSerializer):
    apartment = serializers.PrimaryKeyRelatedField(queryset=Apartment.objects.all())

    class Meta:
        model = ApartmentImage
        fields = ['id', 'apartment', 'image', 'caption']
        read_only_fields = ['id']


# --- Room Serializer ---
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'label', 'is_vacant', 'room_type']
        read_only_fields = ['id']


# --- Room Video Serializer ---
class RoomVideoSerializer(serializers.ModelSerializer):
    apartment = serializers.PrimaryKeyRelatedField(queryset=Apartment.objects.all())

    class Meta:
        model = RoomVideo
        fields = ['id', 'apartment', 'room_type', 'video']
        read_only_fields = ['id']


# --- Review Serializer (nested) ---
class ReviewSerializer(serializers.ModelSerializer):
    reviewer = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "reviewer", "rating", "comment", "created_at"]
        read_only_fields = ["id", "created_at", "reviewer"]


# --- Apartment (Read) Serializer ---
class ApartmentReadSerializer(serializers.ModelSerializer):
    image = ApartmentImageSerializer(read_only=True)  # ✅ single image, not list
    rooms = RoomSerializer(many=True, read_only=True)
    videos = RoomVideoSerializer(many=True, read_only=True)
    distance_km = serializers.SerializerMethodField()
    landlord = serializers.ReadOnlyField(source="landlord.user.username")
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Apartment
        fields = [
            'id', 'university', 'landlord', 'name', 'description', 'monthly_rent',
            'address', 'amenities', 'is_approved', 'created_at', 'lat', 'lon',
            'distance_km', 'image', 'rooms', 'videos', 'reviews', 'average_rating'
        ]
        read_only_fields = [
            'id', 'created_at', 'lat', 'lon', 'is_approved',
            'landlord', 'reviews', 'average_rating'
        ]

    def get_distance_km(self, obj):
        distance = obj.distance_from_university()
        return distance if distance is not None else 0.0

    def get_average_rating(self, obj):
        return obj.reviews.aggregate(avg=Avg("rating"))["avg"] or 0


# --- Apartment (Write) Serializer ---
class ApartmentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apartment
        fields = [
            'id', 'university', 'name', 'description', 'monthly_rent',
            'address', 'amenities', 'lat', 'lon'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        request = self.context.get('request')
        landlord_profile = getattr(request.user, 'profile', None)

        if not landlord_profile or landlord_profile.role != "landlord":
            raise ValidationError("Only landlords can create apartments.")

        # Create apartment instance
        apartment = Apartment.objects.create(landlord=landlord_profile, **validated_data)
        return apartment
