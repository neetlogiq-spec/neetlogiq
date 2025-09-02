# 🚀 Cloudflare D1 + Workers Deployment Guide

## Overview
This guide will help you deploy your NEET Logiq backend using Cloudflare D1 (serverless SQL database) and Cloudflare Workers (serverless functions).

## Prerequisites
- Cloudflare account
- Wrangler CLI installed
- Node.js installed

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

## Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

## Step 3: Create D1 Database

```bash
wrangler d1 create neetlogiq-db
```

This will output something like:
```
✅ Successfully created DB 'neetlogiq-db' in region APAC
Created your database using D1's new storage engine. The new storage engine is not yet recommended for production workloads, but backs up your data in multiple physical locations.

[[d1_databases]]
binding = "DB"
database_name = "neetlogiq-db"
database_id = "your-database-id-here"
```

Copy the `database_id` and update it in `wrangler.toml`.

## Step 4: Update wrangler.toml

Update the `database_id` in `wrangler.toml` with the ID from step 3.

## Step 5: Run Database Migrations

```bash
cd cloudflare-workers
wrangler d1 migrations apply neetlogiq-db
```

## Step 6: Export Data from SQLite

```bash
cd cloudflare-workers
node migrate-to-d1.js
```

This will create SQL files in the `migrations/` directory.

## Step 7: Import Data to D1

```bash
cd cloudflare-workers

# Import colleges data
wrangler d1 execute neetlogiq-db --file=./migrations/colleges_data.sql

# Import courses data
wrangler d1 execute neetlogiq-db --file=./migrations/courses_data.sql

# Import cutoffs data
wrangler d1 execute neetlogiq-db --file=./migrations/cutoffs_data.sql
```

## Step 8: Install Dependencies

```bash
cd cloudflare-workers
npm install
```

## Step 9: Deploy to Cloudflare Workers

```bash
cd cloudflare-workers
wrangler deploy
```

## Step 10: Update Frontend Configuration

Update your frontend's API URL to point to your Cloudflare Workers URL:

```bash
# Get your Workers URL
wrangler whoami
```

The URL will be something like: `https://neetlogiq-backend.your-subdomain.workers.dev`

Update `neetlogiq-frontend/src/config/auth.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'https://neetlogiq-backend.your-subdomain.workers.dev',
  ENDPOINTS: {
    AUTH: '/api/auth',
    USER: '/api/user',
  },
};
```

## Step 11: Configure Custom Domain (Optional)

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker
3. Go to Settings → Triggers
4. Add custom domain: `api.neetlogiq.com`

## Step 12: Set Environment Variables

In Cloudflare Dashboard → Workers & Pages → Your Worker → Settings → Variables:

```
ENVIRONMENT=production
```

## Step 13: Test Your Deployment

```bash
# Test health endpoint
curl https://your-worker-url.workers.dev/health

# Test colleges API
curl "https://your-worker-url.workers.dev/api/colleges?page=1&limit=10"

# Test search API
curl "https://your-worker-url.workers.dev/api/search?q=aiims&type=all"
```

## Benefits of Cloudflare D1 + Workers

### ✅ Advantages:
- **Serverless**: No server management
- **Global Edge**: Fast worldwide performance
- **Cost-effective**: Pay only for what you use
- **Integrated**: Works seamlessly with Cloudflare Pages
- **SQLite Compatible**: Easy migration from existing setup
- **Automatic Scaling**: Handles traffic spikes automatically
- **Built-in Security**: DDoS protection, SSL, etc.

### 📊 Pricing:
- **Workers**: 100,000 requests/day free, then $0.50/million
- **D1**: 5GB storage free, then $0.75/GB/month
- **Bandwidth**: 1GB/day free, then $0.09/GB

### 🔧 Management:

```bash
# View database info
wrangler d1 info neetlogiq-db

# Execute SQL queries
wrangler d1 execute neetlogiq-db --command="SELECT COUNT(*) FROM colleges"

# Backup database
wrangler d1 export neetlogiq-db --output=backup.sql

# View logs
wrangler tail neetlogiq-backend
```

## Troubleshooting

### Common Issues:

1. **Database not found**: Make sure you've created the D1 database and updated the ID in `wrangler.toml`

2. **Migration errors**: Check your SQL syntax and ensure all required fields are provided

3. **CORS issues**: The Workers code includes CORS handling, but make sure your frontend domain is in the allowed origins

4. **Performance issues**: Add more indexes to your database for better query performance

### Debug Commands:

```bash
# Test locally
wrangler dev

# View database schema
wrangler d1 execute neetlogiq-db --command=".schema"

# Check data
wrangler d1 execute neetlogiq-db --command="SELECT COUNT(*) FROM colleges"
```

## Next Steps

1. **Monitor Performance**: Use Cloudflare Analytics to monitor your API performance
2. **Set up Alerts**: Configure alerts for errors and performance issues
3. **Optimize Queries**: Add indexes for frequently queried fields
4. **Implement Caching**: Use Cloudflare's edge caching for better performance
5. **Add Authentication**: Implement proper authentication for admin endpoints

## Support

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
