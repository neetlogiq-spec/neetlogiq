import React from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, MapPin, GraduationCap, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const EmptyState = ({ 
  type = 'search', 
  title = "No results found", 
  subtitle = "Try adjusting your search criteria",
  showIllustration = true,
  actionText = "Clear filters",
  onAction = null,
  className = ""
}) => {
  const { isDarkMode } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="w-16 h-16" />;
      case 'colleges':
        return <GraduationCap className="w-16 h-16" />;
      case 'courses':
        return <BookOpen className="w-16 h-16" />;
      case 'location':
        return <MapPin className="w-16 h-16" />;
      case 'error':
        return <AlertCircle className="w-16 h-16" />;
      default:
        return <Search className="w-16 h-16" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'search':
        return {
          icon: isDarkMode ? 'text-blue-400' : 'text-blue-500',
          bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
          border: isDarkMode ? 'border-blue-500/20' : 'border-blue-200'
        };
      case 'colleges':
        return {
          icon: isDarkMode ? 'text-green-400' : 'text-green-500',
          bg: isDarkMode ? 'bg-green-500/10' : 'bg-green-50',
          border: isDarkMode ? 'border-green-500/20' : 'border-green-200'
        };
      case 'courses':
        return {
          icon: isDarkMode ? 'text-purple-400' : 'text-purple-500',
          bg: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50',
          border: isDarkMode ? 'border-purple-500/20' : 'border-purple-200'
        };
      case 'error':
        return {
          icon: isDarkMode ? 'text-red-400' : 'text-red-500',
          bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
          border: isDarkMode ? 'border-red-500/20' : 'border-red-200'
        };
      default:
        return {
          icon: isDarkMode ? 'text-gray-400' : 'text-gray-500',
          bg: isDarkMode ? 'bg-gray-500/10' : 'bg-gray-50',
          border: isDarkMode ? 'border-gray-500/20' : 'border-gray-200'
        };
    }
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      {/* Illustration */}
      {showIllustration && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className={`relative mb-6 p-8 rounded-full ${colors.bg} ${colors.border} border-2`}
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className={colors.icon}
          >
            {getIcon()}
          </motion.div>
          
          {/* Floating particles */}
          <motion.div
            className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full"
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-2 -left-2 w-2 h-2 bg-purple-400 rounded-full"
            animate={{
              y: [0, 10, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-md"
      >
        <h3 className={`text-xl font-semibold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
        <p className={`text-sm mb-6 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {subtitle}
        </p>

        {/* Action Button */}
        {onAction && actionText && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAction}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } shadow-lg hover:shadow-xl`}
          >
            {actionText}
          </motion.button>
        )}
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-300 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-purple-300 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.6, 0.2]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </motion.div>
  );
};

export default EmptyState;
