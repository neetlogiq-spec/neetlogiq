# 🚀 Server Management Guide

## 📋 **Standardized Commands**

### **Starting the System**
```bash
./start-servers.sh
```
- ✅ Automatically kills conflicting processes
- ✅ Checks port availability
- ✅ Starts backend on port 4001
- ✅ Starts frontend on port 4000
- ✅ Verifies both servers are running
- ✅ Shows clear status messages

### **Stopping the System**
```bash
./stop-servers.sh
```
- ✅ Cleanly terminates all servers
- ✅ Frees up ports 4000 and 4001
- ✅ Shows port status after stopping

### **Health Check**
```bash
./health-check.sh
```
- ✅ Checks backend health (port 4001)
- ✅ Checks frontend health (port 4000)
- ✅ Tests API endpoints
- ✅ Verifies database files exist
- ✅ Shows port usage status

## 🌐 **Standard URLs**

### **Frontend (Port 4000)**
- **Main Website**: http://localhost:4000
- **Admin Panel**: http://localhost:4000/sector_xp_12
- **Colleges**: http://localhost:4000/sector_xp_12/colleges
- **Programs**: http://localhost:4000/sector_xp_12/programs
- **Cutoff Data**: http://localhost:4000/sector_xp_12/cutoff-data
- **Error Corrections**: http://localhost:4000/sector_xp_12/error-corrections

### **Backend API (Port 4001)**
- **Health Check**: http://localhost:4001/api/health
- **Authentication**: http://localhost:4001/api/sector_xp_12
- **Colleges API**: http://localhost:4001/api/sector_xp_12/colleges
- **Programs API**: http://localhost:4001/api/sector_xp_12/programs

## 🔑 **Admin Credentials**
- **Username**: `Lone_wolf#12`
- **Password**: `Apx_gp_delta`

## 📁 **Standard Directory Structure**
```
v2.1_final/
├── backend/                    # Backend server files
│   ├── completeServer.js      # Main backend server
│   ├── database/              # Database files
│   │   ├── clean-unified.db   # Main database (2401 colleges)
│   │   ├── staging_cutoffs.db # Staging database
│   │   └── error_corrections.db # Error corrections
│   └── package.json
├── frontend/                   # React frontend
│   ├── src/                   # Source code
│   ├── package.json
│   └── vite.config.js
├── start-servers.sh           # Start all servers
├── stop-servers.sh            # Stop all servers
├── health-check.sh            # System health check
└── package.json               # Root package.json
```

## 🚨 **Troubleshooting**

### **Port Already in Use**
```bash
# Check what's using the ports
lsof -i :4000
lsof -i :4001

# Kill all related processes
./stop-servers.sh

# Start fresh
./start-servers.sh
```

### **Backend Not Starting**
```bash
# Check syntax
cd backend
node -c completeServer.js

# Check database files exist
ls -la database/

# Start manually to see errors
node completeServer.js
```

### **Frontend Not Starting**
```bash
# Check dependencies
cd frontend
npm install

# Start manually to see errors
npm run dev
```

### **Database Issues**
```bash
# Check database files
ls -la backend/database/

# Verify database content
cd backend
sqlite3 database/clean-unified.db ".tables"
sqlite3 database/clean-unified.db "SELECT COUNT(*) FROM colleges;"
```

## 📊 **Monitoring**

### **Real-time Logs**
```bash
# Backend logs (if using nodemon)
cd backend
npm run dev

# Frontend logs
cd frontend
npm run dev
```

### **Process Monitoring**
```bash
# Check running processes
ps aux | grep -E "(node|vite|nodemon)"

# Check port usage
lsof -i :4000 -i :4001
```

## 🔄 **Development Workflow**

1. **Start Development**: `./start-servers.sh`
2. **Make Changes**: Edit files in `frontend/src/` or `backend/`
3. **Test Changes**: Refresh browser or restart backend
4. **Stop Development**: `./stop-servers.sh`

## ⚠️ **Important Notes**

- **NEVER** run servers from wrong directories
- **ALWAYS** use the standardized scripts
- **Frontend** serves the admin panel (port 4000)
- **Backend** serves only API endpoints (port 4001)
- **Database** files must be in `backend/database/`
- **Port conflicts** are automatically resolved by scripts

## 🆘 **Emergency Stop**
```bash
# Force kill all processes
pkill -f "node|vite|nodemon"

# Verify ports are free
lsof -i :4000 -i :4001
```
