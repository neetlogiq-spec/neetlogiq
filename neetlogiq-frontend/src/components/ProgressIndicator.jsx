import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, BrainCircuit, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ProgressIndicator = ({ 
  isVisible = false,
  currentStep = 0,
  totalSteps = 3,
  currentAction = "Searching...",
  searchType = "regular",
  resultsCount = 0,
  className = ""
}) => {
  const { isDarkMode } = useTheme();

  const steps = [
    { id: 1, label: "Analyzing query", icon: Search },
    { id: 2, label: searchType === 'ai' ? "AI processing" : "Searching database", icon: searchType === 'ai' ? BrainCircuit : Search },
    { id: 3, label: "Preparing results", icon: CheckCircle }
  ];

  const getProgressColor = () => {
    if (searchType === 'ai') {
      return {
        primary: isDarkMode ? 'text-blue-400' : 'text-blue-500',
        bg: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100',
        border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200'
      };
    }
    return {
      primary: isDarkMode ? 'text-green-400' : 'text-green-500',
      bg: isDarkMode ? 'bg-green-500/20' : 'bg-green-100',
      border: isDarkMode ? 'border-green-500/30' : 'border-green-200'
    };
  };

  const colors = getProgressColor();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
        >
          <div className={`relative p-4 rounded-xl shadow-lg border backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-gray-800/95 border-gray-700' 
              : 'bg-white/95 border-gray-200'
          }`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={colors.primary}
              >
                <Loader2 className="w-5 h-5" />
              </motion.div>
              <div>
                <h4 className={`font-medium text-sm ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentAction}
                </h4>
                {resultsCount > 0 && (
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Found {resultsCount} results
                  </p>
                )}
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              {steps.map((step, index) => {
                const isActive = currentStep >= step.id;
                const isCurrent = currentStep === step.id;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex items-center">
                    {/* Step Circle */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ 
                        scale: isActive ? 1 : 0.8,
                        opacity: isActive ? 1 : 0.5
                      }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isActive
                          ? `${colors.bg} ${colors.border} ${colors.primary}`
                          : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-500'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCurrent ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-4 h-4" />
                        </motion.div>
                      ) : isActive ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <span className="text-xs font-medium">{step.id}</span>
                      )}
                    </motion.div>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ 
                          scaleX: currentStep > step.id ? 1 : 0.3,
                          opacity: currentStep > step.id ? 1 : 0.3
                        }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`w-8 h-0.5 mx-1 ${
                          currentStep > step.id
                            ? colors.primary.replace('text-', 'bg-')
                            : isDarkMode
                              ? 'bg-gray-600'
                              : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: currentStep / totalSteps }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`mt-3 h-1 rounded-full origin-left ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <motion.div
                className={`h-full rounded-full ${
                  searchType === 'ai'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: currentStep / totalSteps }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </motion.div>

            {/* Floating particles */}
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full"
              animate={{
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-400 rounded-full"
              animate={{
                y: [0, 5, 0],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProgressIndicator;
