import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'real_estate_project.settings')
django.setup()

from django.contrib.auth.models import User
from authentication.models import UserProfile

users_to_create = [
    {
        'email': 'admin@realestate.com',
        'password': 'admin123',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True
    },
    {
        'email': 'office@realestate.com',
        'password': 'office123',
        'role': 'office',
        'is_staff': True
    },
    {
        'email': 'agent1@realestate.com',
        'password': 'agent123',
        'role': 'agent',
        'agent_id': 1  # Linking to first agent in DB
    },
    {
        'email': 'buyer1@example.com',
        'password': 'customer123',
        'role': 'customer'
    }
]

for user_data in users_to_create:
    username = user_data['email'].split('@')[0]
    # Check if user already exists
    user, created = User.objects.get_or_create(
        email=user_data['email'],
        defaults={
            'username': username,
            'is_staff': user_data.get('is_staff', False),
            'is_superuser': user_data.get('is_superuser', False)
        }
    )
    if created:
        user.set_password(user_data['password'])
        user.save()
        print(f"Created user: {user_data['email']}")
    else:
        print(f"User already exists: {user_data['email']}")

    # Create or update profile
    profile, p_created = UserProfile.objects.get_or_create(user=user)
    profile.role = user_data['role']
    if 'agent_id' in user_data:
        profile.agent_id = user_data['agent_id']
    profile.save()
    if p_created:
        print(f"Created profile for: {user_data['email']} with role {user_data['role']}")
    else:
        print(f"Updated profile for: {user_data['email']} with role {user_data['role']}")

print("User creation complete.")
