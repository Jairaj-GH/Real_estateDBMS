import os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'real_estate_project.settings')
import django; django.setup()
from django.db import connection

c = connection.cursor()
c.execute('SET FOREIGN_KEY_CHECKS = 0')

# ─── 20 Properties across 10 Indian cities ───
c.execute("""INSERT INTO Property VALUES
(81, 'CP Tower Apt', 'Delhi', 'Connaught Place', 'Apartment', 1500, 3, 12000000, '2024-03-01', 2023, 'sold', 1, 5),
(82, 'Dwarka Green Villa', 'Delhi', 'Dwarka', 'House', 2200, 4, 8500000, '2024-06-15', 2022, 'rented', 2, 6),
(83, 'Andheri Heights', 'Mumbai', 'Andheri', 'Apartment', 900, 2, 9500000, '2024-02-10', 2024, 'sold', 3, 7),
(84, 'Bandra Sea View', 'Mumbai', 'Bandra', 'House', 3000, 5, 25000000, '2025-01-20', 2023, 'available', 4, 8),
(85, 'Whitefield Tech Park Flat', 'Bangalore', 'Whitefield', 'Apartment', 1300, 3, 7800000, '2024-04-05', 2024, 'sold', 5, 9),
(86, 'Koramangala Villa', 'Bangalore', 'Koramangala', 'House', 2500, 4, 15000000, '2024-08-20', 2022, 'rented', 6, 10),
(87, 'Salt Lake Modern Flat', 'Kolkata', 'Salt Lake', 'Apartment', 1100, 2, 4500000, '2025-02-01', 2025, 'available', 7, 1),
(88, 'Park Street Heritage', 'Kolkata', 'Park Street', 'House', 1800, 3, 7200000, '2024-05-10', 2021, 'sold', 8, 2),
(89, 'T Nagar Classic Apt', 'Chennai', 'T Nagar', 'Apartment', 1000, 2, 6200000, '2024-09-01', 2023, 'rented', 9, 3),
(90, 'Adyar Garden House', 'Chennai', 'Adyar', 'House', 2100, 4, 11000000, '2024-07-15', 2022, 'sold', 10, 4),
(91, 'Banjara Hills Luxury Apt', 'Hyderabad', 'Banjara Hills', 'Apartment', 1600, 3, 9800000, '2025-03-10', 2025, 'available', 11, 5),
(92, 'Jubilee Hills Mansion', 'Hyderabad', 'Jubilee Hills', 'House', 3500, 5, 22000000, '2024-11-01', 2023, 'sold', 12, 6),
(93, 'Kharadi IT Flat', 'Pune', 'Kharadi', 'Apartment', 1050, 2, 5500000, '2025-01-15', 2024, 'rented', 13, 7),
(94, 'Hinjewadi Green House', 'Pune', 'Hinjewadi', 'House', 1900, 3, 7000000, '2025-04-01', 2023, 'available', 14, 8),
(95, 'Malviya Nagar Apt', 'Jaipur', 'Malviya Nagar', 'Apartment', 1200, 2, 3800000, '2024-10-20', 2024, 'sold', 15, 9),
(96, 'Vaishali Nagar Villa', 'Jaipur', 'Vaishali Nagar', 'House', 2000, 3, 5200000, '2025-02-15', 2022, 'rented', 16, 10),
(97, 'Gomti Nagar Flat', 'Lucknow', 'Gomti Nagar', 'Apartment', 1100, 2, 4200000, '2025-05-01', 2025, 'available', 17, 1),
(98, 'Hazratganj Colonial House', 'Lucknow', 'Hazratganj', 'House', 2400, 4, 8800000, '2024-12-01', 2020, 'sold', 18, 2),
(99, 'SG Highway Smart Flat', 'Ahmedabad', 'SG Highway', 'Apartment', 1150, 2, 4800000, '2025-03-20', 2024, 'rented', 19, 3),
(100, 'Satellite Premium House', 'Ahmedabad', 'Satellite', 'House', 2300, 4, 9200000, '2025-06-01', 2023, 'available', 20, 4)""")
print('Properties 81-100: OK')

# ─── Sales for sold properties: 81, 83, 85, 88, 90, 92, 95, 98 ───
c.execute("""INSERT INTO Sale VALUES
(81, 41, 5, '2024-05-15', 12500000, 75),
(83, 42, 7, '2024-04-20', 9800000, 69),
(85, 43, 9, '2024-06-10', 8000000, 66),
(88, 44, 2, '2024-07-25', 7500000, 76),
(90, 45, 4, '2024-09-30', 11500000, 77),
(92, 46, 6, '2025-01-15', 22500000, 76),
(95, 47, 9, '2025-01-05', 3900000, 77),
(98, 48, 2, '2025-02-28', 9100000, 89)""")
print('Sales for cities: OK')

# ─── Rents for rented properties: 82, 86, 89, 93, 96, 99 ───
c.execute("""INSERT INTO Rent (property_id, tenant_id, agent_id, start_date, end_date, monthly_rent) VALUES
(82, 31, 6, '2024-07-01', '2025-07-01', 35000),
(86, 32, 10, '2024-09-01', '2025-09-01', 55000),
(89, 33, 3, '2024-10-01', '2025-10-01', 28000),
(93, 34, 7, '2025-02-01', '2026-02-01', 22000),
(96, 35, 10, '2025-03-01', '2026-03-01', 20000),
(99, 36, 3, '2025-04-01', '2026-04-01', 18000)""")
print('Rents for cities: OK')

c.execute('SET FOREIGN_KEY_CHECKS = 1')
connection.connection.commit()

# Verify
for t in ['Property', 'Sale', 'Rent']:
    c.execute(f'SELECT COUNT(*) FROM {t}')
    print(f'  {t}: {c.fetchone()[0]} rows')

c.execute("SELECT city, COUNT(*) FROM Property GROUP BY city ORDER BY COUNT(*) DESC")
print('\nProperties by city:')
for row in c.fetchall():
    print(f'  {row[0]}: {row[1]}')

print('\nDone!')
