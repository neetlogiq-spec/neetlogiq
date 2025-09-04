#!/bin/bash

# Stop NEET Logiq Hybrid Development System

echo "🛑 Stopping NEET Logiq Hybrid Development System"
echo "================================================"

# Kill all related processes
echo "🧹 Stopping all services..."

# Kill backend
pkill -f "node.*server.js" 2>/dev/null
echo "✅ Backend stopped"

# Kill frontend
pkill -f "react-scripts" 2>/dev/null
echo "✅ Frontend stopped"

# Kill wrangler
pkill -f "wrangler" 2>/dev/null
echo "✅ Wrangler stopped"

# Kill any Node.js processes on our ports
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:5002 | xargs kill -9 2>/dev/null
lsof -ti:8787 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "✅ All services stopped"
echo ""
echo "🎯 System is now clean and ready for restart"
