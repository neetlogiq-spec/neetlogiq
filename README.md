# 🏥 NEET Logiq - Medical College Search Platform

A comprehensive platform for medical aspirants to search and explore medical colleges, courses, and cutoffs across India.

## ✨ Features

- 🔍 **Smart Search**: Intelligent search across colleges, courses, and cutoffs
- 🎨 **Beautiful UI**: Modern design with light/dark mode support
- 🌟 **Dynamic Backgrounds**: Animated particle effects for enhanced visual appeal
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🔐 **Google Sign-in**: Secure authentication with Google OAuth
- 📊 **Comprehensive Data**: 2,400+ colleges, courses, and cutoff information
- 🎯 **Location-aware**: Search by city, state, or college name
- ⚡ **Fast Performance**: Optimized for speed and efficiency

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Cloud Console account (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/neetlogiq-spec/neetlogiq.git
   cd neetlogiq
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd neetlogiq-frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env.local in neetlogiq-frontend/
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   REACT_APP_API_URL=http://localhost:5002
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   node completeServer.js
   
   # Terminal 2: Frontend
   cd neetlogiq-frontend
   npm start
   ```

5. **Open your browser**
   - Frontend: http://localhost:5001
   - Backend API: http://localhost:5002

## 🏗️ Project Structure

```
neetlogiq/
├── neetlogiq-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Main application pages
│   │   ├── context/            # React context providers
│   │   ├── config/             # Configuration files
│   │   └── utils/              # Utility functions
│   ├── public/                 # Static assets
│   └── package.json
├── backend/                    # Node.js backend server
│   ├── completeServer.js       # Main server file
│   ├── data/                   # Database and data files
│   └── package.json
└── docs/                       # Documentation
```

## 🎨 Key Components

### Frontend
- **Landing Page**: Hero section with smart search
- **Colleges Page**: Browse and search medical colleges
- **Courses Page**: Explore available courses
- **Cutoffs Page**: View admission cutoffs
- **About Page**: Platform information and team details

### Backend
- **REST API**: Comprehensive API endpoints
- **SQLite Database**: Local data storage
- **Search Engine**: Advanced search capabilities
- **City Aliases**: Smart location matching

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins and redirect URIs

### Environment Variables
```bash
# Frontend (.env.local)
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_API_URL=http://localhost:5002

# Backend (if needed)
PORT=5002
NODE_ENV=development
```

## 🚀 Deployment

### Cloudflare Pages (Recommended)
1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `cd neetlogiq-frontend && npm run build`
3. Set build output directory: `neetlogiq-frontend/build`
4. Configure environment variables
5. Deploy!

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 Data Sources

- Official government medical college databases
- Institutional websites and publications
- Verified cutoff and admission data
- Regular updates from authoritative sources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for medical aspirants
- Created by an anonymous doctor passionate about helping students
- Specialized in medical data analysis and research methodology

## 📞 Support

- Email: neetlogiq@gmail.com
- Location: Karnataka, India

---

**Made with ❤️ for the future doctors of India** 🩺