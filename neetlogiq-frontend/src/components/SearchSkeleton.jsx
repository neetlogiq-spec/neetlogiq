import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const SearchSkeleton = ({ count = 3, type = 'college' }) => {
  const { isDarkMode } = useTheme();

  const SkeletonCard = ({ index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-6 rounded-xl border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Icon skeleton */}
        <div className={`w-12 h-12 rounded-lg animate-pulse ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`} />
        
        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className={`h-5 rounded animate-pulse ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} style={{ width: `${Math.random() * 40 + 60}%` }} />
            <div className={`h-4 rounded animate-pulse ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} style={{ width: `${Math.random() * 30 + 40}%` }} />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className={`h-3 rounded animate-pulse ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} style={{ width: '100%' }} />
            <div className={`h-3 rounded animate-pulse ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} style={{ width: `${Math.random() * 20 + 70}%` }} />
          </div>
          
          {/* Tags skeleton */}
          <div className="flex space-x-2">
            <div className={`h-6 rounded-full animate-pulse ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} style={{ width: '60px' }} />
            <div className={`h-6 rounded-full animate-pulse ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} style={{ width: '80px' }} />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </div>
  );
};

export default SearchSkeleton;
