import React, { createContext, useContext, useState, useEffect } from 'react';
import { GOOGLE_CONFIG } from '../config/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Google OAuth configuration
  const GOOGLE_CLIENT_ID = GOOGLE_CONFIG.CLIENT_ID;

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleGoogleSuccess = (response) => {
    console.log('Google login success:', response);
    
    // Decode the JWT token to get user information
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    const userData = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      image: payload.picture,
      givenName: payload.given_name,
      familyName: payload.family_name,
    };

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // You can also send this data to your backend for verification
    // sendUserDataToBackend(userData);
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login failed:', error);
    // Handle login failure
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    handleGoogleSuccess,
    handleGoogleFailure,
    handleLogout,
    GOOGLE_CLIENT_ID,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
