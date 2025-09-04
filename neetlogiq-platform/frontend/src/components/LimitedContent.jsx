import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignIn from './GoogleSignIn';

const LimitedContent = ({ 
  children, 
  previewContent, 
  title = "Sign in to view full details",
  description = "Get access to complete information and personalized recommendations"
}) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="relative">
      {/* Preview Content */}
      <div className="opacity-60 pointer-events-none">
        {previewContent}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-4 border border-gray-200"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {description}
            </p>

            <GoogleSignIn className="w-full" />
            
            <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
              <Eye className="w-4 h-4 mr-1" />
              <span>Preview mode - Sign in for full access</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LimitedContent;
