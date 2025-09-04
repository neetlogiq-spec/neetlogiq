#!/bin/bash

# NEET Logiq Platform - Cloudflare Local Development Script
# This script starts the platform using Cloudflare Workers and D1 locally

echo "🚀 Starting NEET Logiq Platform with Cloudflare Workers & D1..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI is not installed. Installing..."
    npm install -g wrangler
fi

echo "✅ Wrangler version: $(wrangler --version)"

# Check if logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  Not logged in to Cloudflare. Please login:"
    echo "   wrangler login"
    echo "   Then run this script again."
    exit 1
fi

echo "✅ Logged in to Cloudflare"

# Navigate to worker directory
cd cloudflare/worker

# Kill any existing processes on ports 8787 and 3000
echo "🧹 Cleaning up existing processes..."
lsof -ti:8787 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Cloudflare Worker dependencies..."
    npm install
fi

# Start the Cloudflare Worker locally with D1
echo "🎯 Starting Cloudflare Worker with D1 database..."
echo "   Worker: http://localhost:8787"
echo "   Frontend: http://localhost:3000"
echo "   D1 Database: Local simulation"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start the worker in development mode
wrangler dev --port 8787 --env development
