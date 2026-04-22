import os, sys, random
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'real_estate_project.settings')
import django
django.setup()
from api.models import Property, Owner, Agent
from django.db import connection

cities = [
    'Surat', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 
    'Patna', 'Vadodara', 'Ludhiana', 'Agra', 'Nashik', 
    'Ranchi', 'Guwahati', 'Chandigarh', 'Bhubaneswar', 'Coimbatore'
]

owners = list(Owner.objects.all())
agents = list(Agent.objects.all())

if not owners or not agents:
    print("Cannot proceed. Not enough owners or agents.")
    sys.exit(1)

max_prop = Property.objects.order_by('-property_id').first()
next_id = max_prop.property_id + 1 if max_prop else 101

try:
    for i in range(15):
        c = cities[i]
        p = Property.objects.create(
            property_id=next_id + i,
            address=f'{c} Central Rd {i}',
            city=c,
            locality=f'{c} Center',
            type=random.choice(['Apartment', 'House', 'Villa', 'Condo']),
            size=random.randint(800, 3000),
            no_of_bedroom=random.randint(1, 5),
            listed_price=random.randint(40, 200) * 100000,
            listed_date='2025-05-01',
            construction_year=random.randint(2010, 2025),
            current_status='available',
            owner=random.choice(owners),
            agent=random.choice(agents)
        )
    print("Successfully added 15 properties in random cities with status 'available'.")
    
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM Property WHERE current_status = 'available'")
        avail = cursor.fetchone()[0]
        print(f"Total available properties now: {avail}")

except Exception as e:
    print(f"Error occurred: {e}")
