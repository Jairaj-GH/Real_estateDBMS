#!/usr/bin/env python
"""
Test script to verify Office Staff instant bypass authentication works.
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'real_estate_project.settings')
django.setup()

from django.contrib.auth.models import User
from authentication.views import CustomTokenObtainPairSerializer
import jwt

print('\n' + '='*60)
print('Testing Office Staff Authentication with Instant Bypass')
print('='*60 + '\n')

# Simulate the login request for Office Staff
email = 'office@realestate.com'
password = 'office123'

print(f'Login attempt:')
print(f'  Email: {email}')
print(f'  Password: {password}\n')

try:
    # Test the serializer validation
    serializer = CustomTokenObtainPairSerializer(data={
        'username': email,
        'password': password
    })
    
    if serializer.is_valid():
        print('✓ Authentication SUCCESS\n')
        
        tokens = serializer.validated_data
        print('Generated Tokens:')
        
        # Parse and display token data
        access_token = tokens.get('access')
        if access_token:
            try:
                decoded = jwt.decode(access_token, options={'verify_signature': False})
                print(f'  Access Token Claims:')
                print(f'    - Role: {decoded.get("role", "N/A")}')
                print(f'    - Email: {decoded.get("email", "N/A")}')
                print(f'    - Full Name: {decoded.get("full_name", "N/A")}')
                print(f'    - Agent ID: {decoded.get("agent_id", "N/A")}')
                
                role = decoded.get("role")
                if role == 'office':
                    print(f'\n✓✓✓ SUCCESS: Role correctly set to OFFICE ✓✓✓')
                else:
                    print(f'\n✗ ERROR: Role is {role}, expected office')
            except Exception as e:
                print(f'Error decoding token: {e}')
    else:
        print('✗ Authentication FAILED')
        print(f'Errors: {serializer.errors}')
        
except Exception as e:
    print(f'✗ Exception during authentication: {e}')
    import traceback
    traceback.print_exc()

print('\n' + '='*60 + '\n')
