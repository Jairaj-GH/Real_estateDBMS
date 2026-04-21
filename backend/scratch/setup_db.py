import os
import sys
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'real_estate_project.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

def run_sql():
    sql_commands = [
        """
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT,
            receiver_id INT,
            property_id INT,
            type VARCHAR(20) NOT NULL,
            status VARCHAR(15) DEFAULT 'pending',
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE
        );
        """,
        "ALTER TABLE Agent ADD COLUMN completed_deals INT DEFAULT 0;"
    ]

    with connection.cursor() as cursor:
        for sql in sql_commands:
            try:
                cursor.execute(sql)
                print(f"Executed: {sql[:50]}...")
            except Exception as e:
                print(f"Error executing SQL: {e}")

if __name__ == "__main__":
    run_sql()
