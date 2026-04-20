import requests, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = "http://localhost:8000/api"
r = requests.post(f"{BASE}/token/", json={"username": "admin@realestate.com", "password": "admin123"})
token = r.json()["access"]
headers = {"Authorization": f"Bearer {token}"}

QUERIES = [
    ("(a) Rented houses built after 2023", "SELECT address, city, construction_year, current_status FROM Property WHERE city = 'Guwahati' AND construction_year > 2023 AND current_status = 'rented';"),
    ("(b) Houses 20L-60L", "SELECT address, listed_price FROM Property WHERE city = 'Guwahati' AND listed_price BETWEEN 2000000 AND 6000000;"),
    ("(c) G.S Road rents", "SELECT p.address, p.locality, p.no_of_bedroom, r.monthly_rent FROM Property p JOIN Rent r ON p.property_id = r.property_id WHERE p.city = 'Guwahati' AND p.locality = 'G.S Road' AND p.no_of_bedroom >= 2 AND r.monthly_rent < 15000;"),
    ("(d) Top Agent 2023", "SELECT a.name, SUM(s.final_price) AS total_sales_amount FROM Agent a JOIN Sale s ON a.agent_id = s.agent_id WHERE YEAR(s.sale_date) = 2023 GROUP BY a.agent_id, a.name ORDER BY total_sales_amount DESC LIMIT 1;"),
    ("(d-alt) HAVING", "SELECT a.name, SUM(s.final_price) AS total_sales_amount FROM Agent a JOIN Sale s ON a.agent_id = s.agent_id WHERE YEAR(s.sale_date) = 2023 GROUP BY a.agent_id, a.name HAVING SUM(s.final_price) = ( SELECT MAX(total_sales) FROM ( SELECT SUM(s2.final_price) AS total_sales FROM Sale s2 WHERE YEAR(s2.sale_date) = 2023 GROUP BY s2.agent_id ) AS temp );"),
    ("(e) Avg 2018", "SELECT a.name, AVG(s.final_price) AS avg_selling_price, AVG(s.days_on_market) AS avg_days_on_market FROM Agent a JOIN Sale s ON a.agent_id = s.agent_id WHERE YEAR(s.sale_date) = 2018 GROUP BY a.agent_id, a.name;"),
    ("(f) Most expensive", "SELECT address, listed_price, type, no_of_bedroom, size FROM Property WHERE current_status IN ('available', 'sold') AND listed_price = ( SELECT MAX(listed_price) FROM Property WHERE current_status IN ('available', 'sold') );"),
    ("(f) Highest rent", "SELECT p.address, r.monthly_rent, p.type, p.no_of_bedroom, p.size FROM Property p JOIN Rent r ON p.property_id = r.property_id WHERE r.end_date > CURDATE() AND r.monthly_rent = ( SELECT MAX(r2.monthly_rent) FROM Rent r2 WHERE r2.end_date > CURDATE() );"),
    ("(f) Combined", "(SELECT 'Most Expensive House' AS category, address, listed_price AS value, type FROM Property ORDER BY listed_price DESC LIMIT 1) UNION (SELECT 'Highest Rent House' AS category, address, monthly_rent AS value, type FROM Property p JOIN Rent r ON p.property_id = r.property_id WHERE r.end_date > CURDATE() ORDER BY r.monthly_rent DESC LIMIT 1);"),
    ("Recent Sales", "SELECT s.sale_date, p.address, p.city, a.name AS agent, b.name AS buyer, s.final_price, s.days_on_market FROM Sale s JOIN Property p ON s.property_id = p.property_id JOIN Agent a ON s.agent_id = a.agent_id JOIN Buyer b ON s.buyer_id = b.buyer_id ORDER BY s.sale_date DESC LIMIT 10;"),
]

for label, query in QUERIES:
    r = requests.post(f"{BASE}/admin/sql/", json={"query": query}, headers=headers, timeout=10)
    if r.status_code == 200:
        d = r.json()
        print(f"OK  {label}: {d.get('row_count', d.get('affected_rows', '?'))} rows")
    else:
        try:
            err = r.json().get('error', '')[:120]
        except:
            err = r.text[:120]
        print(f"ERR {label}: {r.status_code} - {err}")
