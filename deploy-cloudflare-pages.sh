#!/bin/bash

# Cloudflare Pages Deployment Script for NeetLogIQ Frontend
echo "☁️ Deploying NeetLogIQ Frontend to Cloudflare Pages..."

# Check if wrangler is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not installed. Please install Node.js first."
    exit 1
fi

# Navigate to frontend directory
cd neetlogiq-frontend

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building for production..."
# Set environment variables for Cloudflare Pages
export REACT_APP_API_URL=https://neetlogiq-backend.neetlogiq.workers.dev
export REACT_APP_ENVIRONMENT=production
export GENERATE_SOURCEMAP=false

npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build files are in the 'build' directory"
    echo ""
    echo "🚀 Next steps for Cloudflare Pages deployment:"
    echo ""
    echo "1. Go to Cloudflare Dashboard → Pages"
    echo "2. Click 'Create a project'"
    echo "3. Connect your GitHub repository: https://github.com/neetlogiq-spec/neetlogiq"
    echo "4. Set build settings:"
    echo "   - Framework preset: Create React App"
    echo "   - Build command: npm run build"
    echo "   - Build output directory: neetlogiq-frontend/build"
    echo "   - Root directory: neetlogiq-frontend"
    echo "5. Add environment variables:"
    echo "   - REACT_APP_API_URL = https://neetlogiq-backend.neetlogiq.workers.dev"
    echo "   - REACT_APP_ENVIRONMENT = production"
    echo "   - GENERATE_SOURCEMAP = false"
    echo "6. Deploy!"
    echo ""
    echo "🔗 Your backend is already live at: https://neetlogiq-backend.neetlogiq.workers.dev"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "🎉 Cloudflare Pages deployment guide complete!"
