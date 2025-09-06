#!/bin/bash

# NeetLogIQ GitHub Deployment Script
echo "🚀 Deploying NeetLogIQ to GitHub..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please initialize git first."
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Staging changes..."
    git add .
    
    echo "💾 Committing changes..."
    git commit -m "feat: STABLE_V1 - Production ready deployment

- Fixed modal scroll lock issues
- Implemented zero seats course filtering
- Added UG course prioritization (MBBS/BDS first)
- Optimized debounce timing and dependencies
- Cleaned up unused variables and imports
- Added comprehensive deployment configuration
- Ready for production deployment"

    echo "📤 Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to GitHub!"
        echo "🔗 Repository: $(git remote get-url origin)"
        echo ""
        echo "📋 Next steps:"
        echo "1. Deploy backend to Cloudflare Workers"
        echo "2. Deploy frontend to Vercel/Netlify"
        echo "3. Update environment variables"
        echo "4. Run health checks"
    else
        echo "❌ Failed to push to GitHub"
        exit 1
    fi
else
    echo "ℹ️  No changes to commit"
    echo "📤 Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to GitHub!"
    else
        echo "❌ Failed to push to GitHub"
        exit 1
    fi
fi

echo ""
echo "🎉 GitHub deployment complete!"
