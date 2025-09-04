#!/bin/bash

# NEET Logiq Hybrid Development System
# This script starts both the working setup (5001/5002) and Cloudflare simulation (8787/3000)

echo "🚀 Starting NEET Logiq Hybrid Development System"
echo "================================================"

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
pkill -f "wrangler" 2>/dev/null
sleep 2

# Start Backend (Node.js) on port 5001
echo "🔧 Starting Backend on port 5001..."
cd /Users/kashyapanand/Movies/v2.1_final/neetlogiq-platform/backend
node src/server.js &
BACKEND_PID=$!
sleep 3

# Test backend
echo "🔍 Testing backend..."
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:5001"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start Frontend (React) on port 5002
echo "🎨 Starting Frontend on port 5002..."
cd /Users/kashyapanand/Movies/v2.1_final/neetlogiq-frontend
PORT=5002 npm start &
FRONTEND_PID=$!
sleep 10

# Test frontend
echo "🔍 Testing frontend..."
if curl -s http://localhost:5002 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:5002"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

# Create Cloudflare Proxy on port 8787
echo "☁️  Starting Cloudflare Simulation Proxy on port 8787..."
cd /Users/kashyapanand/Movies/v2.1_final/neetlogiq-platform
node -e "
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
  logLevel: 'warn'
}));

app.listen(8787, () => {
  console.log('☁️  Cloudflare Simulation Proxy running on http://localhost:8787');
});
" &
PROXY_PID=$!
sleep 3

# Test proxy
echo "🔍 Testing Cloudflare proxy..."
if curl -s http://localhost:8787/health > /dev/null; then
    echo "✅ Cloudflare Simulation Proxy is running on http://localhost:8787"
else
    echo "❌ Cloudflare Simulation Proxy failed to start"
    exit 1
fi

echo ""
echo "🎉 Hybrid System Started Successfully!"
echo "======================================"
echo "📊 Backend (Node.js):     http://localhost:5001"
echo "🎨 Frontend (React):      http://localhost:5002"
echo "☁️  Cloudflare Simulation: http://localhost:8787"
echo ""
echo "🔧 Development URLs:"
echo "   - Main App: http://localhost:5002"
echo "   - API Health: http://localhost:5001/health"
echo "   - Cloudflare API: http://localhost:8787/health"
echo ""
echo "🛑 To stop all services, run: ./stop-hybrid-system.sh"
echo ""

# Keep script running
wait
