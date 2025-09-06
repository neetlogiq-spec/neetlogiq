#!/bin/bash

# NeetLogIQ Cloudflare Workers Deployment Script
echo "☁️ Deploying NeetLogIQ Backend to Cloudflare Workers..."

# Check if wrangler is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not installed. Please install Node.js first."
    exit 1
fi

# Navigate to cloudflare-workers directory
cd cloudflare-workers

# Check if wrangler.toml exists
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found. Please check your Cloudflare Workers configuration."
    exit 1
fi

# Check if user is logged in to Cloudflare
echo "🔐 Checking Cloudflare authentication..."
if ! npx wrangler whoami &> /dev/null; then
    echo "🔑 Please log in to Cloudflare first:"
    npx wrangler login
fi

# Deploy to Cloudflare Workers
echo "🚀 Deploying to Cloudflare Workers..."
npx wrangler deploy

if [ $? -eq 0 ]; then
    echo "✅ Successfully deployed to Cloudflare Workers!"
    echo ""
    echo "📋 Deployment Details:"
    echo "• Worker URL: https://neetlogiq-backend.your-domain.workers.dev"
    echo "• D1 Database: neetlogiq-db"
    echo "• Vectorize Index: neetlogiq-index"
    echo "• AI Binding: Enabled"
    echo ""
    echo "🔗 Test your deployment:"
    echo "curl https://neetlogiq-backend.your-domain.workers.dev/api/colleges"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update frontend API URL to production endpoint"
    echo "2. Deploy frontend to Vercel/Netlify"
    echo "3. Update CORS settings if needed"
    echo "4. Run health checks"
else
    echo "❌ Failed to deploy to Cloudflare Workers"
    echo "Please check your configuration and try again."
    exit 1
fi

echo ""
echo "🎉 Cloudflare Workers deployment complete!"
