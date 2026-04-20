#!/usr/bin/env python
"""
Quick setup script to create demo users in the database.
Usage: python setup_demo.py
"""
import os
import sys
import django

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'real_estate_project.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    django.setup()
except Exception as e:
    print(f"Error setting up Django: {e}")
    print("Make sure all dependencies are installed: pip install -r requirements.txt")
    sys.exit(1)

from django.contrib.auth.models import User
from authentication.models import UserProfile

DEMO_USERS = [
    {
        'email': 'office@realestate.com',
        'password': 'office123',
        'first_name': 'Office',
        'last_name': 'Staff',
        'role': 'office',
        'agent_id': None,
    },
    {
        'email': 'agent1@realestate.com',
        'password': 'agent123',
        'first_name': 'Agent',
        'last_name': 'One',
        'role': 'agent',
        'agent_id': 1, # Link to Agent ID 1
    },
    {
        'email': 'buyer1@example.com',
        'password': 'customer123',
        'first_name': 'John',
        'last_name': 'Buyer',
        'role': 'customer',
        'agent_id': None,
    },
    {
        'email': 'admin@realestate.com',
        'password': 'admin123',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin',
        'agent_id': None,
    },
]

def setup_demo_users():
    """Create demo users for all four roles."""
    print("\n" + "="*60)
    print("Setting up demo users for Real Estate Management System")
    print("="*60 + "\n")
    
    for u in DEMO_USERS:
        email = u['email']
        username = email.split('@')[0]
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'first_name': u['first_name'],
                'last_name': u['last_name'],
            }
        )
        
        user.set_password(u['password'])
        if u['role'] == 'admin':
            user.is_staff = True
            user.is_superuser = True
        user.save()
        
        # Update or create profile
        profile, p_created = UserProfile.objects.update_or_create(
            user=user,
            defaults={
                'role': u['role'],
                'agent_id': u['agent_id']
            }
        )
        
        status = "Created" if created else "Updated"
        print(f"  [OK] {status} {email} ({u['role']})")

    print("\n" + "="*60)
    print("Setup complete!")
    print("="*60)
    print("\nDemo users are ready:")
    print("   * Office Staff: office@realestate.com / office123")
    print("   * Agent: agent1@realestate.com / agent123")
    print("   * Customer: buyer1@example.com / customer123")
    print("   * Admin: admin@realestate.com / admin123")
    print("\nNow run: npm run dev (from the frontend folder)")
    print("   Click any demo button to sign in instantly!\n")

if __name__ == '__main__':
    setup_demo_users()
