#!/usr/bin/env python3
"""
Complete Database Setup for University Management System
Drops the old database and creates a fresh one with all required tables
"""

import mysql.connector
from mysql.connector import Error
import sys

# Database connection parameters
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASS = 'yadavji'
DB_NAME = 'university_db'

def read_sql_file(filename):
    """Read SQL script from file"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"❌ Error: File {filename} not found!")
        return None

def execute_sql_script(connection, script):
    """Execute SQL script"""
    cursor = connection.cursor()
    
    # Split script into individual statements
    statements = script.split(';')
    
    total = len([s for s in statements if s.strip()])
    executed = 0
    
    for i, statement in enumerate(statements):
        statement = statement.strip()
        if not statement:
            continue
        
        try:
            cursor.execute(statement)
            executed += 1
            
            # Print progress
            if executed % 10 == 0:
                print(f"  ├─ Executed {executed}/{total} statements...")
                
        except Error as e:
            if 'database' in str(e).lower() or 'exists' in str(e).lower():
                # Ignore "database already exists" errors
                pass
            else:
                print(f"  ├─ Warning: {e}")
    
    connection.commit()
    return executed

def main():
    print("\n" + "=" * 70)
    print("UNIVERSITY MANAGEMENT SYSTEM - DATABASE SETUP")
    print("=" * 70)
    print("\nThis script will:")
    print("  1. DROP the existing 'university_db' database")
    print("  2. CREATE a completely fresh database")
    print("  3. CREATE all required tables (schema only, no data)")
    print("\n⚠️  WARNING: All existing data will be DELETED!")
    
    confirm = input("\nContinue? (type 'yes' to confirm): ").strip().lower()
    if confirm != 'yes':
        print("\n❌ Setup cancelled.")
        return False
    
    try:
        print("\n" + "=" * 70)
        print("Connecting to MySQL Server...")
        print("=" * 70)
        
        # Connect without database first
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS
        )
        
        if not connection.is_connected():
            print("❌ Error: Could not connect to MySQL!")
            return False
        
        print("✅ Connected to MySQL")
        
        print("\n" + "=" * 70)
        print("Executing Setup SQL Script...")
        print("=" * 70 + "\n")
        
        # Read and execute the SQL script
        sql_script = read_sql_file('FRESH_SETUP.sql')
        if not sql_script:
            return False
        
        executed = execute_sql_script(connection, sql_script)
        
        print(f"\n✅ Executed {executed} SQL statements successfully!")
        
        connection.close()
        
        print("\n" + "=" * 70)
        print("✅ DATABASE SETUP COMPLETE!")
        print("=" * 70)
        print("\nDatabase Details:")
        print(f"  • Host: {DB_HOST}")
        print(f"  • Database: {DB_NAME}")
        print(f"  • Tables: All required tables created (schema only)")
        print(f"\nNext Steps:")
        print(f"  1. Restart the backend application")
        print(f"  2. Your application is ready to use")
        print("\n" + "=" * 70 + "\n")
        
        return True
        
    except Error as e:
        print(f"\n❌ Error: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
