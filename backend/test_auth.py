import os
import django
from django.contrib.auth import authenticate

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'real_estate_project.settings')
django.setup()

user = authenticate(username='office', password='office123')
if user:
    print(f"Login successful for {user.username}")
else:
    print("Login failed for office")

user_by_email = authenticate(username='office@realestate.com', password='office123')
if user_by_email:
    print(f"Login successful by email for {user_by_email.username}")
else:
    print("Login failed by email (standard Django doesn't support this by default)")
