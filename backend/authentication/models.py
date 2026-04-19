from django.db import models
from django.contrib.auth.models import User

ROLE_CHOICES = [
    ('office', 'Office Staff'),
    ('agent', 'Agent'),
    ('customer', 'Customer'),
    ('admin', 'Administrator'),
]

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    agent_id = models.IntegerField(null=True, blank=True, help_text="Links to Agent table if role=agent")

    def __str__(self):
        return f"{self.user.email} ({self.role})"

    class Meta:
        db_table = 'auth_user_profile'
