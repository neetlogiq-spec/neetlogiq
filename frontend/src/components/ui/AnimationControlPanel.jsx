import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';
import { 
  Play, 
  Pause, 
  Zap, 
  ZapOff, 
  Settings, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronUp,
  Palette,
  MousePointer,
  Move,
  Sparkles
} from 'lucide-react';

const AnimationControlPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const {
    animationsEnabled,
    animationSpeed,
    reducedMotion,
    animationPreferences,
    toggleAnimations,
    updateSpeed,
    updatePreference,
    isPageTransitionsEnabled,
    isHoverEffectsEnabled,
    isEntranceAnimationsEnabled,
    isMicroInteractionsEnabled,
    isComplexAnimationsEnabled
  } = useAnimation();

  const handleSpeedChange = (e) => {
    updateSpeed(parseFloat(e.target.value));
  };

  const togglePreference = (key) => {
    updatePreference(key, !animationPreferences[key]);
  };

  const getSpeedLabel = (speed) => {
    if (speed <= 0.5) return 'Slow';
    if (speed <= 0.8) return 'Relaxed';
    if (speed <= 1.2) return 'Normal';
    if (speed <= 1.8) return 'Fast';
    return 'Turbo';
  };

  const getSpeedColor = (speed) => {
    if (speed <= 0.5) return 'text-blue-500';
    if (speed <= 0.8) return 'text-green-500';
    if (speed <= 1.2) return 'text-gray-500';
    if (speed <= 1.8) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 300 }}
    >
      {/* Main Control Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          relative w-16 h-16 rounded-full shadow-2xl border-2 border-white/20
          flex items-center justify-center text-white font-bold text-lg
          transition-all duration-300 ease-out
          ${animationsEnabled 
            ? 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
            : 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
          }
        `}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {animationsEnabled ? (
            <motion.div
              key="enabled"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <Play className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="disabled"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ duration: 0.2 }}
            >
              <Pause className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Status Indicator */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
          animate={{
            backgroundColor: animationsEnabled ? '#10b981' : '#ef4444',
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: animationsEnabled ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      </motion.button>

      {/* Expanded Control Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-20 right-0 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-500" />
                Animation Controls
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Main Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Animations</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  animationsEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {animationsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button
                onClick={toggleAnimations}
                className={`
                  w-full py-3 px-4 rounded-xl font-medium transition-all duration-300
                  ${animationsEnabled
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                  }
                `}
              >
                {animationsEnabled ? (
                  <span className="flex items-center justify-center gap-2">
                    <Pause className="w-4 h-4" />
                    Disable Animations
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    Enable Animations
                  </span>
                )}
              </button>
            </div>

            {/* Speed Control */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Animation Speed</span>
                <span className={`text-xs font-medium ${getSpeedColor(animationSpeed)}`}>
                  {getSpeedLabel(animationSpeed)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={animationSpeed}
                  onChange={handleSpeedChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={!animationsEnabled}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.1x</span>
                  <span>1.0x</span>
                  <span>3.0x</span>
                </div>
              </div>
            </div>

            {/* Advanced Controls Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Advanced Controls</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Advanced Controls */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  {/* Page Transitions */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Move className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">Page Transitions</span>
                    </div>
                    <button
                      onClick={() => togglePreference('pageTransitions')}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        isPageTransitionsEnabled() ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                        animate={{ x: isPageTransitionsEnabled() ? 16 : 2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </button>
                  </div>

                  {/* Hover Effects */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2">
                      <MousePointer className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Hover Effects</span>
                    </div>
                    <button
                      onClick={() => togglePreference('hoverEffects')}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        isHoverEffectsEnabled() ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                        animate={{ x: isHoverEffectsEnabled() ? 16 : 2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </button>
                  </div>

                  {/* Entrance Animations */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700">Entrance Effects</span>
                    </div>
                    <button
                      onClick={() => togglePreference('entranceAnimations')}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        isEntranceAnimationsEnabled() ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                        animate={{ x: isEntranceAnimationsEnabled() ? 16 : 2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </button>
                  </div>

                  {/* Micro Interactions */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-700">Micro Interactions</span>
                    </div>
                    <button
                      onClick={() => togglePreference('microInteractions')}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        isMicroInteractionsEnabled() ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                        animate={{ x: isMicroInteractionsEnabled() ? 16 : 2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </button>
                  </div>

                  {/* Complex Animations */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-500" />
                      <span className="text-sm text-gray-700">Complex Effects</span>
                    </div>
                    <button
                      onClick={() => togglePreference('complexAnimations')}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        isComplexAnimationsEnabled() ? 'bg-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                        animate={{ x: isComplexAnimationsEnabled() ? 16 : 2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* System Status */}
            {reducedMotion && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 text-amber-700">
                  <EyeOff className="w-4 h-4" />
                  <span className="text-xs font-medium">Reduced Motion Detected</span>
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  Your system prefers reduced motion. Some animations may be disabled.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom CSS for slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </motion.div>
  );
};

export default AnimationControlPanel;
