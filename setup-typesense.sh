#!/bin/bash

# Typesense Setup Script for NeetLogIQ
echo "🚀 Setting up Typesense for NeetLogIQ..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start Typesense container
echo "📦 Starting Typesense container..."
docker-compose -f docker-compose.typesense.yml up -d

# Wait for Typesense to be ready
echo "⏳ Waiting for Typesense to be ready..."
sleep 10

# Check if Typesense is healthy
echo "🔍 Checking Typesense health..."
for i in {1..30}; do
    if curl -s http://localhost:8108/health > /dev/null; then
        echo "✅ Typesense is ready!"
        break
    fi
    echo "⏳ Waiting for Typesense... (attempt $i/30)"
    sleep 2
done

# Test Typesense connection
echo "🧪 Testing Typesense connection..."
if curl -s http://localhost:8108/health | grep -q "ok"; then
    echo "✅ Typesense is healthy and ready to use!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Start your backend: cd cloudflare-workers && npx wrangler dev"
    echo "2. Index your data: curl -X POST http://localhost:8787/api/typesense/index/colleges"
    echo "3. Index courses: curl -X POST http://localhost:8787/api/typesense/index/courses"
    echo "4. Test search: curl 'http://localhost:8787/api/typesense/search/colleges?q=medical'"
    echo ""
    echo "🌐 Typesense is running on: http://localhost:8108"
    echo "🔑 API Key: xyz"
else
    echo "❌ Typesense failed to start properly. Check the logs:"
    echo "docker-compose -f docker-compose.typesense.yml logs"
fi
