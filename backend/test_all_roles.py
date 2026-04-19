#!/usr/bin/env python
"""
Comprehensive test to verify all instant bypass demo accounts work.
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'real_estate_project.settings')
django.setup()

from django.contrib.auth.models import User
from authentication.views import CustomTokenObtainPairSerializer
import jwt

DEMO_ACCOUNTS = [
    {'label': 'Office Staff', 'email': 'office@realestate.com', 'password': 'office123', 'expected_role': 'office'},
    {'label': 'Agent Portal', 'email': 'agent1@realestate.com', 'password': 'agent123', 'expected_role': 'agent'},
    {'label': 'Customer', 'email': 'buyer1@example.com', 'password': 'customer123', 'expected_role': 'customer'},
    {'label': 'Admin Hub', 'email': 'admin@realestate.com', 'password': 'admin123', 'expected_role': 'admin'},
]

print('\n' + '='*70)
print('Testing ALL Instant Bypass Demo Accounts')
print('='*70 + '\n')

all_passed = True

for account in DEMO_ACCOUNTS:
    label = account['label']
    email = account['email']
    password = account['password']
    expected_role = account['expected_role']
    
    print(f'Testing {label}...')
    
    try:
        serializer = CustomTokenObtainPairSerializer(data={
            'username': email,
            'password': password
        })
        
        if serializer.is_valid():
            tokens = serializer.validated_data
            access_token = tokens.get('access')
            
            if access_token:
                decoded = jwt.decode(access_token, options={'verify_signature': False})
                actual_role = decoded.get('role', 'N/A')
                
                if actual_role == expected_role:
                    print(f'  ✓ PASS: Role is {actual_role} as expected')
                else:
                    print(f'  ✗ FAIL: Role is {actual_role}, expected {expected_role}')
                    all_passed = False
            else:
                print(f'  ✗ FAIL: No access token generated')
                all_passed = False
        else:
            print(f'  ✗ FAIL: Authentication failed - {serializer.errors}')
            all_passed = False
    except Exception as e:
        print(f'  ✗ FAIL: Exception - {str(e)}')
        all_passed = False
    
    print()

print('='*70)
if all_passed:
    print('✓✓✓ ALL TESTS PASSED ✓✓✓')
    print('Instant bypass authentication is working correctly!')
else:
    print('✗✗✗ SOME TESTS FAILED ✗✗✗')
print('='*70 + '\n')
