# NeetLogIQ Deployment Configuration

## Frontend Deployment (Vercel/Netlify)

### Environment Variables
```bash
REACT_APP_API_URL=https://neetlogiq-backend.your-domain.workers.dev
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

### Build Settings
- **Build Command**: `cd neetlogiq-frontend && npm run build`
- **Output Directory**: `neetlogiq-frontend/build`
- **Node Version**: 18.x

## Backend Deployment (Cloudflare Workers)

### Prerequisites
1. Cloudflare account with Workers plan
2. D1 Database created
3. Vectorize index created
4. AI binding configured

### Environment Variables
```bash
ENVIRONMENT=production
INDEXER_AUTH_SECRET=your-production-secret-key
```

### Database Configuration
- **D1 Database**: neetlogiq-db
- **Vectorize Index**: neetlogiq-index
- **AI Binding**: Enabled

## GitHub Repository Setup

### Required Files
- `.gitignore` - Excludes node_modules, build files, etc.
- `README.md` - Project documentation
- `package.json` - Root package configuration
- `wrangler.toml` - Cloudflare Workers configuration

### Branch Strategy
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches

## Deployment Steps

### 1. GitHub Push
```bash
git add .
git commit -m "feat: STABLE_V1 - Production ready deployment"
git push origin main
```

### 2. Cloudflare Workers Deploy
```bash
cd cloudflare-workers
npx wrangler login
npx wrangler deploy
```

### 3. Frontend Deploy
- Connect GitHub repository to Vercel/Netlify
- Set environment variables
- Deploy from main branch

## Post-Deployment

### Health Checks
- Frontend: https://your-frontend-domain.com
- Backend API: https://neetlogiq-backend.your-domain.workers.dev/api/colleges
- Database: Verify D1 database connectivity

### Monitoring
- Cloudflare Analytics
- Vercel/Netlify Analytics
- Error tracking and logging
