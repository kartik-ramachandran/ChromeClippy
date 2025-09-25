@echo off
echo 📎 Setting up AI Clippy 2025...
echo.

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building extension...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo ✅ AI Clippy 2025 is ready!
echo.
echo Next steps:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable "Developer mode" (top right toggle)
echo 3. Click "Load unpacked" and select the "dist" folder
echo 4. Clippy will appear on all web pages! 📎
echo.
pause