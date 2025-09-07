# 🚀 NeetLogIQ Local Development Setup Guide

## 📋 Overview
This document provides complete instructions for setting up the NeetLogIQ local development environment with the correct database files and proper configuration.

## 🎯 Main Database File (KEEP THIS)
**Primary Database**: `/Users/kashyapanand/Movies/v2.1_final/backend/database/clean-unified.db`
- **Contains**: 2,401 colleges and 16,630 courses/programs
- **Status**: ✅ Complete and clean data
- **Usage**: This is the ONLY database file you need for development

## 🖥️ Local Development Servers

### Frontend Server (Port 3000)
- **URL**: `http://localhost:3000`
- **Directory**: `/Users/kashyapanand/Movies/v2.1_final/neetlogiq-frontend`
- **Command**: `npm start`
- **Purpose**: React frontend application

### Backend Server (Port 8787)
- **URL**: `http://localhost:8787`
- **Directory**: `/Users/kashyapanand/Movies/v2.1_final/cloudflare-workers`
- **Command**: `npx wrangler dev --local --port 8787`
- **Purpose**: Cloudflare Workers API server with local D1 database

## 🔧 Setup Instructions

### Step 1: Start Backend Server
```bash
cd /Users/kashyapanand/Movies/v2.1_final/cloudflare-workers
npx wrangler dev --local --port 8787
```

**Expected Output:**
```
⛅️ wrangler 4.33.2
─────────────────────────────────────────────
Your Worker has access to the following bindings:
Binding                    Resource                Mode
env.DB                     D1 Database             local
  neetlogiq-db
env.VECTORIZE_INDEX        Vectorize Index         not supported
  neetlogiq-index
env.AI                     AI                      remote
env.ENVIRONMENT            Environment Variable    local
  "development"
env.INDEXER_AUTH_SECRET    Environment Variable    local
  "dev-secret-key-change-in-production"
⎔ Starting local server...
[wrangler:info] Ready on http://localhost:8787
```

### Step 2: Start Frontend Server
```bash
cd /Users/kashyapanand/Movies/v2.1_final/neetlogiq-frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view neetlogiq-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

## 🔗 API Endpoints

### Available Endpoints (localhost:8787)
- `GET /` - API server info
- `GET /api/health` - Health check
- `GET /api/colleges` - Get colleges (with pagination)
- `GET /api/courses` - Get courses/programs
- `GET /api/colleges/filters` - Get filter options
- `GET /api/search` - Search colleges
- `GET /api/colleges/:id` - Get specific college
- `GET /api/courses/:id` - Get specific course

### Example API Calls
```bash
# Test backend is running
curl http://localhost:8787

# Get first 5 colleges
curl "http://localhost:8787/api/colleges?limit=5"

# Get first 3 courses
curl "http://localhost:8787/api/courses?limit=3"

# Health check
curl http://localhost:8787/api/health
```

## 📁 File Structure

### Essential Files (DO NOT DELETE)
```
/Users/kashyapanand/Movies/v2.1_final/
├── backend/
│   └── database/
│       └── clean-unified.db          # 🎯 MAIN DATABASE (2,401 colleges, 16,630 courses)
├── neetlogiq-frontend/               # Frontend React app
│   ├── src/
│   ├── package.json
│   └── public/
└── cloudflare-workers/               # Backend API server
    ├── src/
    │   └── index.js                  # Main API server file
    ├── wrangler.toml                 # Cloudflare Workers config
    ├── migrations/                   # Database schema migrations
    │   ├── 0001_initial_schema.sql
    │   └── 0002_add_fts5.sql
    └── .wrangler/                    # Local D1 database state (auto-generated)
        └── state/v3/d1/
```

### Configuration Files
- **Frontend API Config**: `neetlogiq-frontend/src/config/api.js`
- **Backend Config**: `cloudflare-workers/wrangler.toml`
- **Database Migrations**: `cloudflare-workers/migrations/`

## 🗄️ Database Details

### Local D1 Database
- **Name**: `neetlogiq-db`
- **Location**: `.wrangler/state/v3/d1/` (auto-managed by wrangler)
- **Source**: Data imported from `backend/database/clean-unified.db`
- **Tables**:
  - `colleges` (2,401 records)
  - `courses` (16,630 records)
  - `colleges_fts` (Full-text search index)

### Database Schema
```sql
-- Colleges table
CREATE TABLE colleges (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  city TEXT,
  state TEXT,
  district TEXT,
  address TEXT,
  pincode TEXT,
  college_type TEXT,
  management_type TEXT,
  establishment_year INTEGER,
  university TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  accreditation TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  college_type_category TEXT
);

-- Courses table
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  college_id INTEGER,
  course_name TEXT NOT NULL,
  stream TEXT,
  program TEXT,
  duration TEXT,
  entrance_exam TEXT,
  total_seats INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(id)
);
```

## 🔄 Data Import Process

### How the Data Gets to Local D1
1. **Source**: `backend/database/clean-unified.db` (SQLite file)
2. **Download**: Data downloaded from Cloudflare D1 remote database
3. **Import**: Data imported into local D1 via wrangler migrations
4. **Storage**: Local D1 database in `.wrangler/state/v3/d1/`

### Re-importing Data (if needed)
```bash
cd /Users/kashyapanand/Movies/v2.1_final/cloudflare-workers

# Clear local database
npx wrangler d1 execute neetlogiq-db --local --command="DROP TABLE IF EXISTS colleges; DROP TABLE IF EXISTS courses; DROP TABLE IF EXISTS colleges_fts;"

