from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db.models import Avg
from .models import Apartment, ApartmentImage, Room, RoomVideo
from reviews.models import Review
from accounts.models import Profile

# ---------------- Apartment Image Serializer ----------------
class ApartmentImageSerializer(serializers.ModelSerializer):
    """Serializer for the cover image of an apartment."""
    apartment = serializers.PrimaryKeyRelatedField(queryset=Apartment.objects.all())

    class Meta:
        model = ApartmentImage
        fields = ["id", "apartment", "image", "caption"]
        read_only_fields = ["id"]

# ---------------- Room Serializer ----------------
class RoomSerializer(serializers.ModelSerializer):
    """Handles individual room creation and updates."""
    monthly_rent = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model = Room
        fields = ["id", "label", "room_type", "monthly_rent", "is_vacant"]
        read_only_fields = ["id"]

# ---------------- Room Video Serializer ----------------
class RoomVideoSerializer(serializers.ModelSerializer):
    """Handles one video per room type per apartment."""
    apartment = serializers.PrimaryKeyRelatedField(queryset=Apartment.objects.all())

    class Meta:
        model = RoomVideo
        fields = ["id", "apartment", "room_type", "video"]
        read_only_fields = ["id"]

# ---------------- Review Serializer (Nested) ----------------
class ReviewSerializer(serializers.ModelSerializer):
    """Read-only serializer for apartment reviews."""
    reviewer = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "reviewer", "rating", "comment", "created_at"]
        read_only_fields = ["id", "created_at", "reviewer"]

# ---------------- Grouped Room Serializer ----------------
class GroupedRoomSerializer(serializers.Serializer):
    """Groups rooms by room_type, showing vacant and booked rooms separately."""
    room_type = serializers.CharField()
    total_rooms = serializers.IntegerField()
    vacant_rooms = RoomSerializer(many=True)
    booked_rooms = RoomSerializer(many=True)

# ---------------- Apartment Read Serializer ----------------
class ApartmentReadSerializer(serializers.ModelSerializer):
    image = ApartmentImageSerializer(read_only=True)
    videos = RoomVideoSerializer(many=True, read_only=True)
    distance_km = serializers.SerializerMethodField()
    landlord = serializers.ReadOnlyField(source="landlord.user.username")
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    grouped_rooms = serializers.SerializerMethodField()

    class Meta:
        model = Apartment
        fields = [
            "id", "university", "landlord", "name", "description",
            "address", "amenities", "is_approved", "created_at", "lat", "lon",
            "distance_km", "image", "videos", "reviews", "average_rating",
            "grouped_rooms"
        ]
        read_only_fields = [
            "id", "created_at", "lat", "lon", "is_approved",
            "landlord", "reviews", "average_rating"
        ]

    def get_distance_km(self, obj):
        distance = obj.distance_from_university()
        return distance if distance is not None else 0.0

    def get_average_rating(self, obj):
        return obj.reviews.aggregate(avg=Avg("rating"))["avg"] or 0

    def get_grouped_rooms(self, obj):
        grouped_data = []
        room_types = obj.rooms.values_list("room_type", flat=True).distinct()

        for room_type in room_types:
            rooms_of_type = obj.rooms.filter(room_type=room_type)
            vacant_rooms = rooms_of_type.filter(is_vacant=True)
            booked_rooms = rooms_of_type.filter(is_vacant=False)

            grouped_data.append({
                "room_type": room_type,
                "total_rooms": rooms_of_type.count(),
                "vacant_rooms": RoomSerializer(vacant_rooms, many=True).data,
                "booked_rooms": RoomSerializer(booked_rooms, many=True).data,
            })

        return grouped_data

# ---------------- Apartment Write Serializer ----------------
class ApartmentWriteSerializer(serializers.ModelSerializer):
    """
    Handles apartment creation and updates.
    Accepts roomTypes from frontend including monthly_rent and video.
    """
    class Meta:
        model = Apartment
        fields = [
            "id", "university", "name", "description",
            "address", "amenities", "lat", "lon"
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        request = self.context.get("request")
        landlord_profile = getattr(request.user, "profile", None)

        if not landlord_profile or landlord_profile.role != "landlord":
            raise ValidationError("Only landlords can create apartments.")

        room_types_data = self.context['request'].data.get("roomTypes", [])
        cover_image = self.context['request'].data.get("coverImage")

        # Create apartment
        apartment = Apartment.objects.create(landlord=landlord_profile, **validated_data)

        # Set cover image if provided
        if cover_image:
            from .models import ApartmentImage
            ApartmentImage.objects.create(apartment=apartment, image=cover_image)

        # Create rooms and room videos
        for type_data in room_types_data:
            room_type = type_data.get("type")
            monthly_rent = type_data.get("monthly_rent")
            video_file = type_data.get("video")
            rooms_list = type_data.get("rooms", [])

            if video_file:
                RoomVideo.objects.create(apartment=apartment, room_type=room_type, video=video_file)

            for room in rooms_list:
                Room.objects.create(
                    apartment=apartment,
                    room_type=room_type,
                    label=room.get("label"),
                    monthly_rent=monthly_rent,
                    is_vacant=(room.get("status") == "Vacant")
                )

        return apartment

    def update(self, instance, validated_data):
        room_types_data = self.context['request'].data.get("roomTypes", [])
        cover_image = self.context['request'].data.get("coverImage")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update cover image
        if cover_image:
            from .models import ApartmentImage
            ApartmentImage.objects.update_or_create(
                apartment=instance,
                defaults={"image": cover_image}
            )

        # Update rooms and videos
        for type_data in room_types_data:
            room_type = type_data.get("type")
            monthly_rent = type_data.get("monthly_rent")
            video_file = type_data.get("video")
            rooms_list = type_data.get("rooms", [])

            if video_file:
                RoomVideo.objects.update_or_create(
                    apartment=instance,
                    room_type=room_type,
                    defaults={"video": video_file}
                )

            for room in rooms_list:
                room_id = room.get("id")
                if room_id:
                    r = Room.objects.get(id=room_id, apartment=instance)
                    r.label = room.get("label")
                    r.room_type = room_type
                    r.monthly_rent = monthly_rent
                    r.is_vacant = (room.get("status") == "Vacant")
                    r.save()
                else:
                    Room.objects.create(
                        apartment=instance,
                        room_type=room_type,
                        label=room.get("label"),
                        monthly_rent=monthly_rent,
                        is_vacant=(room.get("status") == "Vacant")
                    )

        return instance
