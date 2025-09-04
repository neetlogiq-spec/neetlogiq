// AI-Generated React Page Template
// Generated for: AboutUs
// Template: react-page
// Date: 2025-08-28

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Target, GraduationCap, Star, Shield, Zap, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import GoogleSignIn from '../components/GoogleSignIn';
import UserPopup from '../components/UserPopup';
import ResponsiveHeader from '../components/ResponsiveHeader';
import { useAuth } from '../contexts/AuthContext';
import { Vortex } from '../components/ui/vortex';
import { LightVortex } from '../components/ui/LightVortex';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const AboutUs = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoaded(true);
    }, 200); // Fast loading
    return () => clearTimeout(timer);
  }, []);

  const teamMembers = [
    {
      name: 'Anonymous Doctor',
      role: 'Founder & Creator',
      expertise: 'Medical Data Analysis & Research',
      experience: 'Medical Professional',
      image: '/images/team/doctor.jpg',
      description: 'A dedicated doctor who created this platform to help medical aspirants. Specialized in medical data analysis and research methodology. Committed to providing accurate, comprehensive information to help students achieve their medical career goals.'
    }
  ];

  const stats = [
    { number: '2,400+', label: 'Colleges Covered', icon: GraduationCap },
    { number: '28', label: 'States Covered', icon: MapPin },
    { number: 'Growing', label: 'Database', icon: Shield },
    { number: '24/7', label: 'Support Available', icon: Shield }
  ];

  const values = [
    {
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from data accuracy to user experience.',
      icon: Star,
      color: 'text-yellow-400'
    },
    {
      title: 'Innovation',
      description: 'Continuously innovating with AI-powered recommendations and cutting-edge technology.',
      icon: Zap,
      color: 'text-blue-400'
    },
    {
      title: 'Integrity',
      description: 'Maintaining the highest standards of integrity and transparency in all our services.',
      icon: Shield,
      color: 'text-green-400'
    },
    {
      title: 'Empowerment',
      description: 'Empowering students with knowledge and tools to make informed decisions.',
      icon: Target,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      {isDarkMode ? (
        <Vortex
          className="fixed inset-0 z-0"
          particleCount={550}
          baseHue={240}
          rangeHue={110}
          baseSpeed={0.12}
          rangeSpeed={1.6}
          baseRadius={1}
          rangeRadius={2.4}
          backgroundColor="#000000"
          containerClassName="fixed inset-0"
        >
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-black/40 z-10"></div>
        </Vortex>
      ) : (
        <LightVortex
          className="fixed inset-0 z-0"
          particleCount={350}
          baseHue={240}
          rangeHue={110}
          baseSpeed={0.08}
          rangeSpeed={1.2}
          baseRadius={1.5}
          rangeRadius={3}
          backgroundColor="#ffffff"
          containerClassName="fixed inset-0"
        >
          {/* Light overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-blue-50/20 to-purple-50/30 z-10"></div>
        </LightVortex>
      )}

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Desktop Header - Original Design */}
        <div className="hidden md:block">
      <motion.header
            className="flex items-center justify-between p-8"
        initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NeetLogIQ</h1>
            </div>

            <div className="flex items-center space-x-6 navbar">
              <nav className="hidden md:flex items-center space-x-8">
                <Link to="/" className={`${isDarkMode ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Home</Link>
                <Link to="/colleges" className={`${isDarkMode ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Colleges</Link>
                <Link to="/courses" className={`${isDarkMode ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Courses</Link>
                <Link to="/cutoffs" className={`${isDarkMode ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Cutoffs</Link>
                <Link to="/about" className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>About</Link>
              </nav>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Authentication Section */}
              <div className="flex items-center gap-4">
                {isAuthenticated ? (
                  <UserPopup />
                ) : (
                  <GoogleSignIn text="signin" size="medium" width={120} />
                )}
              </div>
            </div>
          </motion.header>
        </div>

        {/* Mobile Header - Responsive Design */}
        <div className="md:hidden">
          <ResponsiveHeader />
        </div>

      {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-8 py-16">
          <div className="text-center max-w-6xl w-full">
            {/* Page Title - Same style as landing page */}
            <motion.h1
              className={`text-5xl md:text-7xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              About NeetLogIQ
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto ${isDarkMode ? 'text-white/90' : 'text-gray-600'}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              Empowering medical aspirants with intelligent insights, comprehensive data, and personalized guidance
            </motion.p>

            {/* Mission Statement */}
            <motion.div
              className={`backdrop-blur-md rounded-2xl border-2 p-8 mb-16 shadow-lg ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 shadow-white/10' 
                  : 'bg-amber-50/40 border-amber-200/60 shadow-amber-200/30'
              }`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                  <Heart className="w-10 h-10 text-primary-400" />
                </div>
              </div>
              <h2 className={`text-3xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Our Mission</h2>
              <p className={`text-lg max-w-4xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-white/80' : 'text-gray-600'
              }`}>
                To revolutionize medical education accessibility by providing comprehensive, accurate, and intelligent 
                insights that help students make informed decisions about their medical careers. We believe every 
                aspiring medical professional deserves access to the best information and guidance.
              </p>
            </motion.div>

            {/* Statistics */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
                  transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{stat.number}</div>
                  <div className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Core Values */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <h2 className={`text-3xl font-bold mb-8 text-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Our Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -10 : 10 }}
                    animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : (index % 2 === 0 ? -10 : 10) }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                    className={`backdrop-blur-md p-6 rounded-2xl border-2 transition-all shadow-lg ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 hover:bg-white/20 shadow-white/10' 
                        : 'bg-amber-50/40 border-amber-200/60 hover:bg-amber-50/50 shadow-amber-200/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center`}>
                        <value.icon className={`w-6 h-6 ${value.color}`} />
                      </div>
                      <h3 className={`text-xl font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{value.title}</h3>
                    </div>
                    <p className={isDarkMode ? 'text-white/80' : 'text-gray-600'}>{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Team Section */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            >
              <h2 className={`text-3xl font-bold mb-8 text-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>About the Creator</h2>
              <div className="flex justify-center">
                <div className="grid grid-cols-1 gap-8 max-w-md">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                    transition={{ delay: 1.0 + index * 0.1, duration: 0.3 }}
                    className={`backdrop-blur-md p-6 rounded-2xl border-2 transition-all text-center shadow-lg ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 hover:bg-white/20 shadow-white/10' 
                        : 'bg-amber-50/40 border-amber-200/60 hover:bg-amber-50/50 shadow-amber-200/30'
                    }`}
                  >
                    <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-12 h-12 text-primary-400" />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{member.name}</h3>
                    <p className="text-primary-400 font-medium mb-2">{member.role}</p>
                    <p className={`text-sm mb-3 ${
                      isDarkMode ? 'text-white/70' : 'text-gray-600'
                    }`}>{member.expertise}</p>
                    <p className={`text-xs mb-3 ${
                      isDarkMode ? 'text-white/60' : 'text-gray-500'
                    }`}>Experience: {member.experience}</p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-white/80' : 'text-gray-600'
                    }`}>{member.description}</p>
                  </motion.div>
                ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Section */}
            <motion.div
              className={`backdrop-blur-md rounded-2xl border-2 p-8 shadow-lg ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 shadow-white/10' 
                  : 'bg-amber-50/40 border-amber-200/60 shadow-amber-200/30'
              }`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 1.2 }}
            >
              <h2 className={`text-3xl font-bold mb-8 text-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Get In Touch</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Email</h3>
                  <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>neetlogiq@gmail.com</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Phone</h3>
                  <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>+91 98765 43210</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Location</h3>
                  <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>Karnataka, India</p>
                </div>
            </div>
            </motion.div>
            
            {/* CTA Button */}
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 1.3 }}
            >
              <Link to="/">
                <button className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105">
                  Start Your Medical Journey
                </button>
              </Link>
            </motion.div>
          </div>
        </main>

        {/* Footer - Same style as landing page */}
        <motion.footer
          className={`text-center p-8 transition-colors duration-300 ${
            isDarkMode ? 'text-white/60' : 'text-gray-500'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 1.4 }}
        >
          <p>&copy; 2024 NeetLogIQ. All rights reserved. Built with ❤️ for medical aspirants.</p>
        </motion.footer>
        </div>
    </div>
  );
};

export default AboutUs;
