@echo off
setlocal enabledelayedexpansion
REM ===================================
REM Frontend Restart Script
REM ===================================
REM This script restarts the frontend development server
REM Usage: Double-click this file or run from command line

set FRONTEND_DIR=c:\Users\HP\OneDrive\Desktop\University Management\frontend
set PORT=5173

REM Check if frontend directory exists
if not exist "%FRONTEND_DIR%" (
    color 4F
    echo.
    echo ERROR: Frontend directory not found: "%FRONTEND_DIR%"
    echo.
    pause
    exit /b 1
)

cd /d "%FRONTEND_DIR%"
if errorlevel 1 (
    color 4F
    echo ERROR: Failed to change directory to frontend folder
    pause
    exit /b 1
)

echo.
echo ===== FRONTEND RESTART SCRIPT =====
echo Current directory: %CD%
echo.

REM Kill any existing Node process on the port
echo Stopping any existing frontend processes...
for /f "tokens=5" %%A in ('netstat -ano 2^>nul ^| findstr :%PORT%') do (
    taskkill /PID %%A /F 2>nul
)
timeout /t 2 /nobreak

REM Check if package.json exists
if not exist "package.json" (
    color 4F
    echo.
    echo ERROR: package.json not found in frontend directory!
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo.
    echo Installing dependencies first time... this may take a minute...
    call npm install
    if errorlevel 1 (
        color 4F
        echo.
        echo ERROR: npm install failed!
        echo Please check your npm installation and internet connection.
        echo.
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
)

REM Start the frontend development server
color 2F
echo.
echo ===== STARTING FRONTEND =====
echo Port: %PORT%
echo.
echo Frontend is starting... (This window can be closed after startup completes)
echo Press Ctrl+C to stop the frontend
echo.

timeout /t 2 /nobreak
call npm run dev

if errorlevel 1 (
    color 4F
    echo.
    echo ERROR: Frontend failed to start!
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)

pause
