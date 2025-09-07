from django.db import models
from django.core.validators import MinValueValidator
from bookings.models import Booking

class Payment(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="payment")
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    mpesa_checkout_id = models.CharField(max_length=120, blank=True)
    mpesa_status = models.CharField(max_length=30, default="NOT_PAID")  # NOT_PAID / PAID / FAILED
    created_at = models.DateTimeField(auto_now_add=True)
