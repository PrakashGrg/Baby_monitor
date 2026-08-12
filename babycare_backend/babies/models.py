from django.db import models
from django.conf import settings


class Baby(models.Model):
    GENDER_CHOICES = (('male', 'Male'), ('female', 'Female'))

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='babies')
    name = models.CharField(max_length=100)
    dob = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    photo = models.ImageField(upload_to='baby_photos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"