# Cloudflare Development Setup

## 🎯 **Overview**

This guide shows how to develop the NEET Logiq platform using Cloudflare Workers and D1 database locally, providing an identical environment to production.

## 🚀 **Benefits of Cloudflare Development**

- ✅ **Identical Environment**: Local development matches production exactly
- ✅ **D1 Database**: Same database locally and in production
- ✅ **Workers Runtime**: Same JavaScript runtime as production
- ✅ **Easy Deployment**: What works locally works in production
- ✅ **No Docker Required**: Just Wrangler CLI handles everything

## 📋 **Prerequisites**

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **Wrangler CLI**: Cloudflare's development tool
- **Cloudflare Account**: For D1 database access

## 🛠️ **Setup Instructions**

### **1. Install Wrangler CLI**

```bash
npm install -g wrangler
```

### **2. Login to Cloudflare**

```bash
wrangler login
```

This will open a browser window for authentication.

### **3. Install Dependencies**

```bash
# Install all dependencies
npm run install:all

# Or install individually
cd cloudflare/worker
npm install
```

### **4. Setup D1 Database**

```bash
# Apply migrations to local D1 database
npm run setup:database

# Or manually
cd cloudflare/worker
wrangler d1 migrations apply neetlogiq-db --local
```

## 🚀 **Development Workflow**

### **Start Development Servers**

```bash
# Start both frontend and Cloudflare Worker
npm run dev

# Or start individually
npm run dev:frontend    # Frontend on port 3000
npm run dev:cloudflare  # Worker on port 8787
```

### **Access the Platform**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8787
- **Health Check**: http://localhost:8787/health

### **Database Management**

```bash
# View local D1 database
cd cloudflare/worker
wrangler d1 execute neetlogiq-db --local --command "SELECT * FROM colleges LIMIT 5"

# Apply new migrations
wrangler d1 migrations apply neetlogiq-db --local

# Create new migration
wrangler d1 migrations create neetlogiq-db "add_new_table"
```

## 🔧 **Configuration**

### **Environment Variables**

The platform uses different configurations for development and production:

**Development (Local):**
```bash
REACT_APP_API_URL=http://localhost:8787/api
ENVIRONMENT=development
```

**Production:**
```bash
REACT_APP_API_URL=https://neetlogiq-backend.neetlogiq.workers.dev/api
ENVIRONMENT=production
```

### **Wrangler Configuration**

The `wrangler.toml` file contains:

```toml
name = "neetlogiq-backend"
main = "src/index.js"

# D1 Database configuration
[[d1_databases]]
binding = "DB"
database_name = "neetlogiq-db"
database_id = "your-database-id"

# Environment-specific settings
[env.development]
name = "neetlogiq-backend-dev"

[env.production]
name = "neetlogiq-backend"
```

## 📊 **Database Schema**

The D1 database includes:

- **colleges**: Medical college information
- **programs**: Course/program details
- **cutoffs**: Admission cutoff data
- **users**: User authentication data

### **View Database Schema**

```bash
cd cloudflare/worker
wrangler d1 execute neetlogiq-db --local --command ".schema"
```

## 🧪 **Testing**

### **Test API Endpoints**

```bash
# Health check
curl http://localhost:8787/health

# Get colleges
curl http://localhost:8787/api/colleges

# Get courses
curl http://localhost:8787/api/courses
```

### **Test Database Queries**

```bash
cd cloudflare/worker

# Count colleges
wrangler d1 execute neetlogiq-db --local --command "SELECT COUNT(*) FROM colleges"

# Get sample data
wrangler d1 execute neetlogiq-db --local --command "SELECT * FROM colleges LIMIT 3"
```

## 🚀 **Deployment**

### **Deploy to Production**

```bash
# Deploy worker
npm run deploy

# Or manually
cd cloudflare/worker
wrangler deploy --env production
```

### **Deploy Database Changes**

```bash
cd cloudflare/worker

# Apply migrations to production
wrangler d1 migrations apply neetlogiq-db

# Verify deployment
wrangler d1 execute neetlogiq-db --command "SELECT COUNT(*) FROM colleges"
```

## 🔍 **Troubleshooting**

### **Common Issues**

**1. Wrangler Not Found**
```bash
npm install -g wrangler
```

**2. Not Logged In**
```bash
wrangler login
```

**3. Database Not Found**
```bash
# Check if database exists
wrangler d1 list

# Create database if needed
wrangler d1 create neetlogiq-db
```

**4. Port Already in Use**
```bash
# Kill processes on port 8787
lsof -ti:8787 | xargs kill -9
```

**5. Migration Errors**
```bash
# Reset local database
wrangler d1 migrations apply neetlogiq-db --local --force
```

### **Debug Mode**

```bash
# Start with debug logging
cd cloudflare/worker
wrangler dev --port 8787 --env development --log-level debug
```

## 📚 **Useful Commands**

```bash
# Check Wrangler version
wrangler --version

# List D1 databases
wrangler d1 list

# View worker logs
wrangler tail

# Check worker status
wrangler whoami
```

## 🎯 **Best Practices**

1. **Always test locally** before deploying
2. **Use migrations** for database changes
3. **Keep environment variables** in sync
4. **Test API endpoints** after changes
5. **Monitor logs** during development

## 🆘 **Getting Help**

- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **D1 Database**: https://developers.cloudflare.com/d1/
- **Workers Runtime**: https://developers.cloudflare.com/workers/runtime-apis/

---

**Happy developing with Cloudflare! 🚀**
