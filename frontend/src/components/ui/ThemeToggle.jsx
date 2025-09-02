import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Mountain, Compass } from 'lucide-react';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme, isTransitioning } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      disabled={isTransitioning}
      className={`
        relative w-16 h-16 rounded-full shadow-2xl border-2 transition-all duration-500
        flex items-center justify-center text-white font-bold text-lg
        ${isDarkMode 
          ? 'bg-gradient-to-br from-slate-800 to-blue-900 border-amber-400/30 hover:border-amber-400/50' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-400/30 hover:border-blue-400/50'
        }
        ${isTransitioning ? 'scale-95 opacity-70' : 'hover:scale-110'}
      `}
      whileHover={{ 
        scale: isTransitioning ? 0.95 : 1.1,
        rotate: isTransitioning ? 0 : 5 
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        duration: 0.3,
        type: "spring",
        stiffness: 300
      }}
    >
      {/* Theme Icon */}
      <AnimatePresence mode="wait">
        {isDarkMode ? (
          <motion.div
            key="dark"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-1"
          >
            <Mountain className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-amber-300">Adventure</span>
          </motion.div>
        ) : (
          <motion.div
            key="light"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -180 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-1"
          >
            <Compass className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-600">WayFarer</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Label */}
      <motion.div
        className={`
          absolute -bottom-8 left-1/2 transform -translate-x-1/2 
          px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
          ${isDarkMode 
            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' 
            : 'bg-blue-500/20 text-blue-600 border border-blue-400/30'
          }
        `}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isDarkMode ? 'Dark Adventure' : 'Light WayFarer'}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
