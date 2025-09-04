import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Colleges from './pages/Colleges';
import Courses from './pages/Courses';
import Cutoffs from './pages/Cutoffs';
import AboutUs from './pages/AboutUs';
import Admin from './pages/Admin';
import SearchDemo from './pages/SearchDemo';
import LoadingDemo from './components/LoadingDemo';
import AuthTest from './pages/AuthTest';
import VortexDemo from './components/VortexDemo';
import BackToTopButton from './components/BackToTopButton';
import AICommandPalette from './components/AICommandPalette';

const App = () => {
  const [isAICommandPaletteOpen, setIsAICommandPaletteOpen] = useState(false);

  // Clear old cache on app load (only once)
  useEffect(() => {
    const clearOldCache = async () => {
      console.log('App loaded - checking for old cache...');
      
      // Clear all caches on first load
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (let cacheName of cacheNames) {
          if (cacheName.includes('medcounsel')) {
            await caches.delete(cacheName);
            console.log('Deleted old cache:', cacheName);
          }
        }
      }
    };

    clearOldCache();
  }, []);

  // Keyboard shortcut for AI Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsAICommandPaletteOpen(true);
      }
      if (event.key === 'Escape') {
        setIsAICommandPaletteOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="App">
            <Routes>
              {/* Public Routes - No authentication required */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutUs />} />
              
              {/* Protected Routes with blur overlay for unauthenticated users */}
              <Route path="/colleges" element={
                <ProtectedRoute showSignInPrompt={false} fallback={<Colleges />}>
                  <Colleges />
                </ProtectedRoute>
              } />
              <Route path="/courses" element={
                <ProtectedRoute showSignInPrompt={false} fallback={<Courses />}>
                  <Courses />
                </ProtectedRoute>
              } />
              <Route path="/cutoffs" element={
                <ProtectedRoute showSignInPrompt={false} fallback={<Cutoffs />}>
                  <Cutoffs />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes - Authentication required */}
              <Route path="/neetlogiq-admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              
              {/* Demo/Test Routes - Authentication required */}
              <Route path="/search-demo" element={
                <ProtectedRoute>
                  <SearchDemo />
                </ProtectedRoute>
              } />
              <Route path="/loading-demo" element={
                <ProtectedRoute>
                  <LoadingDemo />
                </ProtectedRoute>
              } />
              <Route path="/auth-test" element={
                <ProtectedRoute>
                  <AuthTest />
                </ProtectedRoute>
              } />
              <Route path="/vortex-demo" element={<VortexDemo />} />
            </Routes>
            <BackToTopButton />
            
            {/* AI Command Palette */}
            <AICommandPalette 
              isVisible={isAICommandPaletteOpen}
              onClose={() => setIsAICommandPaletteOpen(false)}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
