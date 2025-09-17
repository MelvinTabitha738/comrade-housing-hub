from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
import requests
from datetime import datetime
import base64


from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("booking", "user")
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """Save payment record linked to booking"""
        serializer.save()

    def get_mpesa_token(self):
        """
        Fetch M-Pesa OAuth token dynamically
        """
        consumer_key = settings.MPESA_CONSUMER_KEY
        consumer_secret = settings.MPESA_CONSUMER_SECRET
        auth = f"{consumer_key}:{consumer_secret}"
        encoded = base64.b64encode(auth.encode()).decode("utf-8")

        response = requests.get(
            settings.MPESA_OAUTH_URL,  # e.g. "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
            headers={"Authorization": f"Basic {encoded}"}
        )

        if response.status_code == 200:
            return response.json().get("access_token")
        else:
            return None

    @action(detail=True, methods=["post"], url_path="pay")
    def initiate_mpesa_payment(self, request, pk=None):
        """Initiate M-Pesa STK push for the booking"""
        payment = self.get_object()
        profile = payment.user  # ✅ directly from Payment.user (Profile)

        if not profile.phone:
            return Response({"error": "User has no phone number in profile."}, status=400)

        # Get fresh token
        access_token = self.get_mpesa_token()
        if not access_token:
            return Response({"error": "Failed to get M-Pesa access token"}, status=400)

        # Generate dynamic timestamp
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

        payload = {
            "BusinessShortCode": settings.MPESA_SHORTCODE,
            "Password": settings.MPESA_PASSWORD,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": str(payment.amount),
            "PartyA": profile.phone,
            "PartyB": settings.MPESA_SHORTCODE,
            "PhoneNumber": profile.phone,
            "CallBackURL": settings.MPESA_CALLBACK_URL,
            "AccountReference": f"Booking{payment.booking.id}",
            "TransactionDesc": "Booking Payment",
        }

        response = requests.post(
            settings.MPESA_STK_PUSH_URL,
            json=payload,
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if response.status_code == 200:
            data = response.json()
            payment.mpesa_checkout_id = data.get("CheckoutRequestID", "")
            payment.status = "PENDING"
            payment.save()
            return Response({"message": "STK Push initiated", "data": data})
        else:
            return Response({"error": "Failed to initiate payment", "details": response.json()}, status=400)
