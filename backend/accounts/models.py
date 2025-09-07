from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator

class LandlordProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='landlord_profile')
    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[RegexValidator(r'^\+?\d{9,15}$', "Enter a valid phone number.")],
    )
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Landlord: {self.user.username}"

