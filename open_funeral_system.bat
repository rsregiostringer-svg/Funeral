@echo off
TITLE ALAALA FUNERAL HOMES MANAGEMENT SYSTEM - STARTUP
COLOR 06

echo =====================================================================
echo           ALAALA FUNERAL HOMES - MANAGEMENT SYSTEM
echo       Honoring Legacies, Preserving Sacred Memories
echo =====================================================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.10+ and re-run this script.
    pause
    exit /b 1
)

:: Check Node
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js 18+ and re-run this script.
    pause
    exit /b 1
)

echo [1/4] Applying database migrations...
cd /d "%~dp0backend"
python manage.py migrate --noinput
if errorlevel 1 (
    echo [WARNING] Migration encountered an issue. Proceeding with startup...
)

echo.
echo [2/4] Initializing Master Admin check...
echo If you have not created your Master Admin account yet, you can run:
echo      python manage.py setup_master_admin
echo in the backend directory.
echo.

echo [3/4] Starting Django REST Backend on http://127.0.0.1:8000 ...
start "Alaala Backend (Django)" cmd /k "cd /d %~dp0backend && color 0A && echo Starting Django REST API... && python manage.py runserver 127.0.0.1:8000"

echo [4/4] Starting Vite React Frontend on http://localhost:5173 ...
start "Alaala Frontend (React/Vite)" cmd /k "cd /d %~dp0frontend && color 0B && echo Starting Vite Dev Server... && npm.cmd run dev"

echo.
echo =====================================================================
echo  Alaala Funeral Homes Management System is starting!
echo  Backend:  http://127.0.0.1:8000/api/
echo  Frontend: http://localhost:5173/
echo =====================================================================
echo.
timeout /t 3 >nul
start http://localhost:5173/
exit /b 0
