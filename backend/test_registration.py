import requests

BASE_URL = "http://localhost:8000/api"

def test_registration():
    # Test Buyer Registration
    payload_buyer = {
        "id": 1001,
        "name": "Test Buyer",
        "email": "buyer1001@example.com",
        "phone": "9999999999",
        "password": "password123",
        "role": "buyer"
    }
    
    print("Testing Buyer Registration...")
    response = requests.post(f"{BASE_URL}/register/", json=payload_buyer)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

    # Test Tenant Registration
    payload_tenant = {
        "id": 2001,
        "name": "Test Tenant",
        "email": "tenant2001@example.com",
        "phone": "8888888888",
        "password": "password123",
        "role": "tenant"
    }
    
    print("\nTesting Tenant Registration...")
    response = requests.post(f"{BASE_URL}/register/", json=payload_tenant)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    test_registration()
