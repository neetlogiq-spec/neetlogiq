@echo off
REM NEET Logiq Frontend Startup Script for Windows
REM This script navigates to the frontend directory and starts the React development server

echo 🚀 Starting NEET Logiq Frontend...
echo 📁 Navigating to neetlogiq-frontend directory...

REM Navigate to the neetlogiq-frontend directory
cd /d "%~dp0neetlogiq-frontend"

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Are you in the correct directory?
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo ✅ Found package.json in %CD%
echo 🔧 Starting React development server on port 3000...

REM Start the React development server
npm start

echo 🛑 Frontend stopped.
pause
