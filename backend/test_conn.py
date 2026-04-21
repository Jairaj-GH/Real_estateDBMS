import MySQLdb
import sys

try:
    conn = MySQLdb.connect(host="localhost", user="root", password="")
    print("Connected successfully with no password!")
    cursor = conn.cursor()
    cursor.execute("SHOW DATABASES")
    for db in cursor.fetchall():
        print(db[0])
    conn.close()
except Exception as e:
    print(f"Failed to connect: {e}")
