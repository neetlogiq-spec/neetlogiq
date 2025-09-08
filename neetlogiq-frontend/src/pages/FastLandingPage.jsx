import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, MapPin, TrendingUp, Shield, Zap, Brain, Target, BookOpen, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import GoogleSignIn from '../components/GoogleSignIn';
import UserPopup from '../components/UserPopup';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LightweightVortex from '../components/LightweightVortex';
import ThemeToggle from '../components/ThemeToggle';
import ResponsiveHeader from '../components/ResponsiveHeader';

const FastLandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Minimal loading delay for better UX
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
      {/* Lightweight Background */}
      {isDarkMode ? (
        <LightweightVortex
          particleCount={30}
          baseHue={280}
          rangeHue={120}
          baseSpeed={0.05}
          rangeSpeed={0.3}
          baseRadius={0.5}
          rangeRadius={1.5}
          backgroundColor="#000000"
        />
      ) : (
        <LightweightVortex
          particleCount={20}
          baseHue={200}
          rangeHue={80}
          baseSpeed={0.03}
          rangeSpeed={0.2}
          baseRadius={1}
          rangeRadius={2}
          backgroundColor="#ffffff"
        />
      )}

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Header */}
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
                    isDarkMode ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/colleges" 
                  className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Colleges
                </Link>
                <Link 
                  to="/courses" 
                  className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Courses
                </Link>
                <Link 
                  to="/cutoffs" 
                  className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Cutoffs
                </Link>
                <Link 
                  to="/about" 
                  className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  About
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <ThemeToggle />
                {isAuthenticated ? (
                  <UserPopup />
                ) : (
                  <GoogleSignIn text="Sign In" size="medium" width={100} />
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/colleges"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[200px] text-center"
                >
                  <span className="relative z-10">Explore Colleges</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link
                  to="/courses"
                  className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[200px] text-center"
                >
                  <span className="relative z-10">Browse Courses</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-teal-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-3xl md:text-4xl font-bold mb-2 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm md:text-base ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Features Section */}
            <motion.div
              className="grid md:grid-cols-3 gap-8 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FastLandingPage;
