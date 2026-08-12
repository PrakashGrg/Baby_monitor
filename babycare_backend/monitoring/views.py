from rest_framework import viewsets, permissions
from .models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    """Event history: list/create/retrieve/delete. Filter by ?baby=<id>"""
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Event.objects.filter(baby__user=self.request.user)
        baby_id = self.request.query_params.get('baby')
        event_type = self.request.query_params.get('type')
        if baby_id:
            qs = qs.filter(baby_id=baby_id)
        if event_type:
            qs = qs.filter(type=event_type)
        return qs