# NEET Logiq Platform - Setup Guide

## 🎯 **Overview**

This guide will help you set up the NEET Logiq platform for development and production.

## 📋 **Prerequisites**

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **Git**: Latest version
- **Operating System**: macOS, Linux, or Windows

## 🚀 **Quick Setup**

### **1. Clone Repository**
```bash
git clone <repository-url>
cd neetlogiq-platform
```

### **2. Install Dependencies**
```bash
npm run install:all
```

### **3. Environment Configuration**
```bash
cp env.example .env
# Edit .env with your configuration
```

### **4. Database Setup**
```bash
npm run setup:database
```

### **5. Start Development**
```bash
npm run dev
```

## 🔧 **Detailed Setup**

### **Environment Variables**

Create a `.env` file in the root directory:

```bash
# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_ENVIRONMENT=development

# Backend Configuration
NODE_ENV=development
PORT=5000
DB_PATH=./backend/database/neetlogiq.db
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000

# Database Configuration
DB_TYPE=sqlite

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### **Database Setup**

The platform uses SQLite for development. The database will be created automatically.

**Manual Database Setup:**
```bash
cd backend
npm run setup:db
```

### **Google OAuth Setup (Optional)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:3000`
   - `https://yourdomain.com` (for production)
6. Copy Client ID to `.env` file

## 🛠️ **Development Workflow**

### **Starting Development Servers**

```bash
# Start both frontend and backend
npm run dev

# Start only frontend (port 3000)
npm run dev:frontend

# Start only backend (port 5000)
npm run dev:backend
```

### **Accessing the Platform**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Documentation**: http://localhost:5000/api

### **File Structure**

```
neetlogiq-platform/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   └── utils/         # Utility functions
│   ├── database/          # Database files
│   └── package.json
└── docs/                  # Documentation
```

## 🧪 **Testing**

### **Running Tests**

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend
```

### **Test Structure**

```
tests/
├── frontend/          # Frontend tests
├── backend/           # Backend tests
└── integration/       # Integration tests
```

## 🚀 **Production Setup**

### **Build for Production**

```bash
npm run build
```

### **Start Production Server**

```bash
npm start
```

### **Environment Variables for Production**

```bash
NODE_ENV=production
PORT=5000
DB_PATH=/path/to/production/database.db
CORS_ORIGIN=https://yourdomain.com
```

## 🔍 **Troubleshooting**

### **Common Issues**

**1. Port Already in Use**
```bash
# Kill processes on ports 3000 and 5000
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

**2. Database Connection Issues**
```bash
# Check database file exists
ls -la backend/database/

# Recreate database
npm run setup:database
```

**3. Dependencies Issues**
```bash
# Clean and reinstall
npm run clean
npm run install:all
```

**4. Environment Variables Not Loading**
```bash
# Check .env file exists and is in root directory
ls -la .env

# Verify environment variables
echo $REACT_APP_API_URL
```

### **Logs and Debugging**

**Backend Logs:**
```bash
cd backend
npm run dev
# Logs will appear in console
```

**Frontend Logs:**
```bash
cd frontend
npm start
# Open browser dev tools for logs
```

## 📚 **Additional Resources**

- [API Documentation](API.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Development Guide](DEVELOPMENT.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

## 🆘 **Getting Help**

- **Email**: neetlogiq@gmail.com
- **GitHub Issues**: Create an issue for bugs or feature requests
- **Documentation**: Check the docs/ folder for detailed guides

---

**Happy coding! 🚀**
