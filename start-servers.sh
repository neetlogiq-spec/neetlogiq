#!/bin/bash

echo "🚀 Starting Medical College Management System..."
echo "================================================"

# Kill any existing processes on our ports
echo "🔪 Killing existing processes on ports 4000 and 4001..."
pkill -f "node.*completeServer.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "nodemon" 2>/dev/null

# Wait a moment for processes to fully terminate
sleep 2

# Check if ports are free
echo "🔍 Checking port availability..."
if lsof -i :4000 >/dev/null 2>&1; then
    echo "❌ Port 4000 is still in use!"
    exit 1
fi

if lsof -i :4001 >/dev/null 2>&1; then
    echo "❌ Port 4001 is still in use!"
    exit 1
fi

echo "✅ Ports 4000 and 4001 are free"

# Start Backend Server
echo "🚀 Starting Backend Server (Port 4001)..."
cd backend
node completeServer.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:4001/api/health >/dev/null 2>&1; then
    echo "❌ Backend failed to start!"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend Server running on port 4001 (PID: $BACKEND_PID)"

# Start Frontend Server
echo "🚀 Starting Frontend Server (Port 4000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

# Check if frontend is running
if ! curl -s http://localhost:4000 >/dev/null 2>&1; then
    echo "❌ Frontend failed to start!"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend Server running on port 4000 (PID: $FRONTEND_PID)"

echo ""
echo "🎉 System Started Successfully!"
echo "================================="
echo "🌐 Main Website: http://localhost:4000"
echo "🔐 Admin Panel: http://localhost:4000/sector_xp_12"
echo "📡 Backend API: http://localhost:4001"
echo "🔑 Admin Credentials: [Check environment variables or documentation]"
echo ""
echo "📋 To stop servers: pkill -f 'node.*completeServer.js' && pkill -f 'vite'"
echo ""

# Keep script running and show logs
echo "📊 Monitoring servers... (Press Ctrl+C to stop)"
wait
