@echo off
REM Build Backend with Committee Feature Fix
echo.
echo ========================================
echo Building Department Management Backend
echo ========================================
echo.

cd backend

echo Step 1: Cleaning previous build...
call mvn clean

echo.
echo Step 2: Building with Maven...
call mvn package -DskipTests

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo ✓ BUILD SUCCESSFUL
    echo ========================================
    echo.
    echo Starting Backend Server...
    echo.
    java -Dspring.datasource.url="jdbc:mysql://localhost:3306/university_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true" -Dspring.datasource.username="root" -Dspring.datasource.password="yadavji" -jar target/department-management-1.0.0.jar --server.address=10.52.9.128 --server.port=8080
) else (
    echo ========================================
    echo ✗ BUILD FAILED
    echo ========================================
    echo Check errors above
    pause
)
