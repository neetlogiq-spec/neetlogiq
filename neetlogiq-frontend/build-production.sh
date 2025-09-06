#!/bin/bash

# Production Build Script for NeetLogIQ Frontend
echo "🏗️ Building NeetLogIQ Frontend for Production..."

# Set production environment variables
export REACT_APP_API_URL=https://neetlogiq-backend.neetlogiq.workers.dev
export REACT_APP_ENVIRONMENT=production
export GENERATE_SOURCEMAP=false

echo "🔧 Environment Variables Set:"
echo "  REACT_APP_API_URL: $REACT_APP_API_URL"
echo "  REACT_APP_ENVIRONMENT: $REACT_APP_ENVIRONMENT"
echo "  GENERATE_SOURCEMAP: $GENERATE_SOURCEMAP"

# Build the application
echo "📦 Building React application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Production build completed successfully!"
    echo "📁 Build files are in the 'build' directory"
    echo "🚀 Ready for deployment to Vercel/Netlify"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
