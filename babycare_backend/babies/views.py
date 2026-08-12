from rest_framework import viewsets, permissions
from .models import Baby
from .serializers import BabySerializer


class BabyViewSet(viewsets.ModelViewSet):
    """Full CRUD: list, create, retrieve, update, delete."""
    serializer_class = BabySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Baby.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)