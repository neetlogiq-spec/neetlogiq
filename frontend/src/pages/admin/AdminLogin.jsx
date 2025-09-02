import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, GraduationCap, Zap } from 'lucide-react';
import ModernInput from '../../components/ui/ModernInput';
import ModernButton from '../../components/ui/ModernButton';
import ModernCard from '../../components/ui/ModernCard';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Basic authentication check
      if (credentials.username === 'Lone_wolf#12' && credentials.password === 'Apx_gp_delta') {
        // Store admin status in localStorage
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminUsername', credentials.username);
        
        // Redirect to admin dashboard
        window.location.href = '/sector_xp_12/dashboard';
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Admin Access
          </h1>
          <p className="text-neutral-600">
            Secure access to Medical College Management System
          </p>
        </div>

        {/* Login Form */}
        <ModernCard className="p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <ModernInput
                label="Username"
                type="text"
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter your username"
                icon={<Shield className="w-5 h-5" />}
                required
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Password Input */}
            <div>
              <ModernInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                icon={<Shield className="w-5 h-5" />}
                required
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <ModernButton
              type="submit"
              size="lg"
              loading={isLoading}
              disabled={isLoading || !credentials.username || !credentials.password}
              className="w-full hover-lift"
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
            </ModernButton>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Demo Credentials
            </h3>
            <div className="text-xs text-blue-700 space-y-1">
              <div><strong>Username:</strong> Lone_wolf#12</div>
              <div><strong>Password:</strong> Apx_gp_delta</div>
            </div>
          </div>
        </ModernCard>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-neutral-500">
            Secure access to the most advanced medical college management system
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2 text-xs text-neutral-400">
              <GraduationCap className="w-4 h-4" />
              <span>2,400+ Colleges</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-neutral-400">
              <Shield className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
