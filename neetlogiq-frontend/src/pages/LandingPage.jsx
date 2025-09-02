import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, GraduationCap, MapPin, Users, TrendingUp, Shield, Zap, Brain, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleSignIn from '../components/GoogleSignIn';
import UserPopup from '../components/UserPopup';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Vortex } from '../components/ui/vortex';
import { LightVortex } from '../components/ui/LightVortex';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading delay for the opening animation
    const timer = setTimeout(() => {
        setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      
      // Smart search type detection and redirect
      
      // 1. Check for cutoff/rank related searches first (most specific)
      if (query.includes('cutoff') || query.includes('rank') || query.includes('score') ||
          query.includes('percentile') || query.includes('opening') || query.includes('closing') ||
          query.includes('neet rank') || query.includes('all india rank')) {
        navigate(`/cutoffs?search=${encodeURIComponent(searchQuery.trim())}`);
      }
      // 2. Check for specific course names (but not college abbreviations)
      else if ((query.includes('mbbs') || query.includes('bds') || query.includes('md') || 
                query.includes('ms') || query.includes('diploma') || query.includes('dnb') || 
                query.includes('mch') || query.includes('dm')) && 
               !query.match(/\b(aiims|jipmer|pgimer|nimhans|kgmc|gmch|amc|jnmc|kims|kims|srm|manipal|christian|st\.?johns?|lady\s+hardinge|maulana\s+azad|safdarjung|ram\s+manohar|lok\s+nayak|govt\.?\s+medical|medical\s+college)\b/)) {
        // Only redirect to courses if it's clearly a course search, not a college abbreviation
        navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      }
      // 3. Check for college-related searches (college names, abbreviations, locations)
      else if (query.includes('college') || query.includes('institute') || query.includes('university') ||
               query.includes('medical') || query.includes('dental') || query.includes('hospital') ||
               query.match(/\b(aiims|jipmer|pgimer|nimhans|kgmc|gmch|amc|jnmc|kims|srm|manipal|christian|st\.?johns?|lady\s+hardinge|maulana\s+azad|safdarjung|ram\s+manohar|lok\s+nayak|govt\.?\s+medical|medical\s+college)\b/) ||
               query.match(/\b(delhi|mumbai|bangalore|chennai|kolkata|hyderabad|pune|ahmedabad|jaipur|lucknow|patna|bhubaneswar|chandigarh|karnataka|maharashtra|tamil\s+nadu|west\s+bengal|gujarat|rajasthan|uttar\s+pradesh|bihar|odisha|punjab)\b/)) {
        navigate(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`);
      }
      // 4. Default to colleges page for everything else
      else {
        navigate(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const stats = [
    { icon: GraduationCap, value: '2,400+', label: 'Colleges Covered', color: 'text-blue-400' },
    { icon: MapPin, value: '28', label: 'States Covered', color: 'text-green-400' },
    { icon: Shield, value: 'Growing', label: 'Database', color: 'text-purple-400' },
    { icon: TrendingUp, value: '24/7', label: 'Support Available', color: 'text-orange-400' }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Expert Guidance',
      description: 'Get personalized counseling advice from medical education experts'
    },
    {
      icon: Zap,
      title: 'Real-time Data',
      description: 'Access latest cutoff trends and admission statistics'
    },
    {
      icon: GraduationCap,
      title: 'Smart Matching',
      description: 'AI-powered college recommendations based on your profile'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden transition-all duration-500">
      {/* Dynamic Background based on theme */}
      {isDarkMode ? (
        <Vortex
          className="fixed inset-0 z-0"
          particleCount={800}
          baseHue={280}
          rangeHue={120}
          baseSpeed={0.2}
          rangeSpeed={2.0}
          baseRadius={1}
          rangeRadius={3}
          backgroundColor="#000000"
          containerClassName="fixed inset-0"
        >
          {/* Subtle overlay for text readability without blocking particles */}
          <div className="absolute inset-0 bg-black/20 z-10"></div>
        </Vortex>
      ) : (
        <LightVortex
          className="fixed inset-0 z-0"
          particleCount={400}
          baseHue={200}
          rangeHue={80}
          baseSpeed={0.12}
          rangeSpeed={1.5}
          baseRadius={2.5}
          rangeRadius={4}
          backgroundColor="#ffffff"
          containerClassName="fixed inset-0"
        >
          {/* Light overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 z-10"></div>
        </LightVortex>
      )}

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Header */}
      <motion.header
          className="flex items-center justify-between p-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -50 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>NeetLogIQ</h1>
          </div>

          <div className="flex items-center space-x-6 navbar">
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/colleges" 
                className={`transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-white/80 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Colleges
              </Link>
              <Link 
                to="/courses" 
                className={`transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-white/80 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Courses
              </Link>
              <Link 
                to="/cutoffs" 
                className={`transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-white/80 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Cutoffs
              </Link>
              <Link 
                to="/about" 
                className={`transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-white/80 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                About
              </Link>
            </nav>
            
            {/* Theme Toggle and Authentication Section */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <UserPopup />
              ) : (
                <GoogleSignIn text="signin" size="medium" width={120} />
              )}
            </div>
        </div>
      </motion.header>

      {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-8">
          <div className="text-center max-w-4xl">
            {/* Main Title */}
            <motion.h1
              className={`text-6xl md:text-8xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              NeetLogIQ
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className={`text-xl md:text-2xl mb-12 max-w-2xl mx-auto transition-colors duration-300 ${
                isDarkMode ? 'text-white/90' : 'text-gray-700'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Your Gateway to Medical Education Excellence
            </motion.p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search colleges, courses, or cutoffs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-6 py-4 text-lg rounded-2xl border-0 focus:ring-4 focus:ring-primary-500/50 focus:outline-none transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-600' 
                      : 'bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg border border-gray-200'
                  }`}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-colors"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </motion.form>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-white/20' 
                      : 'bg-white/60 shadow-lg border border-white/50'
                  }`}>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className={`text-2xl font-bold mb-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{stat.value}</div>
                  <div className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-600'
                  }`}>{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Data Source Note */}
            <motion.p
              className={`text-sm text-center mb-8 transition-colors duration-300 ${
                isDarkMode ? 'text-white/60' : 'text-gray-500'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
            >
              📊 All data sourced from official government and institutional sources
            </motion.p>

            {/* Features */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              {features.map((feature, index) => (
                <div key={index} className={`backdrop-blur-sm p-6 rounded-2xl border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-white/80 border-white/50 shadow-lg'
                }`}>
                  <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{feature.title}</h3>
                  <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-600'
                  }`}>{feature.description}</p>
            </div>
              ))}
            </motion.div>
            
            {/* BMAD AI Section */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div className={`bg-gradient-to-r from-primary-500/20 to-secondary-500/20 backdrop-blur-sm p-8 rounded-3xl border transition-all duration-300 ${
                isDarkMode 
                  ? 'border-white/20' 
                  : 'border-white/50 shadow-xl'
              }`}>
                <div className="text-center mb-8">
                  <Brain className="w-20 h-20 text-primary-400 mx-auto mb-4" />
                  <h3 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>🤖 BMAD AI Intelligence</h3>
                  <p className={`text-xl max-w-3xl mx-auto transition-colors duration-300 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Experience the future of medical education guidance with our AI-powered recommendation system
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                      isDarkMode ? 'bg-white/20' : 'bg-white/60 shadow-lg'
                    }`}>
                      <GraduationCap className="w-8 h-8 text-primary-400" />
                    </div>
                    <h4 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Smart College Matching</h4>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white/70' : 'text-gray-600'
                    }`}>AI-powered college recommendations based on your score and preferences</p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                      isDarkMode ? 'bg-white/20' : 'bg-white/60 shadow-lg'
                    }`}>
                      <Target className="w-8 h-8 text-primary-400" />
                    </div>
                    <h4 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Course Intelligence</h4>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white/70' : 'text-gray-600'
                    }`}>Personalized course suggestions aligned with your career goals</p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                      isDarkMode ? 'bg-white/20' : 'bg-white/60 shadow-lg'
                    }`}>
                      <TrendingUp className="w-8 h-8 text-primary-400" />
                    </div>
                    <h4 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Career Path Analysis</h4>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white/70' : 'text-gray-600'
                    }`}>AI-driven insights into medical career opportunities and trends</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <button className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105">
                    🚀 Try BMAD AI Now
                  </button>
                  <p className={`text-sm mt-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-white/60' : 'text-gray-500'
                  }`}>
                    Click to experience AI-powered medical education guidance
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <motion.footer
          className={`text-center p-8 transition-colors duration-300 ${
            isDarkMode ? 'text-white/60' : 'text-gray-500'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <p>&copy; 2024 NeetLogIQ. All rights reserved. Built with ❤️ for medical aspirants.</p>
        </motion.footer>
        </div>
    </div>
  );
};

export default LandingPage;
