from django.db import models
from django.core.exceptions import ValidationError
from universities.models import University
from accounts.models import Profile
from math import radians, sin, cos, sqrt, atan2

# ------------------ VALIDATORS ------------------
def validate_image(file):
    """Ensure uploaded images are JPG or PNG and within size limit."""
    valid_extensions = [".jpg", ".jpeg", ".png"]
    if not any(file.name.lower().endswith(ext) for ext in valid_extensions):
        raise ValidationError("Only JPG and PNG images are allowed.")

    max_size_mb = 5
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Image size should not exceed {max_size_mb}MB.")


def validate_video(file):
    """Ensure uploaded videos are valid formats and within size limit."""
    valid_extensions = [".mp4", ".mov", ".avi"]
    if not any(file.name.lower().endswith(ext) for ext in valid_extensions):
        raise ValidationError("Only MP4, MOV, or AVI videos are allowed.")

    max_size_mb = 50
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Video size should not exceed {max_size_mb}MB.")


# ------------------ UPLOAD PATHS ------------------
def apartment_image_upload_path(instance, filename):
    """Upload path for apartment cover images."""
    return f"apartments/{instance.apartment.id}/{filename}"


def room_video_upload_path(instance, filename):
    """Upload path for videos grouped by apartment and room type."""
    return f"room_videos/{instance.apartment.id}/{instance.room_type}/{filename}"


# ------------------ MODELS ------------------
class Apartment(models.Model):
    """
    Represents an apartment listed by a landlord.
    Each apartment is linked to a specific university and a landlord profile.
    """
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name="apartments")
    landlord = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="apartments")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    amenities = models.JSONField(default=list, blank=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Map coordinates for location-based search
    lat = models.FloatField(null=True, editable=False)
    lon = models.FloatField(null=True, editable=False)

    def __str__(self):
        return f"{self.name} - {self.university.name}"

    def distance_from_university(self):
        """Calculate distance from university in km using Haversine formula."""
        if not self.university.lat or not self.university.lng or not self.lat or not self.lon:
            return None

        R = 6371  # Earth radius in km
        lat1, lon1 = radians(self.university.lat), radians(self.university.lng)
        lat2, lon2 = radians(self.lat), radians(self.lon)

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return round(R * c, 2)  # distance in kilometers


class ApartmentImage(models.Model):
    """
    Each apartment has exactly one cover image.
    Used for displaying apartment thumbnails on the frontend.
    """
    apartment = models.OneToOneField(
        Apartment,
        on_delete=models.CASCADE,
        related_name="image"
    )
    image = models.ImageField(upload_to=apartment_image_upload_path, validators=[validate_image])
    caption = models.CharField(max_length=120, blank=True)

    def __str__(self):
        return f"Cover image for {self.apartment.name}"


class Room(models.Model):
    """
    Represents an individual room in an apartment.
    Each room has:
    - Type (Single, Bedsitter, etc.)
    - Label (Room A, Room B)
    - Monthly Rent (specific to that room type)
    - Vacancy status
    """
    ROOM_TYPE_CHOICES = [
        ("single", "Single"),
        ("bedsitter", "Bedsitter"),
        ("onebedroom", "One Bedroom"),
        ("twobedroom", "Two Bedroom"),
    ]

    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name="rooms")
    label = models.CharField(max_length=30)  # e.g., "Room A"
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default="single")
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    is_vacant = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.label} ({self.get_room_type_display()}) @ {self.apartment.name}"


class RoomVideo(models.Model):
    """
    Each apartment can upload one video per room type.
    Example: one video for 'Single', another for 'Bedsitter', etc.
    """
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name="videos")
    room_type = models.CharField(max_length=20, choices=Room.ROOM_TYPE_CHOICES)
    video = models.FileField(upload_to=room_video_upload_path, validators=[validate_video])

    class Meta:
        unique_together = ("apartment", "room_type")  # ✅ only one video per room type per apartment

    def __str__(self):
        return f"Video for {self.apartment.name} - {self.get_room_type_display()}"
