"""
Management command to create demo users for all 4 roles.
Run: python manage.py seed_users

This command is idempotent - it can be run multiple times without breaking.
It will skip users that already exist.
"""
from django.core.management.base import BaseCommand
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
        'agent_id': 1,  # Must match an existing agent_id in the DB
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


class Command(BaseCommand):
    help = 'Create demo users for all four roles. Command is idempotent and can be run multiple times.'

    def handle(self, *args, **kwargs):
        self.stdout.write("\n" + "="*60)
        self.stdout.write("Seeding demo users for Real Estate Management System")
        self.stdout.write("="*60 + "\n")
        
        created_count = 0
        skipped_count = 0
        
        for u in DEMO_USERS:
            email = u['email']
            username = email.split('@')[0]

            # Use get_or_create for idempotency
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'first_name': u['first_name'],
                    'last_name': u['last_name'],
                }
            )
            
            # Always update password to ensure it's correct
            user.set_password(u['password'])
            
            # Handle admin user
            if u['role'] == 'admin':
                user.is_staff = True
                user.is_superuser = True
            
            user.save()
            
            # Ensure UserProfile exists with correct role
            # The post_save signal should create it automatically, but we use get_or_create for safety
            profile, profile_created = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'role': u['role'],
                    'agent_id': u['agent_id'],
                }
            )
            
            # Update role if it changed (in case someone manually created the profile with wrong role)
            if profile.role != u['role']:
                profile.role = u['role']
                profile.save()
                self.stdout.write(self.style.WARNING(f'  [UPDATED] {email} role to {u["role"]}'))
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'  [CREATED] {email} ({u["role"]})'))
                created_count += 1
            else:
                self.stdout.write(f'  [EXISTS] {email}')
                skipped_count += 1

        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS(
            f'Demo users seeding complete! Created: {created_count}, Existing: {skipped_count}'
        ))
        self.stdout.write("="*60 + "\n")
        self.stdout.write("Demo users available:")
        self.stdout.write("  • Office Staff: office@realestate.com / office123")
        self.stdout.write("  • Agent: agent1@realestate.com / agent123")
        self.stdout.write("  • Customer: buyer1@example.com / customer123")
        self.stdout.write("  • Admin: admin@realestate.com / admin123\n")

