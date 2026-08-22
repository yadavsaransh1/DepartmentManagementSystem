@echo off
REM ========================================================================
REM Complete Database Setup Script
REM ========================================================================
REM This script:
REM 1. Drops the old university_db database
REM 2. Creates a fresh database with all required tables
REM 3. Seeds sample data
REM ========================================================================

echo.
echo ========================================================================
echo UNIVERSITY MANAGEMENT SYSTEM - DATABASE SETUP
echo ========================================================================
echo.
echo This will:
echo   1. DROP the existing university_db database (WARNING: DATA LOSS!)
echo   2. Create a completely fresh database
echo   3. Load all tables and sample data
echo.
set /p confirm="Continue? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo Setup cancelled.
    exit /b 1
)

echo.
echo Connecting to MySQL...
echo.

REM Log in to MySQL and run the SQL script
mysql -u root -pyadavji < "%~dp0database\FRESH_SETUP.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================================
    echo ✅ SUCCESS: Database setup complete!
    echo ========================================================================
    echo.
    echo Database: university_db
    echo Tables: 19 core tables + Quartz scheduler tables
    echo.
    echo Sample credentials:
    echo   - Admin: admin@university.com / admin123
    echo   - Teacher: teacher11@university.com / teacher123  (HOD with all powers)
    echo   - Student: student1@university.com / password
    echo.
    echo Next step: Restart the backend application
    echo.
) else (
    echo.
    echo ========================================================================
    echo ❌ ERROR: Database setup failed!
    echo ========================================================================
    echo.
    echo Troubleshooting:
    echo   1. Check if MySQL is running
    echo   2. Verify credentials (user=root, password=yadavji)
    echo   3. Check if FRESH_SETUP.sql file exists in database\ folder
    echo.
    exit /b 1
)
