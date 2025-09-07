import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, MapPin, TrendingUp, Shield, Zap, Brain, Target, BookOpen, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import GoogleSignIn from '../components/GoogleSignIn';
import UserPopup from '../components/UserPopup';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Vortex } from '../components/ui/vortex';
import { LightVortex } from '../components/ui/LightVortex';
import ThemeToggle from '../components/ThemeToggle';
import AISearchModal from '../components/AISearchModal';
import ResponsiveHeader from '../components/ResponsiveHeader';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery] = useState('');
  const [isAISearchModalOpen, setIsAISearchModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Simulate loading delay for the opening animation
    const timer = setTimeout(() => {
        setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut for AI search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsAISearchModalOpen(true);
      }
      if (event.key === 'Escape') {
        setIsAISearchModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Removed handleSearch function as it's no longer needed with MobileOptimizedSearchBar

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
        {/* Header - Original Design for Desktop, Responsive for Mobile */}
        <div className="hidden md:block">
      <motion.header
            className="flex items-center justify-between p-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -50 }}
            transition={{ duration: 0.25, delay: 0.05 }}
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
                  to="/" 
                  className={`transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-white' 
                      : 'text-gray-900'
                  }`}
                >
                  Home
                </Link>
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
                  <GoogleSignIn text="Sign In" size="medium" width={120} />
                )}
              </div>
            </div>
          </motion.header>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <ResponsiveHeader />
        </div>

      {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 pt-8">
          <div className="text-center max-w-4xl">
            {/* Main Title */}
            <motion.h1
              className={`text-6xl md:text-8xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
              transition={{ duration: 0.3, delay: 0.1 }}
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
              transition={{ duration: 0.25, delay: 0.15 }}
            >
              Your Gateway to Medical Education Excellence
            </motion.p>

            {/* Hero Section with CTA Buttons */}
            <motion.div
              className="max-w-4xl mx-auto mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Colleges Card */}
                <Link to="/colleges" className="group">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white/30 transition-all duration-300">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Explore Colleges</h3>
                      <p className="text-blue-100 text-sm">Browse 2,400+ medical colleges across India</p>
                    </div>
                    <div className="flex items-center justify-center text-blue-200 text-xs mt-3">
                      <span>Discover Now</span>
                      <motion.div
                        className="ml-1"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        →
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
                
                {/* Courses Card */}
                <Link to="/courses" className="group">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white/30 transition-all duration-300">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">View Courses</h3>
                      <p className="text-purple-100 text-sm">Discover medical courses and specializations</p>
                    </div>
                    <div className="flex items-center justify-center text-purple-200 text-xs mt-3">
                      <span>Explore Courses</span>
                      <motion.div
                        className="ml-1"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                      >
                        →
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
                
                {/* Cutoffs Card */}
                <Link to="/cutoffs" className="group">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-xl h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white/30 transition-all duration-300">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Check Cutoffs</h3>
                      <p className="text-green-100 text-sm">View admission cutoffs and requirements</p>
                    </div>
                    <div className="flex items-center justify-center text-green-200 text-xs mt-3">
                      <span>View Cutoffs</span>
                      <motion.div
                        className="ml-1"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                      >
                        →
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </motion.div>

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
        
        {/* AI Search Modal */}
        <AISearchModal 
          isVisible={isAISearchModalOpen}
          onClose={() => setIsAISearchModalOpen(false)}
          initialQuery={searchQuery}
        />
    </div>
  );
};

export default LandingPage;
