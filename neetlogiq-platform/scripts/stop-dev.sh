#!/bin/bash

# NEET Logiq Platform - Development Stop Script
# This script stops all development servers

echo "🛑 Stopping NEET Logiq Platform Development Environment..."

# Kill processes on standard ports
echo "🧹 Stopping processes on ports 3000 and 5000..."

# Kill frontend (React) processes
FRONTEND_PIDS=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "   Stopping frontend processes: $FRONTEND_PIDS"
    echo $FRONTEND_PIDS | xargs kill -9
else
    echo "   No frontend processes found on port 3000"
fi

# Kill backend (Node.js) processes
BACKEND_PIDS=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "   Stopping backend processes: $BACKEND_PIDS"
    echo $BACKEND_PIDS | xargs kill -9
else
    echo "   No backend processes found on port 5000"
fi

# Kill any remaining Node.js processes related to the project
echo "🧹 Cleaning up any remaining project processes..."
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
pkill -f "neetlogiq" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Verify ports are free
echo "🔍 Verifying ports are free..."
if lsof -i:3000 >/dev/null 2>&1; then
    echo "   ⚠️  Port 3000 is still in use"
else
    echo "   ✅ Port 3000 is free"
fi

if lsof -i:5000 >/dev/null 2>&1; then
    echo "   ⚠️  Port 5000 is still in use"
else
    echo "   ✅ Port 5000 is free"
fi

echo "✅ All development servers stopped"
echo "🚀 Run './scripts/start-dev.sh' to start again"
