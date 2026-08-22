import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='yadavji')
cursor = conn.cursor()

# Read FRESH_SETUP.sql
with open('FRESH_SETUP.sql', 'r') as f:
    script = f.read()

# Count statements
statements = script.split(';')
total = len([s for s in statements if s.strip()])
print(f"Total statements in FRESH_SETUP.sql: {total}")

# Execute
executed = 0
for i, statement in enumerate(statements):
    statement = statement.strip()
    if not statement:
        continue
    try:
        cursor.execute(statement)
        executed += 1
        if executed <= 5 or executed % 10 == 0:
            print(f"  {executed}. Executed: {statement[:60]}...")
    except Exception as e:
        print(f"  ERROR on statement {executed+1}: {e}")
        
conn.commit()
cursor.close()
conn.close()
print(f"\nTotal executed: {executed}")
