# universities/serializers.py
from rest_framework import serializers
from .models import University
from apartments.serializers import ApartmentReadSerializer
from apartments.models import Apartment

class UniversityReadSerializer(serializers.ModelSerializer):
    total_apartments = serializers.IntegerField(read_only=True)
    location = serializers.SerializerMethodField()
    

    class Meta:
        model = University
        fields = [
            'id', 'name', 'town', 'lat', 'lng',
            'location', 'total_apartments'
        ]

    def get_location(self, obj):
        if obj.lat and obj.lng:
            return {"lat": obj.lat, "lng": obj.lng}
        return None
    
#  for admin create/update
class UniversityWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = [
            'id', 'name', 'town', 'lat', 'lng'
        ]


    
