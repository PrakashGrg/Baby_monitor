from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    baby_name = serializers.CharField(source='baby.name', read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'baby', 'baby_name', 'type', 'timestamp', 'snapshot']
        read_only_fields = ['id', 'timestamp', 'baby_name']