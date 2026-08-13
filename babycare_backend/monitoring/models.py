from django.db import models
from babies.models import Baby


class Event(models.Model):
    EVENT_TYPES = (('motion', 'Motion'), ('cry', 'Cry'))

    baby = models.ForeignKey(Baby, on_delete=models.CASCADE, related_name='events')
    type = models.CharField(max_length=10, choices=EVENT_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    snapshot = models.ImageField(upload_to='snapshots/', blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.type} - {self.baby.name} - {self.timestamp}"


class SystemLog(models.Model):
    LEVEL_CHOICES = (
        ('INFO', 'Info'),
        ('WARNING', 'Warning'),
        ('ERROR', 'Error'),
    )

    baby = models.ForeignKey(Baby, on_delete=models.CASCADE, related_name='system_logs', null=True, blank=True)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='INFO')
    message = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.level}] {self.message} - {self.timestamp}"