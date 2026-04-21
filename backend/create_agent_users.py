import os
import django
import sys

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'real_estate_project.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth.models import User
from api.models import Agent
from authentication.models import UserProfile

def create_accounts():
    agents = Agent.objects.all()
    print(f"Starting account creation for {agents.count()} agents...")
    
    count = 0
    for agent in agents:
        email = agent.email
        if not email:
            print(f"  [SKIP] Agent ID {agent.agent_id} has no email.")
            continue
            
        # Use email as username
        username = email
        
        # Create or update user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'username': username, 'first_name': agent.name.split()[0]}
        )
        
        # Set common password
        user.set_password('agent123')
        user.save()
        
        # Link to profile
        profile, p_created = UserProfile.objects.update_or_create(
            user=user,
            defaults={
                'role': 'agent',
                'agent_id': agent.agent_id
            }
        )
        
        count += 1
        status = "Created" if created else "Updated"
        print(f"  [OK] {status} user for {email} (Agent ID: {agent.agent_id})")

    print(f"\nFinished! Total accounts processed: {count}")

if __name__ == "__main__":
    create_accounts()
