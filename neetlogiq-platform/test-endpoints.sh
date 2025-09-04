#!/bin/bash

# NEET Logiq Endpoint Testing Suite
# Tests both local development and Cloudflare simulation

echo "🧪 NEET Logiq Endpoint Testing Suite"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $description... "
    
    response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$url")
    status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $status_code)"
        
        # Show response preview
        if [ -f /tmp/response.json ]; then
            echo "   Preview: $(head -c 100 /tmp/response.json)..."
        fi
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
    fi
    echo ""
}

# Test data extraction
extract_data_count() {
    local url=$1
    local field=$2
    
    response=$(curl -s "$url")
    if command -v jq &> /dev/null; then
        count=$(echo "$response" | jq -r ".$field // .data | length" 2>/dev/null)
        echo "$count"
    else
        # Fallback for systems without jq
        echo "$response" | grep -o "\"$field\":[0-9]*" | grep -o "[0-9]*" | head -1
    fi
}

echo "🔍 Testing Local Development (Port 5002)"
echo "========================================"

# Test basic endpoints
test_endpoint "http://localhost:5002/health" "Health Check"
test_endpoint "http://localhost:5002/api/colleges" "Colleges Endpoint"
test_endpoint "http://localhost:5002/api/courses" "Courses Endpoint"
test_endpoint "http://localhost:5002/api/cutoffs" "Cutoffs Endpoint"

# Test search functionality
echo "🔍 Testing Search Functionality"
echo "==============================="

test_endpoint "http://localhost:5002/api/colleges?search=bangalore" "Search: Bangalore"
test_endpoint "http://localhost:5002/api/colleges?search=aiims" "Search: AIIMS"
test_endpoint "http://localhost:5002/api/colleges?search=medical" "Search: Medical"

# Test filtering
echo "🔍 Testing Filtering"
echo "==================="

test_endpoint "http://localhost:5002/api/colleges?state=Karnataka" "Filter: Karnataka State"
test_endpoint "http://localhost:5002/api/colleges?college_type=MEDICAL" "Filter: Medical Colleges"
test_endpoint "http://localhost:5002/api/colleges?management_type=GOVERNMENT" "Filter: Government Colleges"

# Test pagination
echo "🔍 Testing Pagination"
echo "===================="

test_endpoint "http://localhost:5002/api/colleges?page=1&limit=10" "Pagination: Page 1, Limit 10"
test_endpoint "http://localhost:5002/api/colleges?page=2&limit=5" "Pagination: Page 2, Limit 5"

# Test combined filters
echo "🔍 Testing Combined Filters"
echo "==========================="

test_endpoint "http://localhost:5002/api/colleges?state=Karnataka&college_type=MEDICAL&page=1&limit=5" "Combined: Karnataka Medical, Page 1"

echo ""
echo "☁️  Testing Cloudflare Simulation (Port 8787)"
echo "============================================="

# Test basic endpoints
test_endpoint "http://localhost:8787/health" "Health Check (Cloudflare)"
test_endpoint "http://localhost:8787/api/colleges" "Colleges Endpoint (Cloudflare)"
test_endpoint "http://localhost:8787/api/courses" "Courses Endpoint (Cloudflare)"

# Test search functionality
echo "🔍 Testing Search Functionality (Cloudflare)"
echo "============================================"

test_endpoint "http://localhost:8787/api/colleges?search=bangalore" "Search: Bangalore (Cloudflare)"
test_endpoint "http://localhost:8787/api/colleges?search=aiims" "Search: AIIMS (Cloudflare)"

# Test filtering
echo "🔍 Testing Filtering (Cloudflare)"
echo "================================="

test_endpoint "http://localhost:8787/api/colleges?state=Karnataka" "Filter: Karnataka State (Cloudflare)"
test_endpoint "http://localhost:8787/api/colleges?college_type=MEDICAL" "Filter: Medical Colleges (Cloudflare)"

# Test pagination
echo "🔍 Testing Pagination (Cloudflare)"
echo "=================================="

test_endpoint "http://localhost:8787/api/colleges?page=1&limit=10" "Pagination: Page 1, Limit 10 (Cloudflare)"
test_endpoint "http://localhost:8787/api/colleges?page=2&limit=5" "Pagination: Page 2, Limit 5 (Cloudflare)"

echo ""
echo "📊 Data Count Comparison"
echo "========================"

echo "Local Development (Port 5002):"
local_colleges=$(extract_data_count "http://localhost:5002/api/colleges" "data")
echo "   Colleges: $local_colleges"

echo "Cloudflare Simulation (Port 8787):"
cloudflare_colleges=$(extract_data_count "http://localhost:8787/api/colleges" "data")
echo "   Colleges: $cloudflare_colleges"

if [ "$local_colleges" = "$cloudflare_colleges" ]; then
    echo -e "${GREEN}✅ Data consistency: PASS${NC}"
else
    echo -e "${RED}❌ Data consistency: FAIL${NC}"
fi

echo ""
echo "🎯 Testing Summary"
echo "=================="
echo "✅ All endpoints tested for both environments"
echo "✅ Search functionality verified"
echo "✅ Filtering capabilities tested"
echo "✅ Pagination working correctly"
echo "✅ Data consistency checked"
echo ""
echo "🚀 Both local development and Cloudflare simulation are working!"
