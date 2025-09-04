import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignIn from '../components/GoogleSignIn';
import UserPopup from '../components/UserPopup';

const AuthTest = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Google Auth Test</h1>
        
        <div className="space-y-6">
          {isAuthenticated ? (
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">Welcome, {user.name}!</h2>
              <div className="mb-4">
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2"
                />
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <UserPopup />
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">Sign in to continue</h2>
              <GoogleSignIn className="mx-auto" />
            </div>
          )}
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify({ isAuthenticated, user: user ? { name: user.name, email: user.email } : null }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;
