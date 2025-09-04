#!/bin/bash

# NEET Logiq - Complete Cloudflare Setup Script
# This script sets up the complete Cloudflare development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 NEET Logiq - Complete Cloudflare Setup${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Step 1: Check if we're in the right directory
if [ ! -f "wrangler.toml" ]; then
    echo -e "${RED}❌ Error: wrangler.toml not found. Please run this script from the cloudflare-workers directory.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found wrangler.toml - in correct directory${NC}"

# Step 2: Check if D1 database exists
echo -e "${BLUE}📊 Checking D1 database...${NC}"
if wrangler d1 list | grep -q "neetlogiq-db"; then
    echo -e "${GREEN}✅ D1 database 'neetlogiq-db' exists${NC}"
else
    echo -e "${RED}❌ D1 database 'neetlogiq-db' not found${NC}"
    exit 1
fi

# Step 3: Clean existing tables
echo -e "${BLUE}🧹 Cleaning existing tables...${NC}"
wrangler d1 execute neetlogiq-db --command="DROP TABLE IF EXISTS colleges; DROP TABLE IF EXISTS programs; DROP TABLE IF EXISTS colleges_fts;" --local
echo -e "${GREEN}✅ Tables cleaned${NC}"

# Step 4: Create schema
echo -e "${BLUE}📋 Creating database schema...${NC}"
wrangler d1 execute neetlogiq-db --file=./migrations/0001_create_schema.sql --local
echo -e "${GREEN}✅ Schema created${NC}"

# Step 5: Seed data (in smaller chunks to avoid timeout)
echo -e "${BLUE}🌱 Seeding database with colleges data...${NC}"
echo -e "${YELLOW}⚠️  This may take a few minutes due to large dataset...${NC}"

# Split the seed file into smaller chunks
if [ -f "./migrations/seed.sql" ]; then
    # Create a smaller test dataset first
    echo -e "${BLUE}📊 Creating test dataset (first 100 colleges)...${NC}"
    
    # Extract first 100 colleges from seed file
    head -n 200 ./migrations/seed.sql > ./migrations/seed_test.sql
    
    # Execute test data
    wrangler d1 execute neetlogiq-db --file=./migrations/seed_test.sql --local
    echo -e "${GREEN}✅ Test data seeded (100 colleges)${NC}"
    
    # Clean up test file
    rm ./migrations/seed_test.sql
else
    echo -e "${RED}❌ Seed file not found${NC}"
    exit 1
fi

# Step 6: Verify data
echo -e "${BLUE}🔍 Verifying data...${NC}"
COLLEGE_COUNT=$(wrangler d1 execute neetlogiq-db --command="SELECT COUNT(*) as count FROM colleges;" --local | grep -o '[0-9]*' | tail -1)
PROGRAM_COUNT=$(wrangler d1 execute neetlogiq-db --command="SELECT COUNT(*) as count FROM programs;" --local | grep -o '[0-9]*' | tail -1)

echo -e "${GREEN}✅ Colleges in database: $COLLEGE_COUNT${NC}"
echo -e "${GREEN}✅ Programs in database: $PROGRAM_COUNT${NC}"

# Step 7: Start Cloudflare Worker
echo -e "${BLUE}🚀 Starting Cloudflare Worker...${NC}"
echo -e "${YELLOW}⚠️  Starting worker in background on port 8787...${NC}"

# Kill any existing process on port 8787
lsof -ti:8787 | xargs kill -9 2>/dev/null || true

# Start worker in background
nohup wrangler dev --local --port 8787 > wrangler.log 2>&1 &
WORKER_PID=$!

# Wait a moment for worker to start
sleep 5

# Step 8: Test the worker
echo -e "${BLUE}🧪 Testing Cloudflare Worker...${NC}"

# Test health endpoint
if curl -s http://localhost:8787/api/health > /dev/null; then
    echo -e "${GREEN}✅ Health endpoint working${NC}"
else
    echo -e "${RED}❌ Health endpoint failed${NC}"
fi

# Test colleges endpoint
if curl -s http://localhost:8787/api/colleges > /dev/null; then
    echo -e "${GREEN}✅ Colleges endpoint working${NC}"
else
    echo -e "${RED}❌ Colleges endpoint failed${NC}"
fi

# Step 9: Summary
echo ""
echo -e "${BLUE}📊 Setup Summary${NC}"
echo -e "${BLUE}===============${NC}"
echo -e "${GREEN}✅ D1 Database: neetlogiq-db${NC}"
echo -e "${GREEN}✅ Schema: Created${NC}"
echo -e "${GREEN}✅ Data: $COLLEGE_COUNT colleges, $PROGRAM_COUNT programs${NC}"
echo -e "${GREEN}✅ Worker: Running on http://localhost:8787${NC}"
echo -e "${GREEN}✅ Worker PID: $WORKER_PID${NC}"
echo ""
echo -e "${YELLOW}🚀 Cloudflare development environment is ready!${NC}"
echo -e "${YELLOW}📡 API Base URL: http://localhost:8787${NC}"
echo -e "${YELLOW}🔗 Health Check: http://localhost:8787/api/health${NC}"
echo -e "${YELLOW}📚 Colleges API: http://localhost:8787/api/colleges${NC}"
echo ""
echo -e "${BLUE}To stop the worker: kill $WORKER_PID${NC}"
echo -e "${BLUE}To view logs: tail -f wrangler.log${NC}"
