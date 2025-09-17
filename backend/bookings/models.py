from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from apartments.models import Room
from accounts.models import Profile


class Booking(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("CANCELLED", "Cancelled"),
    ]

    student = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="bookings")
    room = models.ForeignKey(Room, on_delete=models.PROTECT, related_name="bookings")

    full_name = models.CharField(max_length=120)
   
    phone = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^\+?\d{9,15}$', "Enter a valid phone number.")],
    )

    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["room"],
                condition=models.Q(status__in=["PENDING", "CONFIRMED"]),
                name="unique_active_booking_per_room"
            )
        ]

    def clean(self):
        if self.student.role != "student":
            raise ValidationError("Only students can make bookings.")

        if self.status in ["PENDING", "CONFIRMED"]:
            existing = self.__class__.objects.filter(
                room=self.room,
                status__in=["PENDING", "CONFIRMED"]
            ).exclude(id=self.id)
            if existing.exists():
                raise ValidationError("This room is already booked.")

    def save(self, *args, **kwargs):
        self.full_clean()  # ensures validations run
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.user.username} -> {self.room} ({self.status})"