# Apply migrations
npx wrangler d1 migrations apply neetlogiq-db --local

# Import data (if you have the import script)
node import-data-batches.js
```

## 🚨 Troubleshooting

### Backend Not Starting
```bash
# Check if port 8787 is in use
lsof -i :8787

# Kill existing processes
pkill -f "wrangler dev"

# Start fresh
cd /Users/kashyapanand/Movies/v2.1_final/cloudflare-workers
npx wrangler dev --local --port 8787
```

### Frontend Not Connecting to Backend
1. **Check API URL**: Ensure `neetlogiq-frontend/src/config/api.js` has:
   ```javascript
   export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8787';
   ```

2. **Check Environment Variables**: Create `.env` file in frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:8787
   ```

### Database Issues
```bash
# Check local database status
npx wrangler d1 execute neetlogiq-db --local --command="SELECT COUNT(*) FROM colleges;"
npx wrangler d1 execute neetlogiq-db --local --command="SELECT COUNT(*) FROM courses;"

# Expected output: 2401 colleges, 16630 courses
```

## 📊 Data Verification

### Verify Data Integrity
```bash
# Check college count
curl -s "http://localhost:8787/api/colleges?limit=1" | jq '.pagination.totalItems'
# Expected: 2401

# Check course count
curl -s "http://localhost:8787/api/courses?limit=1" | jq '.pagination.totalItems'
# Expected: 181 (course types)

# Check specific college
curl -s "http://localhost:8787/api/colleges/6812" | jq '.data.name'
# Expected: "A J INSTITUTE OF MEDICAL SCIENCES & RESEARCH CENTRE"
```

## 🔧 Development Workflow

### Daily Development
1. **Start Backend**: `cd cloudflare-workers && npx wrangler dev --local --port 8787`
2. **Start Frontend**: `cd neetlogiq-frontend && npm start`
3. **Access**: Frontend at `http://localhost:3000`, API at `http://localhost:8787`

### Making Changes
- **Frontend Changes**: Edit files in `neetlogiq-frontend/src/`
- **Backend Changes**: Edit files in `cloudflare-workers/src/`
- **Database Changes**: Use migrations in `cloudflare-workers/migrations/`

## 📝 Notes

### Important Reminders
- ✅ **KEEP**: `backend/database/clean-unified.db` - This is your main database
- ✅ **KEEP**: All files in `neetlogiq-frontend/` and `cloudflare-workers/`
- ❌ **DELETE**: All duplicate database files (see cleanup list below)
- ❌ **DELETE**: All backup directories and temporary files

### Performance
- **Local Development**: Fast responses (no network latency)
- **Data Access**: All 2,401 colleges and 16,630 courses available locally
- **Search**: Full-text search works with local FTS5 index
- **No Rate Limits**: Unlimited API calls in local development

### Security
- **Local Only**: No external API calls in development
- **No Secrets**: All sensitive data removed from codebase
- **Clean Environment**: Isolated from production systems

---

## 🗑️ Files to Delete (Cleanup List)

### Duplicate Database Files (DELETE THESE)
```bash
# Duplicate clean-unified.db files
rm /Users/kashyapanand/Movies/v2.1_final/neetlogiq-platform/backend/database/clean-unified.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/clean-unified.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/data/clean-unified.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/src/database/clean-unified.db
rm /Users/kashyapanand/Movies/v2.1_final/cloudflare-workers/clean-unified.db
rm /Users/kashyapanand/Movies/v2.1_final/clean-unified.db

# Old database files
rm /Users/kashyapanand/Movies/v2.1_final/backend/database/medical_seats.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/database/error_corrections.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/database/counselling.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/database/colleges.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/database/staging_cutoffs.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/database/unified.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/database/users.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/database/dental_seats.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/database/dnb_seats.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/database/cutoff_ranks.db

# Duplicate files in backend root
rm /Users/kashyapanand/Movies/v2.1_final/backend/error_corrections.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/staging_cutoffs.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/unified.db

# Files in backend/src/database
rm /Users/kashyapanand/Movies/v2.1_final/backend/src/database/error_corrections.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/src/database/counselling.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/src/database/staging_cutoffs.db
rm /Users/kashyapanand/Movies/v2.1_final/backend/src/database/unified.db

# Backup directories
rm -rf /Users/kashyapanand/Movies/v2.1_final/backend/backups/

# Other database files
rm /Users/kashyapanand/Movies/v2.1_final/neetlogiq-platform/backend/database/neetlogiq.db
rm /Users/kashyapanand/Movies/v2.1_final/database-backup/neetlogiq-dev.db

# Downloaded data files (temporary)
rm -rf /Users/kashyapanand/Movies/v2.1_final/cloudflare-workers/downloaded-data/

# Temporary SQL files
rm /Users/kashyapanand/Movies/v2.1_final/cloudflare-workers/temp_schema.sql
rm /Users/kashyapanand/Movies/v2.1_final/cloudflare-workers/import_data.sql
rm /Users/kashyapanand/Movies/v2.1_final/cloudflare-workers/temp_batch_19.sql
rm /Users/kashyapanand/Movies/v2.1_final/cloudflare-workers/temp_programs_batch_6.sql
```

---

**Last Updated**: September 7, 2025  
**Status**: ✅ Ready for Development  
**Database**: 2,401 colleges, 16,630 courses  
**Servers**: Frontend (3000), Backend (8787)
