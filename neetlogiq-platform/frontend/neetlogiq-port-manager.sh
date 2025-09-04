#!/bin/bash

# NeetLogIQ Port Manager
# This script manages ports for NeetLogIQ frontend (5000 series)
# Prevents conflicts with MedGuide (4000 series)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# NeetLogIQ default ports (5000 series)
NEETLOGIQ_FRONTEND_PORT=5001
NEETLOGIQ_BACKEND_PORT=5002
NEETLOGIQ_AI_PORT=5003

# MedGuide reserved ports (4000 series - DO NOT USE)
MEDGUIDE_FRONTEND_PORT=4000
MEDGUIDE_BACKEND_PORT=4001

echo -e "${PURPLE}🚀 NeetLogIQ Port Manager${NC}"
echo "=================================="

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 1  # Port is busy
    else
        return 0  # Port is free
    fi
}

# Function to find next available port in 5000 series
find_available_neetlogiq_port() {
    local start_port=5001
    local port=$start_port
    
    while ! check_port $port; do
        port=$((port + 1))
        if [ $port -gt 5099 ]; then
            echo "Error: No available ports found in 5000 series" >&2
            exit 1
        fi
    done
    
    echo $port
}

# Function to check MedGuide ports (should not conflict)
check_medguide_ports() {
    echo -e "${BLUE}🔍 Checking MedGuide port usage (4000 series)...${NC}"
    
    if check_port $MEDGUIDE_FRONTEND_PORT; then
        echo -e "  Frontend ($MEDGUIDE_FRONTEND_PORT): ${GREEN}FREE (MedGuide not running)${NC}"
    else
        local pid=$(lsof -ti :$MEDGUIDE_FRONTEND_PORT 2>/dev/null || echo "unknown")
        echo -e "  Frontend ($MEDGUIDE_FRONTEND_PORT): ${YELLOW}BUSY (MedGuide PID: $pid)${NC}"
    fi
    
    if check_port $MEDGUIDE_BACKEND_PORT; then
        echo -e "  Backend ($MEDGUIDE_BACKEND_PORT): ${GREEN}FREE (MedGuide not running)${NC}"
    else
        local pid=$(lsof -ti :$MEDGUIDE_BACKEND_PORT 2>/dev/null || echo "unknown")
        echo -e "  Backend ($MEDGUIDE_BACKEND_PORT): ${YELLOW}BUSY (MedGuide PID: $pid)${NC}"
    fi
}

