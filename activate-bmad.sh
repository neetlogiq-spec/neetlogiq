#!/bin/bash

# 🚀 BMAD-METHOD™ Activation Script for Medical College Management System
# Version: v2.1
# BMAD-METHOD™ Version: v4.41.0

echo "🏥 Medical College Management System - BMAD Integration"
echo "======================================================"
echo ""

# Check if we're in the right directory
if [ ! -f ".bmad-core/core-config.yaml" ]; then
    echo "❌ Error: BMAD-METHOD not found. Please run this script from the project root."
    exit 1
fi

echo "✅ BMAD-METHOD™ v4.41.0 detected"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js v20+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Function to start backend server
start_backend() {
    echo "🚀 Starting backend server..."
    cd backend
    if [ -f "package.json" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
        echo "🔧 Starting backend server on port 4001..."
        PORT=4001 npm run dev &
        BACKEND_PID=$!
        echo "✅ Backend started with PID: $BACKEND_PID"
        cd ..
        return 0
    else
        echo "❌ Backend package.json not found"
        cd ..
        return 1
    fi
}

# Function to start frontend server
start_frontend() {
    echo "🎨 Starting frontend server..."
    cd frontend
    if [ -f "package.json" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
        echo "🔧 Starting frontend server on port 4000..."
        PORT=4000 npm run dev &
        FRONTEND_PID=$!
        echo "✅ Frontend started with PID: $FRONTEND_PID"
        cd ..
        return 0
    else
        echo "❌ Frontend package.json not found"
        cd ..
        return 1
    fi
}

# Function to activate BMAD workflow
activate_bmad() {
    echo "🤖 Activating BMAD-METHOD™ AI agents..."
    
    # Check if npx bmad-method is available
    if npx bmad-method --version >/dev/null 2>&1; then
        echo "✅ BMAD-METHOD CLI available"
        
        # Start the medical college system workflow
        echo "🚀 Starting Medical College System workflow..."
        npx bmad-method workflow .bmad-core/workflows/medical-college-system.yaml &
        BMAD_PID=$!
        echo "✅ BMAD workflow started with PID: $BMAD_PID"
        
        # Wait a moment for workflow to initialize
        sleep 3
        
        # Get AI recommendations
        echo "🧠 Getting AI recommendations..."
        npx bmad-method recommend --area performance
        npx bmad-method recommend --area search-algorithms
        npx bmad-method recommend --area user-experience
        
        return 0
    else
        echo "⚠️  BMAD-METHOD CLI not available via npx"
        echo "🔧 Installing BMAD-METHOD CLI..."
        npm install -g bmad-method
        
        if command_exists bmad-method; then
            echo "✅ BMAD-METHOD CLI installed globally"
            return 0
        else
            echo "❌ Failed to install BMAD-METHOD CLI"
            return 1
        fi
    fi
}

# Function to run system validation
run_validation() {
    echo "🧪 Running system validation..."
    
    # Test backend API endpoints
    echo "🔍 Testing backend API endpoints..."
    sleep 5  # Wait for backend to start
    
    # Test colleges endpoint
    if curl -s -u "Lone_wolf#12:Apx_gp_delta" "http://localhost:4000/api/sector_xp_12/colleges" >/dev/null; then
        echo "✅ Colleges API endpoint working"
    else
        echo "❌ Colleges API endpoint failed"
    fi
    
    # Test programs endpoint
    if curl -s -u "Lone_wolf#12:Apx_gp_delta" "http://localhost:4000/api/sector_xp_12/programs" >/dev/null; then
        echo "✅ Programs API endpoint working"
    else
        echo "❌ Programs API endpoint failed"
    fi
    
    # Test frontend accessibility
    echo "🌐 Testing frontend accessibility..."
    sleep 3  # Wait for frontend to start
    
    if curl -s "http://localhost:4001" >/dev/null; then
        echo "✅ Frontend accessible"
    else
        echo "❌ Frontend not accessible"
    fi
}

# Function to display system status
display_status() {
    echo ""
    echo "📊 System Status"
    echo "================"
    
    # Check backend status
    if curl -s "http://localhost:4000/api/sector_xp_12/colleges" >/dev/null 2>&1; then
        echo "🟢 Backend: Running on port 4000"
    else
        echo "🔴 Backend: Not responding"
    fi
    
    # Check frontend status
    if curl -s "http://localhost:4001" >/dev/null 2>&1; then
        echo "🟢 Frontend: Running on port 4001"
    else
        echo "🔴 Frontend: Not responding"
    fi
    
    # Check BMAD status
    if [ ! -z "$BMAD_PID" ] && kill -0 $BMAD_PID 2>/dev/null; then
        echo "🟢 BMAD-METHOD: Active (PID: $BMAD_PID)"
    else
        echo "🔴 BMAD-METHOD: Not active"
    fi
    
    echo ""
    echo "🔗 Access URLs:"
    echo "   Backend API: http://localhost:4000"
    echo "   Frontend: http://localhost:4001"
    echo "   Admin Panel: http://localhost:4001/sector_xp_12"
    echo "   Colleges: http://localhost:4001/colleges"
    echo ""
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo "🛑 Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "🛑 Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$BMAD_PID" ]; then
        echo "🛑 Stopping BMAD workflow (PID: $BMAD_PID)..."
        kill $BMAD_PID 2>/dev/null
    fi
    
    echo "✅ Cleanup complete"
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Main execution
echo "🚀 Starting Medical College Management System with BMAD-METHOD™..."
echo ""

# Start backend
if start_backend; then
    echo "✅ Backend startup successful"
else
    echo "❌ Backend startup failed"
    exit 1
fi

# Start frontend
if start_frontend; then
    echo "✅ Frontend startup successful"
else
    echo "❌ Frontend startup failed"
    exit 1
fi

# Wait for servers to start
echo "⏳ Waiting for servers to initialize..."
sleep 5

# Activate BMAD
if activate_bmad; then
    echo "✅ BMAD-METHOD™ activation successful"
else
    echo "⚠️  BMAD-METHOD™ activation had issues"
fi

# Run validation
run_validation

# Display status
display_status

echo ""
echo "🎉 Medical College Management System is now running with BMAD-METHOD™!"
echo ""
echo "📋 Next Steps:"
echo "   1. Open http://localhost:4001 in your browser"
echo "   2. Test the advanced search functionality"
echo "   3. Check the admin panel at /sector_xp_12"
echo "   4. Monitor BMAD AI agents for recommendations"
echo ""
echo "🛑 To stop all services, press Ctrl+C"
echo ""

# Keep script running
wait
