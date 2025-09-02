#!/bin/bash

# 🚀 Background Server Starter for Medical College System
# Version: v2.1 - Background Mode

set -e

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=4001
FRONTEND_PORT=4000
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
LOG_DIR="logs"
PID_FILE=".server-pids"

# Create logs directory
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        log "🔪 Killing processes on port $port: $pids"
        kill -9 $pids 2>/dev/null || true
        sleep 2
    fi
}

# Function to clean up all related processes
cleanup() {
    log "🧹 Cleaning up all related processes..."
    
    # Kill processes by PID if PID file exists
    if [ -f "$PID_FILE" ]; then
        while read -r pid; do
            if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                log "🛑 Stopping process PID: $pid"
                kill -TERM "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
            fi
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi
    
    # Kill by port
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    # Kill by process name
    pkill -f "node.*completeServer.js" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    pkill -f "nodemon" 2>/dev/null || true
    
    log "✅ Cleanup completed"
}

# Function to start backend server in background
start_backend() {
    log "🚀 Starting Backend Server (Port $BACKEND_PORT)..."
    
    if [ ! -d "$BACKEND_DIR" ]; then
        log "❌ Backend directory not found: $BACKEND_DIR"
        return 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log "📦 Installing backend dependencies..."
        npm install
    fi
    
    # Start server with specific port in background
    log "🔧 Starting backend on port $BACKEND_PORT..."
    nohup bash -c "PORT=$BACKEND_PORT npm run dev" > "../$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    
    cd ..
    
    # Save PID
    echo "$BACKEND_PID" >> "$PID_FILE"
    
    # Wait for server to start
    local attempts=0
    while [ $attempts -lt 30 ]; do
        if check_port $BACKEND_PORT; then
            log "✅ Backend Server running on port $BACKEND_PORT (PID: $BACKEND_PID)"
            return 0
        fi
        sleep 1
        attempts=$((attempts + 1))
    done
    
    log "❌ Backend failed to start on port $BACKEND_PORT"
    return 1
}

# Function to start frontend server in background
start_frontend() {
    log "🚀 Starting Frontend Server (Port $FRONTEND_PORT)..."
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        log "❌ Frontend directory not found: $FRONTEND_DIR"
        return 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Start server with specific port in background
    log "🔧 Starting frontend on port $FRONTEND_PORT..."
    nohup bash -c "PORT=$FRONTEND_PORT npm run dev" > "../$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    
    cd ..
    
    # Save PID
    echo "$FRONTEND_PID" >> "$PID_FILE"
    
    # Wait for server to start
    local attempts=0
    while [ $attempts -lt 30 ]; do
        if check_port $FRONTEND_PORT; then
            log "✅ Frontend Server running on port $FRONTEND_PORT (PID: $FRONTEND_PID)"
            return 0
        fi
        sleep 1
        attempts=$((attempts + 1))
    done
    
    log "❌ Frontend failed to start on port $FRONTEND_PORT"
    return 1
}

# Function to check server health
check_health() {
    local backend_healthy=false
    local frontend_healthy=false
    
    # Check backend
    if check_port $BACKEND_PORT; then
        if curl -s "http://localhost:$BACKEND_PORT/api/sector_xp_12/health" >/dev/null 2>&1; then
            backend_healthy=true
        fi
    fi
    
    # Check frontend
    if check_port $FRONTEND_PORT; then
        if curl -s "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1; then
            frontend_healthy=true
        fi
    fi
    
    if [ "$backend_healthy" = true ] && [ "$frontend_healthy" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to show status
show_status() {
    log "📊 Server Status:"
    echo "================================================="
    
    if check_port $BACKEND_PORT; then
        local backend_pid=$(lsof -ti:$BACKEND_PORT 2>/dev/null | head -1)
        echo -e "🟢 Backend:  Running on port $BACKEND_PORT (PID: $backend_pid)"
    else
        echo -e "🔴 Backend:  Not running"
    fi
    
    if check_port $FRONTEND_PORT; then
        local frontend_pid=$(lsof -ti:$FRONTEND_PORT 2>/dev/null | head -1)
        echo -e "🟢 Frontend: Running on port $FRONTEND_PORT (PID: $frontend_pid)"
    else
        echo -e "🔴 Frontend: Not running"
    fi
    
    echo "================================================="
    echo -e "🌐 Main Website: http://localhost:$FRONTEND_PORT"
    echo -e "🔐 Admin Panel: http://localhost:$FRONTEND_PORT/sector_xp_12"
    echo -e "📡 Backend API: http://localhost:$BACKEND_PORT"
    echo -e "🔑 Admin Credentials: Lone_wolf#12:Apx_gp_delta"
    echo ""
    echo -e "📋 To check status: ./scripts/start-background.sh status"
    echo -e "📋 To stop servers: ./scripts/start-background.sh stop"
    echo -e "📋 To view logs: tail -f logs/backend.log or tail -f logs/frontend.log"
}

# Function to start all servers in background
start_all() {
    log "🚀 Starting Medical College Management System in Background..."
    echo "================================================="
    
    # Clean up first
    cleanup
    
    # Wait for ports to be free
    sleep 2
    
    # Start backend
    if start_backend; then
        log "✅ Backend startup successful"
    else
        log "❌ Backend startup failed"
        cleanup
        exit 1
    fi
    
    # Start frontend
    if start_frontend; then
        log "✅ Frontend startup successful"
    else
        log "❌ Frontend startup failed"
        cleanup
        exit 1
    fi
    
    # Wait for servers to initialize
    log "⏳ Waiting for servers to initialize..."
    sleep 5
    
    # Check health
    if check_health; then
        log "🎉 All servers started successfully in background!"
        show_status
        log "✅ You can now continue with other commands in this terminal"
    else
        log "❌ Health check failed"
        cleanup
        exit 1
    fi
}

# Function to stop all servers
stop_all() {
    log "🛑 Stopping all servers..."
    cleanup
    log "✅ All servers stopped"
}

# Function to restart all servers
restart_all() {
    log "🔄 Restarting all servers..."
    stop_all
    sleep 2
    start_all
}

# Main execution
case "${1:-start}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        show_status
        ;;
    health)
        if check_health; then
            log "✅ All servers are healthy"
        else
            log "❌ Some servers are not healthy"
        fi
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|health|cleanup}"
        echo "  start   - Start all servers in background"
        echo "  stop    - Stop all servers"
        echo "  restart - Restart all servers"
        echo "  status  - Show server status"
        echo "  health  - Check server health"
        echo "  cleanup - Clean up processes"
        exit 1
        ;;
esac
