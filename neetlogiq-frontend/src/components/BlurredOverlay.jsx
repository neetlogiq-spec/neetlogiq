import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Home, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import GoogleSignIn from './GoogleSignIn';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Meteors } from './ui/meteors';

const BlurredOverlay = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();

  console.log('BlurredOverlay rendering:', { isAuthenticated });

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="relative min-h-screen">
      {/* Blurred Background Content */}
      <div className="blur-sm pointer-events-none opacity-60">
        {children}
      </div>

      {/* Sign-in Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" style={{ display: 'grid', placeItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`relative backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-sm w-full transition-all duration-300 overflow-hidden ${
            isDarkMode 
              ? 'bg-white/90 border border-white/20' 
              : 'bg-white/95 border border-gray-200 shadow-lg'
          }`}
          style={{
            maxHeight: '80vh',
            overflowY: 'auto',
            width: '100%',
            maxWidth: '400px'
          }}
        >
          {/* Meteor Effect Background */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <Meteors number={40} className="opacity-70" />
          </div>
          
          {/* Additional meteor layer for depth */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <Meteors number={20} className="opacity-40" />
          </div>
          {/* Close Button */}
          <Link
            to="/"
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
            title="Go to Home"
          >
            <X className="w-5 h-5" />
          </Link>

          <div className="relative z-10 text-center">
            {/* Lock Icon */}
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Sign In to Access Full Content
            </h2>
            
            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Get complete access to detailed course information, college data, 
              cutoff trends, and personalized recommendations.
            </p>

                              {/* Sign-in Button */}
                  <div className="mb-4 flex justify-center">
                    <GoogleSignIn 
                      size="medium"
                      width={240}
                    />
                  </div>
            
            {/* Benefits List */}
            <div className="text-left space-y-2 mb-4">
              <h3 className="text-xs font-semibold text-gray-900 text-center mb-2">
                What you'll get:
              </h3>
              <div className="space-y-1">
                {[
                  'Complete course and college database',
                  'Historical cutoff data & trends',
                  'Advanced search and filtering',
                  'Personalized recommendations'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center text-xs text-gray-600">
                    <ArrowRight className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="text-xs text-gray-500 text-center mb-4">
              <p>Free account • No credit card required • Instant access</p>
            </div>

            {/* Skip Options */}
            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs text-gray-600 mb-2">Don't want to sign in right now?</p>
              <div className="flex gap-2">
                <Link
                  to="/"
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-xs"
                >
                  <Home className="w-3 h-3" />
                  Go to Home
                </Link>
                <Link
                  to="/about"
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-xs"
                >
                  <X className="w-3 h-3" />
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlurredOverlay;
