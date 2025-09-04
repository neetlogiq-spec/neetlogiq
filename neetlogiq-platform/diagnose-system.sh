#!/bin/bash

# NEET Logiq System Diagnostic Script
# This script identifies all issues and provides solutions

echo "🔍 NEET Logiq System Diagnostic"
echo "==============================="
echo ""

# Check if we're in the right directory
echo "📁 Directory Check:"
echo "Current directory: $(pwd)"
if [[ "$(pwd)" == *"neetlogiq-platform"* ]]; then
    echo "✅ In correct directory"
else
    echo "❌ Not in neetlogiq-platform directory"
    echo "   Run: cd neetlogiq-platform"
fi
echo ""

# Check Node.js version
echo "🟢 Node.js Check:"
if command -v node &> /dev/null; then
    echo "✅ Node.js version: $(node --version)"
else
    echo "❌ Node.js not installed"
    echo "   Install: https://nodejs.org/"
fi
echo ""

# Check npm version
echo "📦 NPM Check:"
if command -v npm &> /dev/null; then
    echo "✅ NPM version: $(npm --version)"
else
    echo "❌ NPM not installed"
fi
echo ""

# Check wrangler
echo "☁️  Wrangler Check:"
if command -v wrangler &> /dev/null; then
    echo "✅ Wrangler version: $(wrangler --version)"
else
    echo "❌ Wrangler not installed"
    echo "   Install: npm install -g wrangler"
fi
echo ""

# Check port availability
echo "🔌 Port Availability Check:"
for port in 3000 5001 5002 8787; do
    if lsof -i :$port &> /dev/null; then
        echo "❌ Port $port is occupied by: $(lsof -i :$port | tail -1 | awk '{print $1}')"
    else
        echo "✅ Port $port is available"
    fi
done
echo ""

# Check file structure
echo "📂 File Structure Check:"
required_files=(
    "backend/src/server.js"
    "frontend/package.json"
    "../neetlogiq-frontend/package.json"
    "../neetlogiq-frontend/src/services/apiService.js"
    "../neetlogiq-frontend/src/config/auth.js"
)

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done
echo ""

# Check dependencies
echo "📦 Dependencies Check:"
if [[ -f "package.json" ]]; then
    echo "✅ Root package.json exists"
    if npm list express http-proxy-middleware cors &> /dev/null; then
        echo "✅ Required dependencies installed"
    else
        echo "❌ Missing dependencies"
        echo "   Run: npm install express http-proxy-middleware cors"
    fi
else
    echo "❌ Root package.json missing"
fi

if [[ -f "../neetlogiq-frontend/package.json" ]]; then
    echo "✅ Frontend package.json exists"
    if [[ -d "../neetlogiq-frontend/node_modules" ]]; then
        echo "✅ Frontend dependencies installed"
    else
        echo "❌ Frontend dependencies missing"
        echo "   Run: cd ../neetlogiq-frontend && npm install"
    fi
else
    echo "❌ Frontend package.json missing"
fi
echo ""

# Check backend configuration
echo "🔧 Backend Configuration Check:"
if [[ -f "backend/src/server.js" ]]; then
    if grep -q "PORT.*5001" backend/src/server.js; then
        echo "✅ Backend configured for port 5001"
    else
        echo "❌ Backend not configured for port 5001"
    fi
else
    echo "❌ Backend server.js missing"
fi
echo ""

# Check frontend configuration
echo "🎨 Frontend Configuration Check:"
if [[ -f "../neetlogiq-frontend/src/services/apiService.js" ]]; then
    if grep -q "localhost:5001" ../neetlogiq-frontend/src/services/apiService.js; then
        echo "✅ Frontend API configured for port 5001"
    else
        echo "❌ Frontend API not configured for port 5001"
    fi
else
    echo "❌ Frontend API service missing"
fi

if [[ -f "../neetlogiq-frontend/src/config/auth.js" ]]; then
    if grep -q "localhost:5001" ../neetlogiq-frontend/src/config/auth.js; then
        echo "✅ Frontend auth configured for port 5001"
    else
        echo "❌ Frontend auth not configured for port 5001"
    fi
else
    echo "❌ Frontend auth config missing"
fi
echo ""

# Check running processes
echo "🔄 Running Processes Check:"
if pgrep -f "node.*server.js" &> /dev/null; then
    echo "✅ Backend process running"
else
    echo "❌ Backend process not running"
fi

if pgrep -f "react-scripts" &> /dev/null; then
    echo "✅ Frontend process running"
else
    echo "❌ Frontend process not running"
fi

if pgrep -f "wrangler" &> /dev/null; then
    echo "✅ Wrangler process running"
else
    echo "❌ Wrangler process not running"
fi
echo ""

# Summary and recommendations
echo "📋 Summary and Recommendations:"
echo "==============================="
echo ""

if lsof -i :5001 &> /dev/null; then
    echo "✅ Backend is running on port 5001"
else
    echo "❌ Start backend: cd backend && node src/server.js"
fi

if lsof -i :5002 &> /dev/null; then
    echo "✅ Frontend is running on port 5002"
else
    echo "❌ Start frontend: cd ../neetlogiq-frontend && PORT=5002 npm start"
fi

if lsof -i :8787 &> /dev/null; then
    echo "✅ Cloudflare simulation is running on port 8787"
else
    echo "❌ Start Cloudflare simulation: ./start-hybrid-system.sh"
fi

echo ""
echo "🚀 Quick Start Commands:"
echo "========================"
echo "1. Start everything: ./start-hybrid-system.sh"
echo "2. Stop everything:  ./stop-hybrid-system.sh"
echo "3. Manual start:"
echo "   - Backend:  cd backend && node src/server.js"
echo "   - Frontend: cd ../neetlogiq-frontend && PORT=5002 npm start"
echo ""
