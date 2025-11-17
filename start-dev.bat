@echo off
REM BlocklyCraft Development Startup Script (Windows)
REM This script starts all required services for development

title BlocklyCraft Development Environment

echo.
echo ===================================
echo   BlocklyCraft Development Start
echo ===================================
echo.

REM Start Python API in new window
echo Starting Python API server (port 8585)...
start "BlocklyCraft API" python deploy_java_api.py

REM Wait 2 seconds for API to initialize
timeout /t 2 /nobreak >nul

REM Start Vite dev server
echo Starting Vite dev server (port 1420)...
echo.
echo ===================================
echo   Development Environment Ready!
echo ===================================
echo.
echo Web UI:      http://localhost:1420
echo Python API:  http://localhost:8585
echo.
echo Close this window to stop all services
echo.

npm run dev

REM If dev server stops, clean up
echo.
echo Shutting down services...
taskkill /FI "WindowTitle eq BlocklyCraft API*" /T /F >nul 2>&1
