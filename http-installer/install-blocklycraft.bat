@echo off
echo ========================================
echo   BlocklyCraft Loader Auto-Installer
echo ========================================
echo.
echo Downloading BlocklyCraft Loader...

set "LOADER_URL=http://10.248.110.111:8888/blockcraft-loader-1.0.0.jar"
set "MODS_DIR=%APPDATA%\.minecraft\mods"

:: Create mods directory if it doesn't exist
if not exist "%MODS_DIR%" mkdir "%MODS_DIR%"

:: Download using PowerShell
powershell -Command "Invoke-WebRequest -Uri '%LOADER_URL%' -OutFile '%MODS_DIR%\blockcraft-loader-1.0.0.jar'"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS! BlocklyCraft Loader installed!
    echo ========================================
    echo.
    echo Location: %MODS_DIR%\blockcraft-loader-1.0.0.jar
    echo.
    echo Start Minecraft to auto-download mods!
    echo.
) else (
    echo.
    echo ERROR: Failed to download. Make sure you're connected to the server.
    echo.
)

pause
