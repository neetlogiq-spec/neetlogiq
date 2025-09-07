import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const GoogleSignIn = ({ 
  className = "", 
  text = "Sign in with Google",
  size = "large",
  width = 280,
  showIcon = true,
  variant = "default" // "default", "outline", "minimal"
}) => {
  const { handleGoogleSignIn, isLoading, authError, clearAuthError } = useAuth();

  const handleClick = async () => {
    clearAuthError();
    await handleGoogleSignIn();
  };

  const getButtonStyles = () => {
    const baseStyles = "relative flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
    
    switch (variant) {
      case "outline":
        return `${baseStyles} border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-500`;
      case "minimal":
        return `${baseStyles} text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:ring-gray-500`;
      default:
        return `${baseStyles} bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-300 hover:border-gray-400 focus:ring-blue-500`;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return "w-4 h-4";
      case "medium":
        return "w-5 h-5";
      case "large":
        return "w-6 h-6";
      default:
        return "w-6 h-6";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return "text-sm";
      case "medium":
        return "text-base";
      case "large":
        return "text-lg";
      default:
        return "text-lg";
    }
  };

  const getPadding = () => {
    switch (size) {
      case "small":
        return "px-3 py-1.5";
      case "medium":
        return "px-4 py-2";
      case "large":
        return "px-6 py-3";
      default:
        return "px-6 py-3";
    }
  };

  return (
    <div className={`${className} google-signin-container`}>
      <motion.button
        onClick={handleClick}
        disabled={isLoading}
        className={`${getButtonStyles()} ${getTextSize()} ${getPadding()}`}
        style={{ width: width }}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {isLoading ? (
          <>
            <Loader2 className={`${getIconSize()} animate-spin`} />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            {showIcon && (
              <svg
                className={getIconSize()}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>{text}</span>
          </>
        )}
      </motion.button>

      {authError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-sm text-red-700">{authError}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GoogleSignIn;
