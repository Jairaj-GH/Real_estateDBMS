from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from authentication.models import UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a UserProfile when a new User is created.
    This ensures every User has an associated profile with a default role.
    
    Args:
        sender: The User model class
        instance: The User instance being saved
        created: Boolean indicating if this is a new User
        **kwargs: Additional signals kwargs
    """
    if created:
        UserProfile.objects.get_or_create(
            user=instance,
            defaults={'role': 'customer', 'agent_id': None}
        )


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Save the associated UserProfile when a User is saved.
    This ensures the profile stays in sync with the User.
    
    Args:
        sender: The User model class
        instance: The User instance being saved
        **kwargs: Additional signals kwargs
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()
