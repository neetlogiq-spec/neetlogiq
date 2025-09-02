import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { getApiEndpoint } from '../config/api';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logging
  console.log('AdminLogin: Current pathname:', location.pathname);
  console.log('AdminLogin: Component rendering');

  // Check if user is accessing from the correct secret path
  useEffect(() => {
    console.log('AdminLogin: useEffect triggered, pathname:', location.pathname);
    if (!location.pathname.includes('/sector_xp_12')) {
      console.log('AdminLogin: Redirecting to home');
      // Redirect to home if not accessing from secret path
      navigate('/');
      return;
    }
    console.log('AdminLogin: Valid path, staying on page');
  }, [location.pathname, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('AdminLogin: Form submitted with credentials:', credentials);
    console.log('AdminLogin: Username length:', credentials.username.length);
    console.log('AdminLogin: Password length:', credentials.password.length);
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create base64 encoded credentials
      const encodedCredentials = btoa(`${credentials.username}:${credentials.password}`);
      const apiUrl = getApiEndpoint('ADMIN_AUTH');
      console.log('AdminLogin: Making API call to:', apiUrl);
      console.log('AdminLogin: Encoded credentials:', encodedCredentials);
      console.log('AdminLogin: Authorization header:', `Basic ${encodedCredentials}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${encodedCredentials}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('AdminLogin: API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('AdminLogin: Authentication successful:', data);
        setSuccess('Authentication successful! Redirecting to admin dashboard...');
        
        // Store admin session with password for future API calls
        localStorage.setItem('adminSession', JSON.stringify({
          username: credentials.username,
          password: credentials.password, // Store password for API calls
          role: data.user.role,
          permissions: data.user.permissions,
          timestamp: new Date().toISOString()
        }));

        // Redirect to admin dashboard immediately
        console.log('AdminLogin: Redirecting to /sector_xp_12/admin');
        
        // Use hard redirect to ensure it works
        console.log('AdminLogin: Using hard redirect to /sector_xp_12/admin');
        window.location.href = '/sector_xp_12/admin';
      } else {
        const errorData = await response.json();
        console.log('AdminLogin: Authentication failed:', errorData);
        setError(errorData.message || 'Authentication failed');
      }
    } catch (err) {
      console.error('AdminLogin: Network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // If not accessing from secret path, don't render anything
  if (!location.pathname.includes('/sector_xp_12')) {
    console.log('AdminLogin: Not rendering - invalid path');
    return null;
  }

  console.log('AdminLogin: Rendering login form');
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Security Notice */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
          <p className="text-gray-300 text-sm">
            This area requires special authorization
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-black/50 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Admin Authentication</h2>
            <p className="text-gray-300 text-sm mt-2">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter username"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Sparkles className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="Enter password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-sm text-green-300">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !credentials.username || !credentials.password}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:hover:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Access Admin Panel'
              )}
            </button>
          </form>

          {/* Security Warning */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-300">
                <p className="font-medium">Security Notice</p>
                <p className="mt-1">
                  This is a restricted administrative area. All access attempts are logged and monitored.
                  Unauthorized access attempts will be reported.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-xs">
            © 2024 NeetLogIQ • Secure Admin Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
