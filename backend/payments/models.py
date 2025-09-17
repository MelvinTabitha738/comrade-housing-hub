from django.db import models
from django.core.validators import MinValueValidator
from bookings.models import Booking
from accounts.models import Profile  # If you want to link to the user explicitly

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ("NOT_PAID", "Not Paid"),
        ("PAID", "Paid"),
        ("FAILED", "Failed"),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ("MPESA", "M-Pesa"),
        ("CARD", "Card"),
        ("OTHER", "Other"),
    ]

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="payment")
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="payments")  # optional, makes querying easier
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default="MPESA")
    mpesa_checkout_id = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=30, choices=PAYMENT_STATUS_CHOICES, default="NOT_PAID")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # useful to track last update

    def __str__(self):
        return f"Payment for Booking {self.booking.id} - {self.status}"
