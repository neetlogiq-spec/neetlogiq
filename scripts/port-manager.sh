#!/bin/bash

# Smart Port Manager for Medical College Management System
# This script automatically finds available ports and manages server conflicts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default ports
DEFAULT_FRONTEND_PORT=4000
DEFAULT_BACKEND_PORT=4001

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 1  # Port is busy
    else
        return 0  # Port is free
    fi
}

# Function to find next available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    
    while check_port $port; do
        port=$((port + 1))
        if [ $port -gt 65535 ]; then
            echo "Error: No available ports found starting from $start_port" >&2
            exit 1
        fi
    done
    
    echo $port
}

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    local process_name=$2
    
    echo -e "${YELLOW}🔪 Killing processes on port $port...${NC}"
    
    # Kill by port
    if lsof -ti :$port >/dev/null 2>&1; then
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Kill by process name
    if pgrep -f "$process_name" >/dev/null; then
        pkill -f "$process_name" 2>/dev/null || true
        sleep 2
    fi
    
    echo -e "${GREEN}✅ Port $port cleared${NC}"
}

# Function to check and reserve ports
reserve_ports() {
    local frontend_port=$DEFAULT_FRONTEND_PORT
    local backend_port=$DEFAULT_BACKEND_PORT
    
    echo -e "${BLUE}🔍 Checking port availability...${NC}"
    
    # Check frontend port
    if check_port $frontend_port; then
        echo -e "${GREEN}✅ Frontend port $frontend_port is available${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend port $frontend_port is busy, finding alternative...${NC}"
        frontend_port=$(find_available_port $((frontend_port + 1)))
        echo -e "${GREEN}✅ Found available frontend port: $frontend_port${NC}"
    fi
    
    # Check backend port
    if check_port $backend_port; then
        echo -e "${GREEN}✅ Backend port $backend_port is available${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend port $backend_port is busy, finding alternative...${NC}"
        backend_port=$(find_available_port $((backend_port + 1)))
        echo -e "${GREEN}✅ Found available backend port: $backend_port${NC}"
    fi
    
    # Export ports for other scripts
    export FRONTEND_PORT=$frontend_port
    export BACKEND_PORT=$backend_port
    
    echo -e "${GREEN}🎯 Reserved ports: Frontend=$frontend_port, Backend=$backend_port${NC}"
}

# Function to clean all related processes
clean_all() {
    echo -e "${YELLOW}🧹 Cleaning all related processes...${NC}"
    
    # Kill all node processes related to our servers
    pkill -f "node.*completeServer.js" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    pkill -f "nodemon" 2>/dev/null || true
    
    # Kill processes on our default ports
    kill_port_processes $DEFAULT_FRONTEND_PORT "vite"
    kill_port_processes $DEFAULT_BACKEND_PORT "node"
    
    # Wait for processes to fully terminate
    sleep 3
    
    echo -e "${GREEN}✅ All processes cleaned${NC}"
}

# Function to show current port status
show_status() {
    echo -e "${BLUE}📊 Current Port Status:${NC}"
    
    if check_port $DEFAULT_FRONTEND_PORT; then
        echo -e "  Frontend ($DEFAULT_FRONTEND_PORT): ${GREEN}FREE${NC}"
    else
        local pid=$(lsof -ti :$DEFAULT_FRONTEND_PORT 2>/dev/null || echo "unknown")
        echo -e "  Frontend ($DEFAULT_FRONTEND_PORT): ${RED}BUSY (PID: $pid)${NC}"
    fi
    
    if check_port $DEFAULT_BACKEND_PORT; then
        echo -e "  Backend ($DEFAULT_BACKEND_PORT): ${GREEN}FREE${NC}"
    else
        local pid=$(lsof -ti :$DEFAULT_BACKEND_PORT 2>/dev/null || echo "unknown")
        echo -e "  Backend ($DEFAULT_BACKEND_PORT): ${RED}BUSY (PID: $pid)${NC}"
    fi
}

# Main execution
case "${1:-}" in
    "check")
        show_status
        ;;
    "clean")
        clean_all
        ;;
    "reserve")
        reserve_ports
        ;;
    "kill")
        if [ -n "$2" ]; then
            kill_port_processes $2 "all"
        else
            echo "Usage: $0 kill <port>"
            exit 1
        fi
        ;;
    *)
        echo -e "${BLUE}Smart Port Manager${NC}"
        echo "Usage: $0 {check|clean|reserve|kill <port>}"
        echo ""
        echo "Commands:"
        echo "  check   - Show current port status"
        echo "  clean   - Clean all related processes"
        echo "  reserve - Reserve available ports"
        echo "  kill    - Kill processes on specific port"
        echo ""
        show_status
        ;;
esac
