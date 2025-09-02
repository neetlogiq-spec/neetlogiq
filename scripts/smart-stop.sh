#!/bin/bash

# Smart Server Stopper for Medical College Management System
# This script ensures clean shutdown of all servers

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

# Function to log messages
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

# Function to stop server by PID file
stop_server_by_pid() {
    local pid_file=$1
    local server_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        log "🛑 Stopping $server_name (PID: $pid)..."
        
        if kill -0 $pid 2>/dev/null; then
            # Try graceful shutdown first
            kill $pid
            sleep 3
            
            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                log "${YELLOW}⚠️  Force killing $server_name...${NC}"
                kill -9 $pid 2>/dev/null || true
                sleep 1
            fi
            
            log "${GREEN}✅ $server_name stopped${NC}"
        else
            log "${YELLOW}⚠️  $server_name process not running${NC}"
        fi
        
        # Remove PID file
        rm -f "$pid_file"
    else
        log "${YELLOW}⚠️  No PID file found for $server_name${NC}"
    fi
}

# Function to stop all servers
stop_all_servers() {
    log "${PURPLE}🛑 Stopping All Servers...${NC}"
    log "=================================================="
    
    # Stop backend
    stop_server_by_pid "$PROJECT_ROOT/logs/backend.pid" "Backend Server"
    
    # Stop frontend
    stop_server_by_pid "$PROJECT_ROOT/logs/frontend.pid" "Frontend Server"
    
    # Clean all processes
    log "🧹 Cleaning all related processes..."
    clean_all
    
    # Remove port files
    rm -f "$PROJECT_ROOT/.env.ports"
    
    log "${GREEN}✅ All servers stopped and cleaned${NC}"
}

# Function to stop specific server
stop_specific_server() {
    local server_type=$1
    
    case $server_type in
        "backend"|"Backend"|"BACKEND")
            stop_server_by_pid "$PROJECT_ROOT/logs/backend.pid" "Backend Server"
            ;;
        "frontend"|"Frontend"|"FRONTEND")
            stop_server_by_pid "$PROJECT_ROOT/logs/frontend.pid" "Frontend Server"
            ;;
        *)
            log "${RED}❌ Invalid server type: $server_type${NC}"
            log "Valid options: backend, frontend"
            exit 1
            ;;
    esac
}

# Function to show running servers
show_running_servers() {
    log "${PURPLE}📊 Running Servers:${NC}"
    
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

# Function to restart servers
restart_servers() {
    log "${PURPLE}🔄 Restarting All Servers...${NC}"
    log "=================================================="
    
    # Stop all servers
    stop_all_servers
    
    # Wait a moment
    sleep 2
    
    # Start all servers
    log "🚀 Starting servers..."
    "$SCRIPT_DIR/smart-start.sh"
}

# Main execution
case "${1:-}" in
    "all"|"stop")
        stop_all_servers
        ;;
    "backend")
        stop_specific_server "backend"
        ;;
    "frontend")
        stop_specific_server "frontend"
        ;;
    "restart")
        restart_servers
        ;;
    "status")
        show_running_servers
        ;;
    *)
        log "${PURPLE}🛑 Smart Server Stopper${NC}"
        echo "Usage: $0 {all|stop|backend|frontend|restart|status}"
        echo ""
        echo "Commands:"
        echo "  all      - Stop all servers"
        echo "  stop     - Stop all servers (alias for all)"
        echo "  backend  - Stop only backend server"
        echo "  frontend - Stop only frontend server"
        echo "  restart  - Restart all servers"
        echo "  status   - Show running servers status"
        echo ""
        show_running_servers
        ;;
esac
