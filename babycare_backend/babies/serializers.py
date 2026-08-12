from rest_framework import serializers
from .models import Baby


class BabySerializer(serializers.ModelSerializer):
    class Meta:
        model = Baby
        fields = ['id', 'name', 'dob', 'gender', 'photo', 'created_at']
        read_only_fields = ['id', 'created_at']