# Function to check NeetLogIQ ports
check_neetlogiq_ports() {
    echo -e "${BLUE}🔍 Checking NeetLogIQ port usage (5000 series)...${NC}"
    
    if check_port $NEETLOGIQ_FRONTEND_PORT; then
        echo -e "  Frontend ($NEETLOGIQ_FRONTEND_PORT): ${GREEN}FREE${NC}"
    else
        local pid=$(lsof -ti :$NEETLOGIQ_FRONTEND_PORT 2>/dev/null || echo "unknown")
        echo -e "  Frontend ($NEETLOGIQ_FRONTEND_PORT): ${RED}BUSY (PID: $pid)${NC}"
    fi
    
    if check_port $NEETLOGIQ_BACKEND_PORT; then
        echo -e "  Backend ($NEETLOGIQ_BACKEND_PORT): ${GREEN}FREE${NC}"
    else
        local pid=$(lsof -ti :$NEETLOGIQ_BACKEND_PORT 2>/dev/null || echo "unknown")
        echo -e "  Backend ($NEETLOGIQ_BACKEND_PORT): ${RED}BUSY (PID: $pid)${NC}"
    fi
    
    if check_port $NEETLOGIQ_AI_PORT; then
        echo -e "  AI Service ($NEETLOGIQ_AI_PORT): ${GREEN}FREE${NC}"
    else
        local pid=$(lsof -ti :$NEETLOGIQ_AI_PORT 2>/dev/null || echo "unknown")
        echo -e "  AI Service ($NEETLOGIQ_AI_PORT): ${RED}BUSY (PID: $pid)${NC}"
    fi
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

# Function to clean NeetLogIQ processes
clean_neetlogiq() {
    echo -e "${YELLOW}🧹 Cleaning NeetLogIQ processes...${NC}"
    
    # Kill all node processes related to NeetLogIQ
    pkill -f "node.*simple-server.js" 2>/dev/null || true
    pkill -f "vite.*5001" 2>/dev/null || true
    pkill -f "serve.*5001" 2>/dev/null || true
    
    # Kill processes on our ports
    kill_port_processes $NEETLOGIQ_FRONTEND_PORT "neetlogiq"
    kill_port_processes $NEETLOGIQ_BACKEND_PORT "neetlogiq"
    kill_port_processes $NEETLOGIQ_AI_PORT "neetlogiq"
    
    # Wait for processes to fully terminate
    sleep 3
    
    echo -e "${GREEN}✅ All NeetLogIQ processes cleaned${NC}"
}

# Function to start NeetLogIQ services
start_neetlogiq() {
    echo -e "${GREEN}🚀 Starting NeetLogIQ services...${NC}"
    
    # Check if ports are available
    if ! check_port $NEETLOGIQ_FRONTEND_PORT; then
        echo -e "${YELLOW}⚠️  Port $NEETLOGIQ_FRONTEND_PORT is busy, finding alternative...${NC}"
        NEETLOGIQ_FRONTEND_PORT=$(find_available_neetlogiq_port)
        echo -e "${GREEN}✅ Found available port: $NEETLOGIQ_FRONTEND_PORT${NC}"
    fi
    
    # Start frontend server
    echo -e "${BLUE}🔧 Starting NeetLogIQ frontend on port $NEETLOGIQ_FRONTEND_PORT...${NC}"
    cd "$(dirname "$0")"
    
    # Check if build exists, if not build first
    if [ ! -d "build" ]; then
        echo -e "${YELLOW}📦 Build directory not found, building project first...${NC}"
        npm run build
    fi
    
    # Start the server
    nohup node simple-server.js > server.log 2>&1 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ NeetLogIQ frontend started (PID: $FRONTEND_PID)${NC}"
    
    # Wait for server to start
    sleep 3
    
    # Check if server is running
    if curl -s "http://localhost:$NEETLOGIQ_FRONTEND_PORT" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ NeetLogIQ frontend is running and responding${NC}"
    else
        echo -e "${YELLOW}⚠️  Server started but not responding yet, checking logs...${NC}"
        tail -5 server.log
    fi
    
    echo ""
    echo -e "${GREEN}🎉 NeetLogIQ services started successfully!${NC}"
    echo -e "${BLUE}🔗 Frontend: http://localhost:$NEETLOGIQ_FRONTEND_PORT${NC}"
    echo -e "${BLUE}📋 Process ID: $FRONTEND_PID${NC}"
    echo -e "${BLUE}📝 Logs: server.log${NC}"
    echo ""
    echo -e "${PURPLE}💡 To stop: $0 stop${NC}"
    echo -e "${PURPLE}💡 To check status: $0 status${NC}"
    
    # Save PID to file for easy management
    echo "$FRONTEND_PID" > .neetlogiq-pid
}

# Function to stop NeetLogIQ services
stop_neetlogiq() {
    echo -e "${YELLOW}🛑 Stopping NeetLogIQ services...${NC}"
    
    if [ -f .neetlogiq-pid ]; then
        local pid=$(cat .neetlogiq-pid)
        echo -e "${BLUE}📋 Stopping process: $pid${NC}"
        kill -9 $pid 2>/dev/null || true
        rm -f .neetlogiq-pid
    fi
    
    # Also kill any processes on our ports
    kill_port_processes $NEETLOGIQ_FRONTEND_PORT "neetlogiq"
    kill_port_processes $NEETLOGIQ_BACKEND_PORT "neetlogiq"
    kill_port_processes $NEETLOGIQ_AI_PORT "neetlogiq"
    
    echo -e "${GREEN}✅ All NeetLogIQ services stopped${NC}"
}

# Function to show comprehensive status
show_status() {
    echo -e "${BLUE}📊 NeetLogIQ Port Status:${NC}"
    echo "================================"
    
    check_medguide_ports
    echo ""
    check_neetlogiq_ports
    echo ""
    
    # Show running processes
    echo -e "${BLUE}🔄 Running NeetLogIQ Processes:${NC}"
    if [ -f .neetlogiq-pid ]; then
        local pid=$(cat .neetlogiq-pid)
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "  ✅ NeetLogIQ Frontend: PID $pid (Port $NEETLOGIQ_FRONTEND_PORT)"
        else
            echo -e "  ❌ Process file exists but process not running"
            rm -f .neetlogiq-pid
        fi
    else
        echo -e "  ❌ No NeetLogIQ processes found"
    fi
}

# Function to find all available ports
find_all_available() {
    echo -e "${BLUE}🔍 Finding all available ports...${NC}"
    echo ""
    
    echo -e "${YELLOW}📋 MedGuide Reserved Ports (4000 series):${NC}"
    for port in {4000..4010}; do
        if check_port $port; then
            echo -e "  $port: ${GREEN}FREE${NC}"
        else
            local pid=$(lsof -ti :$port 2>/dev/null || echo "unknown")
            echo -e "  $port: ${RED}BUSY (PID: $pid)${NC}"
        fi
    done
    
    echo ""
    echo -e "${YELLOW}📋 NeetLogIQ Available Ports (5000 series):${NC}"
    for port in {5001..5010}; do
        if check_port $port; then
            echo -e "  $port: ${GREEN}FREE${NC}"
        else
            local pid=$(lsof -ti :$port 2>/dev/null || echo "unknown")
            echo -e "  $port: ${RED}BUSY (PID: $pid)${NC}"
        fi
    done
}

# Main execution
case "${1:-}" in
    "start")
        start_neetlogiq
        ;;
    "stop")
        stop_neetlogiq
        ;;
    "restart")
        stop_neetlogiq
        sleep 2
        start_neetlogiq
        ;;
    "status")
        show_status
        ;;
    "check")
        find_all_available
        ;;
    "clean")
        clean_neetlogiq
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
        echo -e "${PURPLE}🚀 NeetLogIQ Port Manager${NC}"
        echo "Usage: $0 {start|stop|restart|status|check|clean|kill <port>}"
        echo ""
        echo "Commands:"
        echo -e "  start   - Start NeetLogIQ services with port management"
        echo -e "  stop    - Stop NeetLogIQ services"
        echo -e "  restart - Restart NeetLogIQ services"
        echo -e "  status  - Show current port and service status"
        echo -e "  check   - Check all available ports (4000 & 5000 series)"
        echo -e "  clean   - Clean all NeetLogIQ processes"
        echo -e "  kill    - Force kill processes on specific port"
        echo ""
        echo -e "${YELLOW}📋 Port Allocation:${NC}"
        echo -e "  MedGuide: 4000 series (reserved)"
        echo -e "  NeetLogIQ: 5000 series (active)"
        echo ""
        show_status
        ;;
esac
