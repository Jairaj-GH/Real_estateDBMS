import requests
import json

# Try to log in first
try:
    auth_res = requests.post('http://localhost:8000/api/token/', json={
        'username': 'admin@realestate.com',
        'password': 'admin123'
    })
    if auth_res.status_code != 200:
        print(f"Auth failed: {auth_res.text}")
        exit(1)
    
    token = auth_res.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Check meta
    meta_res = requests.get('http://localhost:8000/api/properties/meta/', headers=headers)
    print(f"Meta: {meta_res.status_code}")
    print(json.dumps(meta_res.json(), indent=2))
    
    # Check properties
    prop_res = requests.get('http://localhost:8000/api/properties/', headers=headers)
    print(f"Properties: {prop_res.status_code}")
    props = prop_res.json()
    if 'results' in props:
        print(f"Count: {props['count']}, Page size: {len(props['results'])}")
    else:
        print(f"Count: {len(props)}")

except Exception as e:
    print(f"Error: {e}")
