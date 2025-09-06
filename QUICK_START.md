# Quick Start Guide

## Starting the Worker

### Option 1: Using the Startup Script (Recommended)
```bash
# From the root directory (v2.1_final)
./start-worker.sh
```

### Option 2: Using npm Scripts
```bash
# From the root directory (v2.1_final)
npm run start:worker
```

### Option 3: Manual Navigation
```bash
# Navigate to the worker directory
cd cloudflare-workers

# Start the worker
npx wrangler dev --port 8787
```

## Starting the Frontend

### Option 1: Using the Startup Script (Recommended)
```bash
# From the root directory (v2.1_final)
./start-frontend.sh
```

### Option 2: Using npm Scripts
```bash
# From the root directory (v2.1_final)
npm run start:frontend
```

### Option 3: Manual Navigation
```bash
# Navigate to the frontend directory
cd neetlogiq-frontend

# Start the React development server
npm start
```

## Starting Both Worker and Frontend

### Option 1: Using npm Scripts (Recommended)
```bash
# From the root directory (v2.1_final)
npm run start:all
```

### Option 2: Using Individual Scripts
```bash
# Terminal 1: Start worker
./start-worker.sh

# Terminal 2: Start frontend
./start-frontend.sh
```

## Available Scripts

### Worker Scripts
- `npm run start:worker` - Start worker in development mode
- `npm run start:worker:prod` - Start worker with production Vectorize binding
- `npm run start:worker:minimal` - Start minimal worker for testing
- `npm run deploy:worker` - Deploy worker to Cloudflare
- `npm run deploy:worker:dev` - Deploy to development environment
- `npm run deploy:worker:prod` - Deploy to production environment

### Frontend Scripts
- `npm run start:frontend` - Start React frontend (port 3000)
- `npm run start:frontend:vite` - Start Vite frontend (port 5173)
- `npm run build:frontend` - Build React frontend for production
- `npm run build:frontend:vite` - Build Vite frontend for production

### Combined Scripts
- `npm run start:all` - Start both worker and frontend simultaneously

### Database Scripts
- `npm run db:migrate` - Apply database migrations locally
- `npm run db:migrate:remote` - Apply database migrations to remote
- `npm run db:backup` - Backup the database

## Testing the Applications

### Testing the Worker

Once the worker is running, you can test it:

```bash
# Health check
curl http://localhost:8787/api/health

# Test colleges endpoint
curl "http://localhost:8787/api/colleges?limit=5"

# Test search
curl "http://localhost:8787/api/search?q=medical&limit=5"
```

### Testing the Frontend

Once the frontend is running, you can test it:

```bash
# Open in browser
open http://localhost:3000

# Or test with curl
curl http://localhost:3000
```

## Troubleshooting

### Worker Issues
If the worker doesn't start:
1. Make sure you're in the root directory (`v2.1_final`)
2. Check that the `cloudflare-workers` directory exists
3. Verify that `wrangler.toml` exists in the `cloudflare-workers` directory
4. Try running `npm install` in the root directory first

### Frontend Issues
If the frontend doesn't start:
1. Make sure you're in the root directory (`v2.1_final`)
2. Check that the `neetlogiq-frontend` directory exists
3. Verify that `package.json` exists in the `neetlogiq-frontend` directory
4. Try running `npm install` in the `neetlogiq-frontend` directory
5. Check if port 3000 is already in use: `lsof -ti:3000`

### Port Conflicts
If you get "Address already in use" errors:
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8787 | xargs kill -9  # Worker
```
