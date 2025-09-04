# NEET Logiq Platform

> **Medical College Search Platform** - Helping students find the right medical colleges and courses.

## 🚀 **Quick Start**

```bash
# Clone and setup
git clone <repository-url>
cd neetlogiq-platform

# Install all dependencies
npm run install:all

# Setup database
npm run setup:database

# Start development servers
npm run dev
```

**Access the platform:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8787 (Cloudflare Worker)
- Health Check: http://localhost:8787/health

## 📁 **Project Structure**

```
neetlogiq-platform/
├── frontend/          # React Frontend (Port 3000)
├── backend/           # Node.js Backend (Port 5000)
├── cloudflare/        # Cloudflare Workers & D1
├── docs/              # Documentation
├── scripts/           # Utility Scripts
└── tests/             # Test Files
```

## 🛠️ **Development**

### **Prerequisites**
- Node.js >= 18.0.0
- npm >= 8.0.0

### **Available Scripts**

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Production
npm run build            # Build both frontend and backend
npm run start            # Start production backend

# Testing
npm run test             # Run all tests
npm run test:frontend    # Run frontend tests
npm run test:backend     # Run backend tests

# Utilities
npm run install:all      # Install all dependencies
npm run clean            # Clean all node_modules
npm run setup            # Full setup (install + database)
```

## 🔧 **Configuration**

### **Environment Variables**

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

**Key Variables:**
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `PORT`: Backend port (default: 5000)
- `DB_PATH`: Database file path

### **Port Configuration**

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend (Cloudflare Worker) | 8787 | http://localhost:8787 |
| Health Check | 8787 | http://localhost:8787/health |

## 📚 **API Documentation**

### **Endpoints**

- `GET /health` - Health check
- `GET /api/colleges` - Get colleges with pagination
- `GET /api/courses` - Get courses with pagination
- `GET /api/cutoffs` - Get cutoffs with pagination
- `GET /api/auth/user` - Get user profile
- `GET /api/admin` - Admin dashboard

### **Response Format**

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## 🚀 **Deployment**

### **Local Development**
```bash
npm run dev
```

### **Production Build**
```bash
npm run build
npm start
```

### **Cloudflare Deployment**
```bash
cd cloudflare/worker
wrangler deploy
```

## 🧪 **Testing**

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:frontend
npm run test:backend
```

## 📖 **Documentation**

- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Development Guide](docs/DEVELOPMENT.md)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details.

## 🆘 **Support**

- Email: neetlogiq@gmail.com
- Documentation: [docs/](docs/)
- Issues: GitHub Issues

---

**Built with ❤️ for medical aspirants**
