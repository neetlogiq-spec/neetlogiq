// AI-Generated React Page Template
// Generated for: Cutoffs
// Template: react-page
// Date: 2025-08-28

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, GraduationCap, Award, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import UnifiedSearchBar from '../components/UnifiedSearchBar';
import GoogleSignIn from '../components/GoogleSignIn';
import UserPopup from '../components/UserPopup';
import BlurredOverlay from '../components/BlurredOverlay';
import ResponsiveHeader from '../components/ResponsiveHeader';
import { useAuth } from '../contexts/AuthContext';
import { Vortex } from '../components/ui/vortex';
import { LightVortex } from '../components/ui/LightVortex';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const Cutoffs = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();

  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoaded(true);
    }, 200); // Fast loading
    return () => clearTimeout(timer);
  }, []);



  const years = ['2024', '2023', '2022', '2021', '2020'];
  const categories = ['All Categories', 'General', 'OBC', 'SC', 'ST', 'EWS', 'PwD'];

  const featuredCutoffs = [
    {
      college: 'All India Institute of Medical Sciences, Delhi',
      course: 'MBBS',
      category: 'General',
      year: '2024',
      openingRank: 1,
      closingRank: 50,
      totalSeats: 100,
      trend: 'up',
      change: '+5',
      description: 'Most competitive medical college in India'
    },
    {
      college: 'JIPMER Puducherry',
      course: 'MBBS',
      category: 'General',
      year: '2024',
      openingRank: 51,
      closingRank: 150,
      totalSeats: 80,
      trend: 'stable',
      change: '0',
      description: 'Premier central medical institution'
    },
    {
      college: 'King George Medical University, Lucknow',
      course: 'MBBS',
      category: 'General',
      year: '2024',
      openingRank: 151,
      closingRank: 300,
      totalSeats: 120,
      trend: 'down',
      change: '-10',
      description: 'Historic state medical college'
    }
  ];

  const allCutoffs = [
    ...featuredCutoffs,
    {
      college: 'Maulana Azad Medical College, Delhi',
      course: 'MBBS',
      category: 'General',
      year: '2024',
      openingRank: 301,
      closingRank: 500,
      totalSeats: 100,
      trend: 'up',
      change: '+15',
      description: 'Leading Delhi state medical college'
    },
    {
      college: 'Grant Medical College, Mumbai',
      course: 'MBBS',
      category: 'General',
      year: '2024',
      openingRank: 501,
      closingRank: 800,
      totalSeats: 80,
      trend: 'stable',
      change: '0',
      description: 'One of the oldest medical colleges in Asia'
    },
    {
      college: 'St. John\'s Medical College, Bangalore',
      course: 'MBBS',
      category: 'General',
      year: '2024',
      openingRank: 801,
      closingRank: 1200,
      totalSeats: 60,
      trend: 'down',
      change: '-20',
      description: 'Excellence in medical education'
    }
  ];

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Award;
    }
  };

  return (
    <BlurredOverlay>
      <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      {isDarkMode ? (
        <Vortex
          className="fixed inset-0 z-0"
          particleCount={650}
          baseHue={300}
          rangeHue={90}
          baseSpeed={0.16}
          rangeSpeed={1.7}
          baseRadius={1}
          rangeRadius={2.6}
          backgroundColor="#000000"
          containerClassName="fixed inset-0"
        >
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-black/35 z-10"></div>
        </Vortex>
      ) : (
        <LightVortex
          className="fixed inset-0 z-0"
          particleCount={450}
          baseHue={300}
          rangeHue={90}
          baseSpeed={0.12}
          rangeSpeed={1.5}
          baseRadius={1.5}
          rangeRadius={3}
          backgroundColor="#ffffff"
          containerClassName="fixed inset-0"
        >
          {/* Light overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-indigo-50/30 z-10"></div>
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
                <Link to="/cutoffs" className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>Cutoffs</Link>
                <Link to="/about" className={`${isDarkMode ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>About</Link>
              </nav>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Authentication Section */}
              <div className="flex items-center gap-4">
                {isAuthenticated ? (
                  <UserPopup />
                ) : (
                  <GoogleSignIn text="Sign In" size="medium" width={100} />
                )}
              </div>
            </div>
          </motion.header>
        </div>

        {/* Mobile Header - Responsive Design */}
        <div className="md:hidden">
          <ResponsiveHeader />
        </div>

        {/* COMING SOON Banner - Bigger and More Prominent */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
        transition={{ duration: 0.6 }}
          className="relative z-20 bg-gradient-to-r from-orange-500 to-red-500 text-white py-8 px-4 text-center shadow-2xl"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Award className="w-8 h-8 animate-pulse" />
              <span className="text-2xl md:text-3xl font-bold">🚀 COMING SOON</span>
              <Award className="w-8 h-8 animate-pulse" />
            </div>
            <p className="text-lg md:text-xl mb-3 opacity-95 font-semibold">
              NEET Cutoff Analysis feature is under development. Stay tuned for comprehensive cutoff data and trends!
            </p>
            <div className="bg-yellow-400/20 border border-yellow-300/30 rounded-lg p-4 mt-4">
              <p className="text-yellow-100 text-base md:text-lg font-medium">
                ⚠️ <strong>Important Notice:</strong> The cutoff data displayed below is mock data for demonstration purposes only and does not represent actual NEET cutoff information.
          </p>
        </div>
          </div>
        </motion.div>

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
              NEET Cutoffs
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto ${isDarkMode ? 'text-white/90' : 'text-gray-600'}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              Track admission trends, analyze cutoff patterns, and make informed decisions for your medical career
            </motion.p>

            {/* Advanced Search Bar */}
            <motion.div
              className="max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <UnifiedSearchBar
                placeholder="Search cutoffs with AI-powered intelligence..."
                contentType="cutoffs"
                onSearchResults={(searchResult) => {
                  console.log("🔍 Unified search results for cutoffs:", searchResult);
                  
                  if (searchResult.results && searchResult.results.length > 0) {
                    console.log("🔍 Setting cutoffs to search results:", searchResult.results.length, "cutoffs");
                    
                    // Convert search results to cutoff format for display
                    const searchCutoffs = searchResult.results.map(result => ({
                      id: result.id,
                      college: result.college,
                      course: result.course,
                      category: result.category,
                      cutoff_rank: result.cutoff_rank,
                      year: result.year,
                      score: result.score,
                      description: `${result.college} - ${result.course} (${result.category}) - Rank: ${result.cutoff_rank}`
                    }));
                    
                    // For now, we'll just log the results since cutoffs don't have state management yet
                    console.log("🔍 Search Cutoffs results:", searchCutoffs);
                    // TODO: Add state management for cutoffs when needed
                  } else {
                    console.log("🔍 No search results to display for cutoffs");
                  }
                }}
                debounceMs={300}
                showSuggestions={true}
                showAIInsight={true}
              />
            </motion.div>

            {/* Filters */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center mb-16"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className={`px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/90 backdrop-blur-sm text-gray-900' 
                    : 'bg-white/95 backdrop-blur-sm text-gray-900 shadow-lg border border-gray-200'
                }`}
              >
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/90 backdrop-blur-sm text-gray-900' 
                    : 'bg-white/95 backdrop-blur-sm text-gray-900 shadow-lg border border-gray-200'
                }`}
              >
                {categories.map((category, index) => (
                  <option key={index} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Featured Cutoffs Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              {featuredCutoffs.map((cutoff, index) => {
                const TrendIcon = getTrendIcon(cutoff.trend);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
                    transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
                    className={`backdrop-blur-md p-6 rounded-2xl border-2 transition-all shadow-lg ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 hover:bg-white/20 shadow-white/10' 
                        : 'bg-purple-50/40 border-purple-200/60 hover:bg-purple-50/50 shadow-purple-200/30'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-8 h-8 text-primary-400" />
                      </div>
                      <h3 className={`text-xl font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{cutoff.college}</h3>
                      <p className={`text-sm mb-3 ${
                        isDarkMode ? 'text-white/80' : 'text-gray-600'
                      }`}>{cutoff.description}</p>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className={`flex items-center justify-between text-sm ${
                        isDarkMode ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        <span>Course: {cutoff.course}</span>
                        <span>Category: {cutoff.category}</span>
                      </div>
                      <div className={`flex items-center justify-between text-sm ${
                        isDarkMode ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        <span>Year: {cutoff.year}</span>
                        <span>Seats: {cutoff.totalSeats}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className={`flex items-center justify-between text-sm ${
                        isDarkMode ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        <span>Opening Rank: {cutoff.openingRank}</span>
                        <span>Closing Rank: {cutoff.closingRank}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <TrendIcon className={`w-5 h-5 ${getTrendColor(cutoff.trend)}`} />
                        <span className={`text-sm ${getTrendColor(cutoff.trend)}`}>
                          {cutoff.change === '0' ? 'Stable' : cutoff.change}
                        </span>
                      </div>
                      <span className={`text-sm ${
                        isDarkMode ? 'text-white/80' : 'text-gray-600'
                      }`}>Trend</span>
            </div>
            
                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                      View Details
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* All Cutoffs Section */}
            <motion.div
              className={`backdrop-blur-md rounded-2xl border-2 p-8 shadow-lg ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 shadow-white/10' 
                  : 'bg-purple-50/40 border-purple-200/60 shadow-purple-200/30'
              }`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              <h2 className={`text-3xl font-bold mb-8 text-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>All NEET Cutoffs</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {allCutoffs.map((cutoff, index) => {
                  const TrendIcon = getTrendIcon(cutoff.trend);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -10 : 10 }}
                      animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : (index % 2 === 0 ? -10 : 10) }}
                      transition={{ delay: 0.9 + index * 0.03, duration: 0.3 }}
                      className={`backdrop-blur-sm p-4 rounded-xl border transition-all ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                          : 'bg-gray-50/80 border-gray-200/30 hover:bg-gray-100/80'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-6 h-6 text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold mb-1 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{cutoff.college}</h3>
                          <div className={`flex items-center space-x-4 text-sm mb-2 ${
                            isDarkMode ? 'text-white/70' : 'text-gray-600'
                          }`}>
                            <span>{cutoff.course}</span>
                            <span>•</span>
                            <span>{cutoff.category}</span>
                          </div>
                          <p className={`text-sm mb-3 ${
                            isDarkMode ? 'text-white/80' : 'text-gray-600'
                          }`}>{cutoff.description}</p>
                          <div className={`flex items-center justify-between text-sm ${
                            isDarkMode ? 'text-white/70' : 'text-gray-600'
                          }`}>
                            <span>Rank: {cutoff.openingRank}-{cutoff.closingRank}</span>
                            <div className="flex items-center space-x-2">
                              <TrendIcon className={`w-4 h-4 ${getTrendColor(cutoff.trend)}`} />
                              <span className={getTrendColor(cutoff.trend)}>
                                {cutoff.change === '0' ? 'Stable' : cutoff.change}
                              </span>
                            </div>
                            <button className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-lg transition-colors text-xs">
                              Learn More
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Load More Button */}
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 1.0 }}
            >
              <button className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105">
                Load More Cutoffs
              </button>
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
          transition={{ duration: 0.3, delay: 1.1 }}
        >
          <p>&copy; 2024 NeetLogIQ. All rights reserved. Built with ❤️ for medical aspirants.</p>
        </motion.footer>
        </div>
    </div>
    </BlurredOverlay>
  );
};

export default Cutoffs;
