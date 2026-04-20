import MySQLdb
import os
from decouple import config

def run_schema():
    user = config('DB_USER', default='root')
    password = config('DB_PASSWORD', default='password')
    host = config('DB_HOST', default='localhost')
    port = config('DB_PORT', default=3306, cast=int)
    
    # Read schema.sql
    with open('schema.sql', 'r', encoding='utf-8') as f:
        # Split by ';' but handle DELIMITER
        content = f.read()
        
    try:
        # Connect without DB to create it if needed
        db = MySQLdb.connect(host=host, user=user, passwd=password, port=port)
        cursor = db.cursor()
        
        # Split statements, but handle DELIMITER correctly
        # This is a bit complex for a simple script, so we'll execute blocks
        
        # 1. Split by DELIMITER
        parts = content.split('DELIMITER')
        
        for part in parts:
            if part.strip().startswith('$$'):
                # Handle trigger block
                block = part.split('$$')[1]
                # Further split IF needed, but usually a block is one chunk
                # We need to clean up 'DELIMITER ;' at the end if it exists
                clean_block = block.split('DELIMITER')[0].strip()
                if clean_block:
                    try:
                        cursor.execute(clean_block)
                    except Exception as e:
                        print(f"Error in delimiter block: {e}")
            else:
                # Regular SQL statements
                lines = part.strip().split(';')
                for line in lines:
                    cmd = line.strip()
                    if cmd:
                        try:
                            cursor.execute(cmd)
                        except Exception as e:
                            # Ignore 'No database selected' errors if the first part creates it
                            if "No database selected" in str(e):
                                # Try to find 'USE' statement manually
                                if "USE" in cmd.upper():
                                    cursor.execute(cmd)
                            else:
                                print(f"Error in statement: {e}\nCmd: {cmd[:100]}...")

        db.commit()
        db.close()
        print("Schema execution complete.")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == '__main__':
    run_schema()
