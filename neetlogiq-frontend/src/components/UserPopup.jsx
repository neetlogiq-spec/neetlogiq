import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';

const UserPopup = () => {
  const { user, handleLogout } = useAuth();
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={popupRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-sm transition-all duration-200 border ${
          isDarkMode 
            ? 'bg-white/10 hover:bg-white/20 border-white/20' 
            : 'bg-gray-100/80 hover:bg-gray-200/80 border-gray-200/50'
        }`}
      >
        <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white/30">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <span className={`text-xs font-medium hidden md:block ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {user.givenName || user.name}
        </span>
        <ChevronDown 
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`} 
        />
      </button>

      {/* Popup Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 top-full mt-2 w-64 backdrop-blur-sm rounded-xl shadow-xl border z-50 ${
              isDarkMode 
                ? 'bg-white/95 border-white/20' 
                : 'bg-white/95 border-gray-200/50'
            }`}
          >
            {/* User Info Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-white/20' : 'border-gray-200/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold truncate ${
                    isDarkMode ? 'text-gray-900' : 'text-gray-900'
                  }`}>
                    {user.name}
                  </h3>
                  <p className={`text-sm truncate ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-600'
                  }`}>
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Profile/Settings Option */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Add profile/settings functionality here
                  console.log('Profile/Settings clicked');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isDarkMode 
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Profile Settings</span>
              </button>

              {/* Logout Option */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isDarkMode 
                    ? 'text-red-600 hover:bg-red-50' 
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>

            {/* Footer */}
            <div className={`px-4 py-2 border-t ${isDarkMode ? 'border-white/20' : 'border-gray-200/50'}`}>
              <p className="text-xs text-gray-500 text-center">
                Signed in with Google
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserPopup;
