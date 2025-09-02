#!/bin/bash

# Port Manager for Medical College System
# This script ensures clean port management and prevents conflicts

set -e

echo "🔧 Port Manager - Medical College System"
echo "========================================"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Port $port is already in use"
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    echo "🔄 Killing processes on port $port..."
    
    # Find PIDs using the port
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "📋 Found processes: $pids"
        for pid in $pids; do
            echo "💀 Killing process $pid"
            kill -9 $pid 2>/dev/null || true
        done
        sleep 2
        
        # Verify port is free
        if check_port $port; then
            echo "✅ Port $port is now free"
        else
            echo "❌ Failed to free port $port"
            return 1
        fi
    else
        echo "✅ Port $port is already free"
    fi
}

# Function to find available ports
find_available_ports() {
    echo "🔍 Finding available ports..."
    
    # Check common ports
    local ports=(4000 4001 4002 4003 4004 4005 4006 4007 4008 4009 4010)
    
    for port in "${ports[@]}"; do
        if check_port $port; then
            echo "🎯 Available port: $port"
        fi
    done
}

# Function to start services with port management
start_services() {
    echo "🚀 Starting services with port management..."
    
    # Kill any existing processes on our ports
    kill_port 4000
    kill_port 4001
    
    # Start backend on port 4001
    echo "🔧 Starting backend on port 4001..."
    cd backend
    PORT=4001 npm run dev &
    BACKEND_PID=$!
    echo "📋 Backend PID: $BACKEND_PID"
    
    # Wait for backend to start
    sleep 5
    
    # Check if backend is running
    if curl -s "http://localhost:4001/api/sector_xp_12/admin/search/health" >/dev/null 2>&1; then
        echo "✅ Backend is running on port 4001"
    else
        echo "❌ Backend failed to start"
        exit 1
    fi
    
    # Start frontend on port 4000
    echo "🔧 Starting frontend on port 4000..."
    cd ../frontend
    PORT=4000 npm run dev &
    FRONTEND_PID=$!
    echo "📋 Frontend PID: $FRONTEND_PID"
    
    # Wait for frontend to start
    sleep 10
    
    # Check if frontend is running
    if curl -s "http://localhost:4000" >/dev/null 2>&1; then
        echo "✅ Frontend is running on port 4000"
    else
        echo "❌ Frontend failed to start"
        exit 1
    fi
    
    echo ""
    echo "🎉 All services started successfully!"
    echo "🔗 Backend: http://localhost:4001"
    echo "🔗 Frontend: http://localhost:4000"
    echo "🔗 Admin: http://localhost:4000/sector_xp_12"
    echo ""
    echo "📋 Process IDs:"
    echo "   Backend: $BACKEND_PID"
    echo "   Frontend: $FRONTEND_PID"
    echo ""
    echo "💡 To stop all services: kill $BACKEND_PID $FRONTEND_PID"
    
    # Save PIDs to file for easy management
    echo "$BACKEND_PID $FRONTEND_PID" > ../.service-pids
}

# Function to stop all services
stop_services() {
    echo "🛑 Stopping all services..."
    
    if [ -f .service-pids ]; then
        local pids=$(cat .service-pids)
        echo "📋 Stopping processes: $pids"
        for pid in $pids; do
            kill -9 $pid 2>/dev/null || true
        done
        rm -f .service-pids
    fi
    
    # Also kill any processes on our ports
    kill_port 4000
    kill_port 4001
    
    echo "✅ All services stopped"
}

# Function to show status
show_status() {
    echo "📊 Service Status"
    echo "================="
    
    echo "🔧 Backend (Port 4001):"
    if check_port 4001; then
        if curl -s "http://localhost:4001/api/sector_xp_12/admin/search/health" >/dev/null 2>&1; then
            echo "   ✅ Running and healthy"
        else
            echo "   ⚠️  Port in use but service not responding"
        fi
    else
        echo "   ❌ Not running"
    fi
    
    echo ""
    echo "🔧 Frontend (Port 4000):"
    if check_port 4000; then
        if curl -s "http://localhost:4000" >/dev/null 2>&1; then
            echo "   ✅ Running and responding"
        else
            echo "   ⚠️  Port in use but service not responding"
        fi
    else
        echo "   ❌ Not running"
    fi
}

# Main script logic
case "${1:-start}" in
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        start_services
        ;;
    "status")
        show_status
        ;;
    "check")
        find_available_ports
        ;;
    "kill")
        kill_port 4000
        kill_port 4001
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|check|kill}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all services with port management"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  status  - Show current service status"
        echo "  check   - Check available ports"
        echo "  kill    - Force kill processes on ports 4000 and 4001"
        exit 1
        ;;
esac
