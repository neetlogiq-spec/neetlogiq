import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import GoogleSignIn from './GoogleSignIn';
import BlurredOverlay from './BlurredOverlay';

const ProtectedRoute = ({ children, fallback = null, showSignInPrompt = true }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If fallback is provided, use BlurredOverlay approach
    if (fallback) {
      return <BlurredOverlay>{fallback}</BlurredOverlay>;
    }

    if (showSignInPrompt) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sign In Required
              </h2>
              <p className="text-gray-600">
                Please sign in with Google to access detailed course and college information, 
                cutoff data, and personalized recommendations.
              </p>
            </div>

            <div className="space-y-4">
              <GoogleSignIn className="w-full" />
              
              <div className="text-sm text-gray-500">
                <p className="mb-2">With a free account, you get access to:</p>
                <ul className="text-left space-y-1">
                  <li className="flex items-center">
                    <ArrowRight className="w-4 h-4 text-green-500 mr-2" />
                    Complete course and college data
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-4 h-4 text-green-500 mr-2" />
                    Historical cutoff trends
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-4 h-4 text-green-500 mr-2" />
                    Advanced search and filters
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-4 h-4 text-green-500 mr-2" />
                    Personalized recommendations
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return null;
  }

  return children;
};

export default ProtectedRoute;
