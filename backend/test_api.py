#!/usr/bin/env python
"""
Test script to verify backend API is responding correctly.
"""
import requests
import json
import jwt
import time

print('\n' + '='*60)
print('Testing Backend API Connectivity')
print('='*60 + '\n')

# Wait a moment for server to start
time.sleep(2)

# Test 1: Check if server is responding
print('Test 1: Checking if backend is responding...')
try:
    response = requests.get('http://localhost:8000/api/token/')
    print(f'✓ Backend server responding on port 8000')
    print(f'  HTTP Status: {response.status_code}\n')
except Exception as e:
    print(f'✗ Backend not responding: {e}\n')
    exit(1)

# Test 2: Test Office Staff login
print('Test 2: Testing Office Staff Login...')
try:
    response = requests.post('http://localhost:8000/api/token/', 
        json={
            'username': 'office@realestate.com',
            'password': 'office123'
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f'✓ Authentication successful')
        
        access_token = data.get('access')
        if access_token:
            decoded = jwt.decode(access_token, options={'verify_signature': False})
            role = decoded.get('role')
            email = decoded.get('email')
            print(f'  ✓ Access token received')
            print(f'  ✓ Role: {role}')
            print(f'  ✓ Email: {email}')
            
            if role == 'office':
                print(f'\n✓✓✓ SUCCESS: Office Staff can authenticate via API ✓✓✓\n')
            else:
                print(f'\n✗ ERROR: Expected role=office, got {role}\n')
        else:
            print(f'✗ No access token in response\n')
    else:
        print(f'✗ Authentication failed with status {response.status_code}')
        print(f'  Response: {response.text}\n')
except Exception as e:
    print(f'✗ Error: {e}\n')
    import traceback
    traceback.print_exc()

print('='*60)
print('\nNow open the frontend in your browser and click the buttons!')
print('='*60 + '\n')
