#!/bin/bash

echo "🏥 Medical College Management System - Health Check"
echo "=================================================="

# Check Backend Health
echo "🔍 Checking Backend (Port 4001)..."
if curl -s http://localhost:4001/api/health >/dev/null 2>&1; then
    echo "✅ Backend: HEALTHY - Running on port 4001"
    
    # Test API endpoints
    echo "  📡 Testing API endpoints..."
    if curl -s -u "Lone_wolf#12:Apx_gp_delta" "http://localhost:4001/api/sector_xp_12" >/dev/null 2>&1; then
        echo "    ✅ Authentication API: WORKING"
    else
        echo "    ❌ Authentication API: FAILED"
    fi
    
    if curl -s -u "Lone_wolf#12:Apx_gp_delta" "http://localhost:4001/api/sector_xp_12/colleges?limit=1" >/dev/null 2>&1; then
        echo "    ✅ Colleges API: WORKING"
    else
        echo "    ❌ Colleges API: FAILED"
    fi
else
    echo "❌ Backend: NOT RUNNING"
fi

echo ""

# Check Frontend Health
echo "🔍 Checking Frontend (Port 4000)..."
if curl -s http://localhost:4000 >/dev/null 2>&1; then
    echo "✅ Frontend: HEALTHY - Running on port 4000"
    
    # Test admin panel
    if curl -s http://localhost:4000/sector_xp_12 >/dev/null 2>&1; then
        echo "    ✅ Admin Panel: ACCESSIBLE"
    else
        echo "    ❌ Admin Panel: NOT ACCESSIBLE"
    fi
else
    echo "❌ Frontend: NOT RUNNING"
fi

echo ""

# Check Database Files
echo "🔍 Checking Database Files..."
if [ -f "backend/database/clean-unified.db" ]; then
    echo "✅ Main Database: clean-unified.db exists"
else
    echo "❌ Main Database: clean-unified.db missing"
fi

if [ -f "backend/database/staging_cutoffs.db" ]; then
    echo "✅ Staging Database: staging_cutoffs.db exists"
else
    echo "❌ Staging Database: staging_cutoffs.db missing"
fi

if [ -f "backend/database/error_corrections.db" ]; then
    echo "✅ Error Database: error_corrections.db exists"
else
    echo "❌ Error Database: error_corrections.db missing"
fi

echo ""

# Check Port Usage
echo "🔍 Checking Port Usage..."
if lsof -i :4000 >/dev/null 2>&1; then
    echo "✅ Port 4000: IN USE (Frontend)"
else
    echo "❌ Port 4000: FREE"
fi

if lsof -i :4001 >/dev/null 2>&1; then
    echo "✅ Port 4001: IN USE (Backend)"
else
    echo "❌ Port 4001: FREE"
fi

echo ""
echo "🏁 Health Check Complete!"
echo "========================="
echo "💡 Use './start-servers.sh' to start the system"
echo "💡 Use './stop-servers.sh' to stop the system"
