Double-click: start-all.bat@echo off
setlocal enabledelayedexpansion
REM ===================================
REM Start Both Backend & Frontend
REM ===================================
REM This script starts both the backend and frontend development servers
REM Usage: Double-click this file

set BACKEND_DIR=c:\Users\HP\OneDrive\Desktop\University Management\backend
set FRONTEND_DIR=c:\Users\HP\OneDrive\Desktop\University Management\frontend
set BACKEND_PORT=8080
set FRONTEND_PORT=5173

color 2F
echo.
echo ========================================
echo  STARTING BACKEND AND FRONTEND SERVERS
echo ========================================
echo.
echo Backend will start on: http://localhost:%BACKEND_PORT%
echo Frontend will start on: http://localhost:%FRONTEND_PORT%
echo.

REM Kill any existing Java processes
echo [1/4] Stopping any running backend processes...
taskkill /IM java.exe /F /T 2>nul
timeout /t 2 /nobreak

REM Kill any existing Node processes
echo [2/4] Stopping any existing frontend processes...
netstat -ano | findstr :%FRONTEND_PORT% >nul
if !errorlevel! equ 0 (
    for /f "tokens=5" %%A in ('netstat -ano ^| findstr :%FRONTEND_PORT%') do (
        taskkill /PID %%A /F 2>nul
    )
    timeout /t 1 /nobreak
)

REM Start backend in new window
echo [3/4] Starting backend server...
start "University Management - Backend" "%BACKEND_DIR%\restart-backend.bat"

REM Wait for backend to start
timeout /t 8 /nobreak

REM Start frontend in new window
echo [4/4] Starting frontend server...
start "University Management - Frontend" "%FRONTEND_DIR%\restart-frontend.bat"

color 2F
echo.
echo ========================================
echo  SERVERS STARTING...
echo ========================================
echo.
echo Backend console: "University Management - Backend" window
echo Frontend console: "University Management - Frontend" window
echo.
echo Please wait a few seconds for both servers to fully start.
echo.
echo Once ready, open your browser to:
echo   http://localhost:%FRONTEND_PORT%
echo.
echo To stop the servers:
echo   - Close the backend window (Ctrl+C or close button)
echo   - Close the frontend window (Ctrl+C or close button)
echo.
pause
