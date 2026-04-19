import os
import django
from django.contrib.auth.models import User

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'real_estate_project.settings')
django.setup()

for user in User.objects.all():
    print(f"Username: '{user.username}', Email: '{user.email}'")
