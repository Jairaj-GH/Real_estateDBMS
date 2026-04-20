import MySQLdb
from decouple import config

try:
    db_name = config('DB_NAME', default='real_estate_db')
    user = config('DB_USER', default='root')
    password = config('DB_PASSWORD', default='')
    host = config('DB_HOST', default='localhost')
    port = config('DB_PORT', default=3306, cast=int)
    
    # Try connecting to MySQL without specifying a DB first
    conn = MySQLdb.connect(
        user=user,
        passwd=password,
        host=host,
        port=port
    )
    print("Connection Successful!")
    
    cursor = conn.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
    print(f"Database '{db_name}' ensured.")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
