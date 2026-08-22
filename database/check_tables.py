import mysql.connector
import sys
sys.path.insert(0, r'C:\Users\HP\OneDrive\Desktop\University Management\database')

conn = mysql.connector.connect(host='localhost', user='root', password='yadavji', database='university_db')
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='university_db'")
count = cursor.fetchone()[0]
print(f"Total tables in university_db: {count}")
cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='university_db' ORDER BY TABLE_NAME")
for row in cursor.fetchall():
    print(f"  - {row[0]}")
cursor.close()
conn.close()
