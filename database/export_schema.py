import mysql.connector
from datetime import datetime

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='yadavji',
    database='university_db'
)

cursor = conn.cursor()
cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='university_db'")
tables = [row[0] for row in cursor.fetchall()]
print(f"✅ Found {len(tables)} tables in database")

with open('HIBERNATE_GENERATED_SCHEMA.sql', 'w') as f:
    f.write(f"-- ========================================================================\n")
    f.write(f"-- HIBERNATE AUTO-GENERATED SCHEMA (Exported: {datetime.now()})\n")
    f.write(f"-- ========================================================================\n\n")
    f.write(f"CREATE DATABASE IF NOT EXISTS university_db;\nUSE university_db;\n\n")
    
    for table in sorted(tables):
        cursor.execute(f"SHOW CREATE TABLE {table}")
        result = cursor.fetchone()
        if result:
            create_stmt = result[1]
            f.write(f"-- {table}\n")
            f.write(create_stmt + ";\n\n")
            print(f"  ✓ {table}")

cursor.close()
conn.close()
print(f"✅ Schema exported to HIBERNATE_GENERATED_SCHEMA.sql")
