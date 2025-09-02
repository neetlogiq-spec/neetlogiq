import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import ModernCard from './ui/ModernCard';
import ModernButton from './ui/ModernButton';

const SecureAdminWrapper = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const adminStatus = localStorage.getItem('isAdmin');
      const adminUsername = localStorage.getItem('adminUsername');
      
      if (adminStatus === 'true' && adminUsername) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUsername');
    setIsAuthenticated(false);
    window.location.href = '/sector_xp_12';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="text-xl font-semibold text-neutral-900 mb-2">
            Verifying Access...
          </div>
          <div className="text-neutral-600">
            Please wait while we authenticate your credentials
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <ModernCard className="p-8 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl mb-6 shadow-2xl">
              <Lock className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Access Denied
            </h1>
            
            <p className="text-neutral-600 mb-6">
              You need to be authenticated to access this area. Please log in with your admin credentials.
            </p>

            <div className="space-y-4">
              <ModernButton
                onClick={() => window.location.href = '/sector_xp_12'}
                size="lg"
                className="w-full hover-lift"
              >
                Go to Login
              </ModernButton>
              
              <ModernButton
                variant="secondary"
                onClick={() => window.location.href = '/'}
                size="md"
                className="w-full"
              >
                Return to Home
              </ModernButton>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center space-x-2 text-sm text-blue-800">
                <AlertTriangle className="w-4 h-4" />
                <span>Demo Credentials: Lone_wolf#12 / Apx_gp_delta</span>
              </div>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Admin Header */}
      <motion.div
        className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">Admin Panel</h1>
                <p className="text-xs text-neutral-500">
                  Welcome, {localStorage.getItem('adminUsername')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ModernButton
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="hover-lift"
              >
                View Site
              </ModernButton>
              
              <ModernButton
                variant="error"
                size="sm"
                onClick={handleLogout}
                className="hover-lift"
              >
                Logout
              </ModernButton>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Protected Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SecureAdminWrapper;
