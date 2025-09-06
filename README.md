# NeetLogIQ - Medical College Search Platform

A comprehensive platform for searching and discovering medical colleges, courses, and cutoffs across India. Built with React, TypeScript, and Cloudflare Workers.

## 🚀 **STABLE_V1 - Production Ready**

This version includes all core features and is ready for production deployment.

### ✨ **Key Features**

- **🔍 Advanced Search**: Unified search across colleges, courses, and cutoffs
- **📱 Responsive Design**: Mobile-first, modern UI with dark/light themes
- **⚡ Performance Optimized**: Route-based code splitting and lazy loading
- **🎯 Smart Filtering**: Intelligent filters with real-time updates
- **📊 Detailed Information**: Comprehensive college and course details
- **🤖 AI Integration**: AI-powered recommendations and search
- **🔒 Security**: CORS protection, input validation, and secure API endpoints

### 🏗️ **Architecture**

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Cloudflare Workers + D1 Database
- **Search**: Vectorize Index for AI-powered search
- **Deployment**: Vercel/Netlify (Frontend) + Cloudflare Workers (Backend)

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+
- Cloudflare account
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/neetlogiq.git
   cd neetlogiq
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd neetlogiq-frontend && npm install
   cd ../cloudflare-workers && npm install
   ```

3. **Start development servers**
   ```bash
   # Start backend (Cloudflare Workers)
   cd cloudflare-workers
   npx wrangler dev --port 8787

   # Start frontend (React)
   cd ../neetlogiq-frontend
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8787

## 🌐 **Production Deployment**

### Backend (Cloudflare Workers)

1. **Configure Cloudflare**
   ```bash
   cd cloudflare-workers
   npx wrangler login
   npx wrangler deploy
   ```

2. **Set up D1 Database**
   - Create D1 database: `neetlogiq-db`
   - Import database schema
   - Configure bindings in `wrangler.toml`

3. **Configure Vectorize Index**
   - Create Vectorize index: `neetlogiq-index`
   - Update binding in `wrangler.toml`

### Frontend (Vercel/Netlify)

1. **Connect GitHub repository**
2. **Set environment variables**:
   ```bash
   REACT_APP_API_URL=https://neetlogiq-backend.your-domain.workers.dev
   REACT_APP_ENVIRONMENT=production
   ```
3. **Deploy from main branch**

### Automated Deployment

Use the provided deployment scripts:

```bash
# Deploy to GitHub
./deploy-github.sh

# Deploy to Cloudflare Workers
./deploy-cloudflare.sh
```

## 📁 **Project Structure**

```
neetlogiq/
├── neetlogiq-frontend/          # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Application pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API services
│   │   └── context/            # React context providers
│   └── public/                 # Static assets
├── cloudflare-workers/          # Backend API
│   ├── src/
│   │   └── index.js            # Main worker file
│   └── wrangler.toml           # Cloudflare configuration
├── docs/                       # Documentation
├── scripts/                    # Deployment scripts
└── README.md                   # This file
```

## 🔧 **Configuration**

### Environment Variables

**Frontend (.env)**
```bash
REACT_APP_API_URL=http://localhost:8787
REACT_APP_ENVIRONMENT=development
```

**Backend (wrangler.toml)**
```toml
[vars]
ENVIRONMENT = "development"
INDEXER_AUTH_SECRET = "your-secret-key"
```

### Database Schema

The application uses Cloudflare D1 with the following main tables:
- `colleges` - Medical college information
- `courses` - Course details and availability
- `cutoffs` - Admission cutoff data

## 🧪 **Testing**

### Health Checks

```bash
# Backend API
curl https://neetlogiq-backend.your-domain.workers.dev/api/colleges

# Frontend
curl https://your-frontend-domain.com
```

### Local Testing

```bash
# Run frontend tests
cd neetlogiq-frontend
npm test

# Run backend tests
cd cloudflare-workers
npx wrangler dev --test
```

## 📊 **Performance**

- **Initial Load**: ~2.5s (with code splitting)
- **API Response**: <500ms average
- **Bundle Size**: Optimized with lazy loading
- **Lighthouse Score**: 90+ (Performance)

## 🔒 **Security**

- **CORS Configuration**: Proper cross-origin setup
- **Input Validation**: Server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **Rate Limiting**: API rate limiting

## 📈 **Recent Updates (STABLE_V1)**

### ✅ **Bug Fixes**
- Fixed modal scroll lock issues
- Hidden courses with 0 total seats
- Prioritized UG courses (MBBS/BDS) in college details
- Fixed search suggestions dropdown height
- Corrected college count display

### ✅ **Performance Improvements**
- Implemented route-based code splitting
- Optimized animation timings
- Improved memory management
- Enhanced API efficiency

### ✅ **UI/UX Enhancements**
- Modern card designs with glassmorphism
- Consistent gradient styling
- Improved responsive design
- Better accessibility

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 **Support**

- **Documentation**: Check the `docs/` directory
- **Issues**: Create an issue on GitHub
- **Email**: support@neetlogiq.com

## 🎯 **Roadmap**

- [ ] Advanced analytics dashboard
- [ ] User authentication and profiles
- [ ] Personalized recommendations
- [ ] Mobile app (React Native)
- [ ] Advanced filtering options
- [ ] Export functionality

---

**🎉 NeetLogIQ STABLE_V1 - Ready for Production!**

Built with ❤️ for medical aspirants across India.