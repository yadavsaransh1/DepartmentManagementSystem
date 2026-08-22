@echo off
REM ===== Start All Servers on Localhost (Local Development) =====
REM This script starts Backend, Phi Service, and Frontend on localhost

cls
echo.
echo ========================================
echo University Management System
echo Starting on IP: localhost
echo ========================================
echo.

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Set environment variables for localhost development
set VITE_SERVER_HOST=localhost
set VITE_SERVER_PORT=5173
set VITE_API_BASE_URL=http://localhost:8080
set VITE_PHI_API_BASE_URL=http://localhost:5000

REM Start Backend (Spring Boot)
echo [1/3] Starting Backend on localhost:8080...
start "Backend - Spring Boot" cmd /k "cd /d "%SCRIPT_DIR%backend" && mvn clean spring-boot:run"
timeout /t 3 /nobreak

REM Start Phi Service (Flask)
echo [2/3] Starting Phi AI Service on localhost:5000...
start "Phi Service - Flask" cmd /k "cd /d "%SCRIPT_DIR%phi-service" && python -m flask --app app_v2 run --host=localhost --port=5000"
timeout /t 2 /nobreak

REM Start Frontend (Vite) with localhost environment
echo [3/3] Starting Frontend on localhost:5173...
start "Frontend - Vite" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev -- --mode localhost"

echo.
echo ========================================
echo All services are starting...
echo ========================================
echo.
echo Services will be available at:
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8080/api
echo   Phi AI:    http://localhost:5000
echo.
echo Please wait for all services to fully start (2-3 minutes)
echo Check each window for "Server running on..." or similar messages
echo.
pause
