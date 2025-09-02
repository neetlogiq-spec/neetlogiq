#!/bin/bash

# Smart Server Starter for Medical College Management System
# This script ensures clean startup without port conflicts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Import port manager
source "$SCRIPT_DIR/port-manager.sh"

# Configuration
MAX_RETRIES=3
RETRY_DELAY=5

# Function to log messages
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

# Function to check if server is responding
check_server_health() {
    local port=$1
    local service_name=$2
    local max_attempts=10
    local attempt=1
    
    log "🏥 Checking $service_name health on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port" >/dev/null 2>&1; then
            log "${GREEN}✅ $service_name is healthy on port $port${NC}"
            return 0
        fi
        
        log "${YELLOW}⏳ Attempt $attempt/$max_attempts: $service_name not ready yet...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log "${RED}❌ $service_name failed to start on port $port${NC}"
    return 1
}

# Function to start backend server
start_backend() {
    local port=$1
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        log "🚀 Starting Backend Server (Port $port)..."
        
        # Change to backend directory
        cd "$PROJECT_ROOT/backend"
        
        # Start backend in background
        nohup node completeServer.js > ../logs/backend.log 2>&1 &
        local backend_pid=$!
        
        # Wait a moment for server to start
        sleep 3
        
        # Check if process is still running
        if kill -0 $backend_pid 2>/dev/null; then
            # Check if port is actually listening
            if lsof -i :$port >/dev/null 2>&1; then
                log "${GREEN}✅ Backend Server started successfully (PID: $backend_pid)${NC}"
                echo $backend_pid > ../logs/backend.pid
                return 0
            else
                log "${YELLOW}⚠️  Backend process started but port not listening, retrying...${NC}"
                kill -9 $backend_pid 2>/dev/null || true
            fi
        else
            log "${YELLOW}⚠️  Backend process failed to start, retrying...${NC}"
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $MAX_RETRIES ]; then
            log "${YELLOW}🔄 Retrying in $RETRY_DELAY seconds... (Attempt $retry_count/$MAX_RETRIES)${NC}"
            sleep $RETRY_DELAY
        fi
    done
    
    log "${RED}❌ Failed to start Backend Server after $MAX_RETRIES attempts${NC}"
    return 1
}

# Function to start frontend server
start_frontend() {
    local port=$1
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        log "🚀 Starting Frontend Server (Port $port)..."
        
        # Change to frontend directory
        cd "$PROJECT_ROOT/frontend"
        
        # Start frontend in background
        nohup npm run dev > ../logs/frontend.log 2>&1 &
        local frontend_pid=$!
        
        # Wait a moment for server to start
        sleep 5
        
        # Check if process is still running
        if kill -0 $frontend_pid 2>/dev/null; then
            # Check if port is actually listening
            if lsof -i :$port >/dev/null 2>&1; then
                log "${GREEN}✅ Frontend Server started successfully (PID: $frontend_pid)${NC}"
                echo $frontend_pid > ../logs/frontend.pid
                return 0
            else
                log "${YELLOW}⚠️  Frontend process started but port not listening, retrying...${NC}"
                kill -9 $frontend_pid 2>/dev/null || true
            fi
        else
            log "${YELLOW}⚠️  Frontend process failed to start, retrying...${NC}"
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $MAX_RETRIES ]; then
            log "${YELLOW}🔄 Retrying in $RETRY_DELAY seconds... (Attempt $retry_count/$MAX_RETRIES)${NC}"
            sleep $RETRY_DELAY
        fi
    done
    
    log "${RED}❌ Failed to start Frontend Server after $MAX_RETRIES attempts${NC}"
    return 1
}

# Function to create logs directory
setup_logs() {
    mkdir -p "$PROJECT_ROOT/logs"
    touch "$PROJECT_ROOT/logs/backend.log"
    touch "$PROJECT_ROOT/logs/frontend.log"
    log "📁 Logs directory setup complete"
}

# Function to show server status
show_servers_status() {
    log "${PURPLE}📊 Server Status:${NC}"
    
    # Check backend
    if [ -f "$PROJECT_ROOT/logs/backend.pid" ]; then
        local backend_pid=$(cat "$PROJECT_ROOT/logs/backend.pid")
        if kill -0 $backend_pid 2>/dev/null; then
            log "  Backend: ${GREEN}RUNNING (PID: $backend_pid)${NC}"
        else
            log "  Backend: ${RED}STOPPED${NC}"
        fi
    else
        log "  Backend: ${RED}NOT STARTED${NC}"
    fi
    
    # Check frontend
    if [ -f "$PROJECT_ROOT/logs/frontend.pid" ]; then
        local frontend_pid=$(cat "$PROJECT_ROOT/logs/frontend.pid")
        if kill -0 $frontend_pid 2>/dev/null; then
            log "  Frontend: ${GREEN}RUNNING (PID: $frontend_pid)${NC}"
        else
            log "  Frontend: ${RED}STOPPED${NC}"
        fi
    else
        log "  Frontend: ${RED}NOT STARTED${NC}"
    fi
}

# Main execution
main() {
    log "${PURPLE}🚀 Smart Server Starter for Medical College Management System${NC}"
    log "=================================================="
    
    # Setup logs directory
    setup_logs
    
    # Clean existing processes
    log "🧹 Cleaning existing processes..."
    clean_all
    
    # Reserve ports
    log "🎯 Reserving available ports..."
    reserve_ports
    
    # Start backend first
    if start_backend $BACKEND_PORT; then
        log "${GREEN}✅ Backend started successfully${NC}"
    else
        log "${RED}❌ Failed to start backend${NC}"
        exit 1
    fi
    
    # Wait for backend to be healthy
    if check_server_health $BACKEND_PORT "Backend"; then
        log "${GREEN}✅ Backend is healthy${NC}"
    else
        log "${RED}❌ Backend health check failed${NC}"
        exit 1
    fi
    
    # Start frontend
    if start_frontend $FRONTEND_PORT; then
        log "${GREEN}✅ Frontend started successfully${NC}"
    else
        log "${RED}❌ Failed to start frontend${NC}"
        exit 1
    fi
    
    # Wait for frontend to be healthy
    if check_server_health $FRONTEND_PORT "Frontend"; then
        log "${GREEN}✅ Frontend is healthy${NC}"
    else
        log "${RED}❌ Frontend health check failed${NC}"
        exit 1
    fi
    
    # Success message
    log "${GREEN}🎉 All servers started successfully!${NC}"
    log "=================================================="
    log "${BLUE}🌐 Frontend: http://localhost:$FRONTEND_PORT${NC}"
    log "${BLUE}🔐 Admin Panel: http://localhost:$FRONTEND_PORT/sector_xp_12${NC}"
    log "${BLUE}📡 Backend API: http://localhost:$BACKEND_PORT${NC}"
    log "${BLUE}🔑 Admin Credentials: Lone_wolf#12:Apx_gp_delta${NC}"
    log "=================================================="
    
    # Show final status
    show_servers_status
    
    # Save ports to file for other scripts
    echo "FRONTEND_PORT=$FRONTEND_PORT" > "$PROJECT_ROOT/.env.ports"
    echo "BACKEND_PORT=$BACKEND_PORT" >> "$PROJECT_ROOT/.env.ports"
    
    log "${GREEN}✅ Ports saved to .env.ports file${NC}"
}

# Run main function
main "$@"
