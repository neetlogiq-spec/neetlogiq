#!/bin/bash

# NEET Logiq Frontend Startup Script
# This script navigates to the frontend directory and starts the React development server

echo "🚀 Starting NEET Logiq Frontend..."
echo "📁 Navigating to neetlogiq-frontend directory..."

# Navigate to the neetlogiq-frontend directory
cd "$(dirname "$0")/neetlogiq-frontend"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the correct directory?"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "✅ Found package.json in $(pwd)"
echo "🔧 Starting React development server on port 3000..."

# Start the React development server
npm start

echo "🛑 Frontend stopped."
