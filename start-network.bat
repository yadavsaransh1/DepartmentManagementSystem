@echo off
REM ===== Start All Servers on 10.52.9.128 (Network Deployment) =====
REM This script starts Backend, Phi Service, and Frontend on the network IP

cls
echo.
echo ========================================
echo University Management System
echo Starting on IP: 10.52.9.128
echo ========================================
echo.

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Start Backend (Spring Boot)
echo [1/3] Starting Backend on 10.52.9.128:8080...
start "Backend - Spring Boot" cmd /k "cd /d "%SCRIPT_DIR%backend" && mvn clean spring-boot:run"
timeout /t 3 /nobreak

REM Start Phi Service (Flask)
echo [2/3] Starting Phi AI Service on 10.52.9.128:5000...
start "Phi Service - Flask" cmd /k "cd /d "%SCRIPT_DIR%phi-service" && python -m flask --app app_v2 run --host=10.52.9.128 --port=5000"
timeout /t 2 /nobreak

REM Start Frontend (Vite)
echo [3/3] Starting Frontend on 10.52.9.128:5173...
start "Frontend - Vite" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev"

echo.
echo ========================================
echo All services are starting...
echo ========================================
echo.
echo Services will be available at:
echo   Frontend:  http://10.52.9.128:5173
echo   Backend:   http://10.52.9.128:8080/api
echo   Phi AI:    http://10.52.9.128:5000
echo.
echo Please wait for all services to fully start (2-3 minutes)
echo Check each window for "Server running on..." or similar messages
echo.
pause
