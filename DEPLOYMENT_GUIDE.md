# 🚀 NEET Logiq Deployment Guide

## Overview
This guide will help you deploy NEET Logiq to GitHub + Cloudflare Pages.

## Prerequisites
- ✅ GitHub account created
- ✅ Cloudflare account created
- ✅ Google Cloud Console access (for OAuth)

## Step 1: GitHub Repository Setup

### 1.1 Create GitHub Repository
```bash
# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: NEET Logiq platform"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/neetlogiq.git

# Push to GitHub
git push -u origin main
```

### 1.2 Repository Structure
Your repository should have:
```
neetlogiq/
├── neetlogiq-frontend/     # React frontend
├── backend/                # Node.js backend
├── docs/                   # Documentation
└── README.md
```

## Step 2: Google OAuth Configuration

### 2.1 Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `neetlogiq`
3. Go to "APIs & Services" > "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add authorized origins:
   - `https://neetlogiq.pages.dev` (Cloudflare Pages URL)
   - `https://neetlogiq.com` (your custom domain)
6. Add authorized redirect URIs:
   - `https://neetlogiq.pages.dev/api/auth/google/callback`
   - `https://neetlogiq.com/api/auth/google/callback`

### 2.2 Environment Variables
Create these environment variables in Cloudflare Pages:
- `REACT_APP_GOOGLE_CLIENT_ID`: Your production Google Client ID
- `REACT_APP_API_URL`: Your backend API URL

## Step 3: Cloudflare Pages Setup

### 3.1 Connect GitHub Repository
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to "Pages"
3. Click "Create a project"
4. Connect your GitHub account
5. Select your `neetlogiq` repository

### 3.2 Build Configuration
- **Framework preset**: Create React App
- **Build command**: `cd neetlogiq-frontend && npm run build`
- **Build output directory**: `neetlogiq-frontend/build`
- **Root directory**: `/` (leave empty)

### 3.3 Environment Variables
Add these in Cloudflare Pages settings:
```
REACT_APP_GOOGLE_CLIENT_ID=1010076677532-0nqc9aqdev36oe5bvnfa39hdlv86rpp2.apps.googleusercontent.com
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_ENVIRONMENT=production
```

## Step 4: Backend Deployment Options

### Option A: Cloudflare Workers (Recommended)
- Serverless functions
- Global edge deployment
- Automatic scaling

### Option B: Railway/Render
- Traditional server deployment
- Database hosting included
- Easy setup

### Option C: Vercel/Netlify Functions
- Serverless backend
- Good for API endpoints

## Step 5: Database Migration

### Current: SQLite (Local)
- File-based database
- Good for development
- Not suitable for production

### Recommended: Cloudflare D1
- Serverless SQL database
- Global edge deployment
- Integrates with Cloudflare Workers

## Step 6: Domain Configuration

### 6.1 Custom Domain (Optional)
1. In Cloudflare Pages, go to "Custom domains"
2. Add your domain
3. Update DNS records as instructed

### 6.2 SSL Certificate
- Automatically provided by Cloudflare
- Free SSL/TLS encryption

## Step 7: Testing & Monitoring

### 7.1 Pre-deployment Checklist
- [ ] Google OAuth working
- [ ] All pages loading correctly
- [ ] Search functionality working
- [ ] Theme toggle working
- [ ] Responsive design tested

### 7.2 Post-deployment Testing
- [ ] Test on different devices
- [ ] Check Google Sign-in
- [ ] Verify API endpoints
- [ ] Test search functionality
- [ ] Check performance

## Troubleshooting

### Common Issues:
1. **Google Sign-in not working**: Check authorized origins and redirect URIs
2. **API calls failing**: Verify CORS settings and API URL
3. **Build failures**: Check environment variables and dependencies
4. **Database errors**: Ensure database is properly migrated

## Next Steps After Deployment:
1. Set up monitoring and analytics
2. Configure CDN for static assets
3. Set up automated backups
4. Implement error tracking
5. Add performance monitoring

## Support
If you encounter issues, check:
- Cloudflare Pages build logs
- Browser console for errors
- Network tab for failed requests
- Google Cloud Console for OAuth issues
