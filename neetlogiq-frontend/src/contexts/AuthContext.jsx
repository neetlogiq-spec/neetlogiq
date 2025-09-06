import React, { createContext, useContext, useState, useEffect } from 'react';
import firebaseAuthService from '../services/firebaseAuth';

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
  const [authError, setAuthError] = useState(null);

  // Initialize Firebase auth listener
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChange((firebaseUser) => {
      console.log('🔥 Auth state changed:', firebaseUser ? 'Signed In' : 'Signed Out');
      
      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          image: firebaseUser.photoURL,
          givenName: firebaseUser.displayName?.split(' ')[0] || '',
          familyName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          emailVerified: firebaseUser.emailVerified,
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        setAuthError(null);
        
        // Save to localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
        localStorage.removeItem('user');
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google using Firebase
  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      setIsLoading(true);
      
      const result = await firebaseAuthService.signInWithGoogle();
      
      if (result.success) {
        console.log('✅ Firebase Google sign-in successful');
        // User state will be updated by the auth state listener
      } else {
        setAuthError(result.error);
        console.error('❌ Firebase Google sign-in failed:', result.error);
      }
    } catch (error) {
      const errorMessage = firebaseAuthService.getErrorMessage(error);
      setAuthError(errorMessage);
      console.error('❌ Firebase Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out using Firebase
  const handleLogout = async () => {
    try {
      setAuthError(null);
      setIsLoading(true);
      
      const result = await firebaseAuthService.signOut();
      
      if (result.success) {
        console.log('✅ Firebase sign-out successful');
        // User state will be updated by the auth state listener
      } else {
        setAuthError(result.error);
        console.error('❌ Firebase sign-out failed:', result.error);
      }
    } catch (error) {
      const errorMessage = firebaseAuthService.getErrorMessage(error);
      setAuthError(errorMessage);
      console.error('❌ Firebase sign-out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear auth error
  const clearAuthError = () => {
    setAuthError(null);
  };

  // Get user display name
  const getDisplayName = () => {
    return firebaseAuthService.getDisplayName();
  };

  // Get user photo URL
  const getPhotoURL = () => {
    return firebaseAuthService.getPhotoURL();
  };

  // Check if auth is initialized
  const isAuthInitialized = () => {
    return firebaseAuthService.isAuthInitialized();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    handleGoogleSignIn,
    handleLogout,
    clearAuthError,
    getDisplayName,
    getPhotoURL,
    isAuthInitialized,
    // Legacy compatibility
    handleGoogleSuccess: handleGoogleSignIn,
    handleGoogleFailure: (error) => setAuthError(firebaseAuthService.getErrorMessage(error)),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
