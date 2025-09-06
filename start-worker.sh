#!/bin/bash

# NEET Logiq Worker Startup Script
# This script navigates to the correct directory and starts the Cloudflare Worker

echo "🚀 Starting NEET Logiq Cloudflare Worker..."
echo "📁 Navigating to cloudflare-workers directory..."

# Navigate to the cloudflare-workers directory
cd "$(dirname "$0")/cloudflare-workers"

# Check if we're in the right directory
if [ ! -f "wrangler.toml" ]; then
    echo "❌ Error: wrangler.toml not found. Are you in the correct directory?"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "✅ Found wrangler.toml in $(pwd)"
echo "🔧 Starting worker on port 8787..."

# Start the worker
npx wrangler dev --port 8787

echo "🛑 Worker stopped."
