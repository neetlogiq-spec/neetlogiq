@echo off
REM NEET Logiq Worker Startup Script for Windows
REM This script navigates to the correct directory and starts the Cloudflare Worker

echo 🚀 Starting NEET Logiq Cloudflare Worker...
echo 📁 Navigating to cloudflare-workers directory...

REM Navigate to the cloudflare-workers directory
cd /d "%~dp0cloudflare-workers"

REM Check if we're in the right directory
if not exist "wrangler.toml" (
    echo ❌ Error: wrangler.toml not found. Are you in the correct directory?
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo ✅ Found wrangler.toml in %CD%
echo 🔧 Starting worker on port 8787...

REM Start the worker
npx wrangler dev --port 8787

echo 🛑 Worker stopped.
pause
