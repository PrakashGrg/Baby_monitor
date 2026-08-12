from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user = parent/caregiver account."""
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username