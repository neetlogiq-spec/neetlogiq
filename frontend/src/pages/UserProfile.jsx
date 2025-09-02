// AI-Generated React Page Template
// Generated for: UserProfile
// Template: default
// Date: 2025-08-28

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const UserProfile = () => {
  const { isDarkMode } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Auto-generated data loading
    const loadData = async () => {
      try {
        // Replace with actual API call
        const response = await fetch('/api/{{pageName.toLowerCase()}}');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error loading UserProfile data:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading UserProfile</h2>
          <p className="text-lg text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            UserProfile
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Auto-generated page with modern design and animations
          </p>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="py-20 px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Content sections will be auto-generated based on page type */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Welcome to UserProfile
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                This is an AI-generated page template. Customize the content, 
                styling, and functionality to match your requirements.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </motion.button>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-gray-100 p-8 rounded-2xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Features
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Auto-generated structure
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Modern animations
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Responsive design
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Theme integration
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default UserProfile;
