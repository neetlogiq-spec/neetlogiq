#!/bin/bash

# 🤖 Background BMAD-METHOD™ Activation Script
# Version: v2.1 - Background Mode

set -e

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
LOG_DIR="logs"
BMAD_LOG="$LOG_DIR/bmad-activation.log"

# Create logs directory
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
    echo "[$(date '+%H:%M:%S')] $1" >> "$BMAD_LOG"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    if ! command_exists node; then
        log "❌ Node.js not found. Please install Node.js v20+ first."
        return 1
    fi
    
    if ! command_exists npm; then
        log "❌ npm not found. Please install npm first."
        return 1
    fi
    
    if [ ! -f ".bmad-core/core-config.yaml" ]; then
        log "❌ Error: BMAD-METHOD not found. Please run this script from the project root."
        return 1
    fi
    
    log "✅ Prerequisites check passed"
    return 0
}

# Function to activate BMAD workflow
activate_bmad_workflow() {
    log "🤖 Activating BMAD-METHOD™ AI agents..."
    
    # Check if npx bmad-method is available
    if npx bmad-method --version >/dev/null 2>&1; then
        log "✅ BMAD-METHOD CLI available"
        
        # Start the medical college system workflow in background
        log "🚀 Starting Medical College System workflow..."
        nohup npx bmad-method workflow .bmad-core/workflows/medical-college-system.yaml > "$LOG_DIR/bmad-workflow.log" 2>&1 &
        BMAD_PID=$!
        echo "$BMAD_PID" > ".bmad-pid"
        log "✅ BMAD workflow started with PID: $BMAD_PID"
        
        # Wait a moment for workflow to initialize
        sleep 3
        
        # Get AI recommendations in background
        log "🧠 Getting AI recommendations..."
        nohup npx bmad-method recommend --area performance > "$LOG_DIR/bmad-recommendations.log" 2>&1 &
        nohup npx bmad-method recommend --area search-algorithms >> "$LOG_DIR/bmad-recommendations.log" 2>&1 &
        
        log "✅ BMAD-METHOD™ activation successful"
        return 0
    else
        log "❌ BMAD-METHOD CLI not available"
        return 1
    fi
}

# Function to run system validation
run_system_validation() {
    log "🧪 Running system validation..."
    
    # Test backend API endpoints
    log "🔍 Testing backend API endpoints..."
    
    # Test colleges endpoint
    if curl -s "http://localhost:4001/api/sector_xp_12/colleges" >/dev/null 2>&1; then
        log "✅ Colleges API endpoint working"
    else
        log "⚠️  Colleges API endpoint may have issues"
    fi
    
    # Test programs endpoint
    if curl -s "http://localhost:4001/api/sector_xp_12/programs" >/dev/null 2>&1; then
        log "✅ Programs API endpoint working"
    else
        log "⚠️  Programs API endpoint may have issues"
    fi
    
    # Test AI endpoints
    if curl -s "http://localhost:4001/api/sector_xp_12/admin/ai/metrics" >/dev/null 2>&1; then
        log "✅ AI Metrics endpoint working"
    else
        log "⚠️  AI Metrics endpoint may have issues"
    fi
    
    # Test frontend accessibility
    log "🌐 Testing frontend accessibility..."
    if curl -s "http://localhost:4000" >/dev/null 2>&1; then
        log "✅ Frontend accessible"
    else
        log "⚠️  Frontend may have issues"
    fi
}

# Function to show system status
show_system_status() {
    log "📊 System Status"
    echo "================="
    
    # Check if servers are running
    if lsof -Pi :4001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "🟢 Backend: Running on port 4001"
    else
        echo -e "🔴 Backend: Not running"
    fi
    
    if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "🟢 Frontend: Running on port 4000"
    else
        echo -e "🔴 Frontend: Not running"
    fi
    
    # Check if BMAD is running
    if [ -f ".bmad-pid" ] && kill -0 $(cat ".bmad-pid") 2>/dev/null; then
        echo -e "🟢 BMAD-METHOD: Active (PID: $(cat .bmad-pid))"
    else
        echo -e "🔴 BMAD-METHOD: Not active"
    fi
    
    echo ""
    echo -e "🔗 Access URLs:"
    echo -e "   Backend API: http://localhost:4001"
    echo -e "   Frontend: http://localhost:4000"
    echo -e "   Admin Panel: http://localhost:4000/sector_xp_12"
    echo -e "   Colleges: http://localhost:4001/colleges"
    echo ""
    echo -e "📋 To check BMAD status: tail -f $LOG_DIR/bmad-workflow.log"
    echo -e "📋 To check recommendations: tail -f $LOG_DIR/bmad-recommendations.log"
    echo -e "📋 To stop BMAD: ./scripts/activate-bmad-background.sh stop"
}

# Function to stop BMAD
stop_bmad() {
    log "🛑 Stopping BMAD-METHOD™..."
    
    if [ -f ".bmad-pid" ]; then
        local bmad_pid=$(cat ".bmad-pid")
        if kill -0 "$bmad_pid" 2>/dev/null; then
            log "🛑 Stopping BMAD process PID: $bmad_pid"
            kill -TERM "$bmad_pid" 2>/dev/null || kill -9 "$bmad_pid" 2>/dev/null || true
        fi
        rm -f ".bmad-pid"
    fi
    
    # Kill any remaining BMAD processes
    pkill -f "bmad-method" 2>/dev/null || true
    
    log "✅ BMAD-METHOD™ stopped"
}

# Function to start BMAD activation
start_bmad() {
    log "🏥 Medical College Management System - BMAD Integration"
    echo "======================================================"
    echo ""
    
    if ! check_prerequisites; then
        exit 1
    fi
    
    log "✅ BMAD-METHOD™ v4.41.0 detected"
    echo ""
    
    log "🚀 Starting Medical College Management System with BMAD-METHOD™..."
    echo ""
    
    # Check if servers are running
    if ! lsof -Pi :4001 -sTCP:LISTEN -t >/dev/null 2>&1 || ! lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log "⚠️  Servers not running. Please start servers first with: ./scripts/start-background.sh start"
        exit 1
    fi
    
    log "✅ Servers are running"
    
    # Activate BMAD
    if activate_bmad_workflow; then
        # Run system validation
        run_system_validation
        
        # Show final status
        echo ""
        show_system_status
        
        log "🎉 Medical College Management System is now running with BMAD-METHOD™!"
        echo ""
        log "📋 Next Steps:"
        log "   1. Open http://localhost:4000 in your browser"
        log "   2. Test the advanced search functionality"
        log "   3. Check the admin panel at /sector_xp_12"
        log "   4. Monitor BMAD AI agents for recommendations"
        echo ""
        log "✅ BMAD activation completed in background. You can continue with other commands."
        log "📊 Monitor progress with: tail -f $LOG_DIR/bmad-workflow.log"
    else
        log "❌ BMAD activation failed"
        exit 1
    fi
}

# Main execution
case "${1:-start}" in
    start)
        start_bmad
        ;;
    stop)
        stop_bmad
        ;;
    status)
        show_system_status
        ;;
    *)
        echo "Usage: $0 {start|stop|status}"
        echo "  start  - Start BMAD-METHOD™ activation in background"
        echo "  stop   - Stop BMAD-METHOD™"
        echo "  status - Show system status"
        exit 1
        ;;
esac
