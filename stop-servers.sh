#!/bin/bash

echo "🛑 Stopping Medical College Management System..."
echo "================================================"

# Kill backend processes
echo "🔪 Stopping Backend Server..."
pkill -f "node.*completeServer.js" 2>/dev/null

# Kill frontend processes
echo "🔪 Stopping Frontend Server..."
pkill -f "vite" 2>/dev/null

# Kill nodemon processes
echo "🔪 Stopping Nodemon..."
pkill -f "nodemon" 2>/dev/null

# Wait for processes to terminate
sleep 2

# Check if ports are free
echo "🔍 Checking if ports are free..."
if lsof -i :4000 >/dev/null 2>&1; then
    echo "⚠️  Port 4000 is still in use"
else
    echo "✅ Port 4000 is free"
fi

if lsof -i :4001 >/dev/null 2>&1; then
    echo "⚠️  Port 4001 is still in use"
else
    echo "✅ Port 4001 is free"
fi

echo ""
echo "🎉 All servers stopped successfully!"
echo "====================================="
echo "💡 To start servers again: ./start-servers.sh"
