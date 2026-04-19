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
        'agent_id': None,
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
    
    created_count = 0
    skipped_count = 0
    
    for u in DEMO_USERS:
        email = u['email']
        username = email.split('@')[0]
        
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            user.set_password(u['password'])
            user.save()
            
            # Ensure profile exists
            UserProfile.objects.get_or_create(
                user=user,
                defaults={'role': u['role'], 'agent_id': u['agent_id']}
            )
            print(f"  [OK] Updated {email} existing user")
            skipped_count += 1
            continue
        
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=u['password'],
                first_name=u['first_name'],
                last_name=u['last_name'],
            )
            
            if u['role'] == 'admin':
                user.is_staff = True
                user.is_superuser = True
                user.save()
            
            UserProfile.objects.create(
                user=user,
                role=u['role'],
                agent_id=u['agent_id'],
            )
            
            print(f"  [OK] Created {email} ({u['role']})")
            print(f"     Password: {u['password']}")
            created_count += 1
            
        except Exception as e:
            print(f"  [ERROR] Failed to create {email}: {e}")
    
    print("\n" + "="*60)
    print(f"Setup complete! Created: {created_count}, Updated/Skipped: {skipped_count}")
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
