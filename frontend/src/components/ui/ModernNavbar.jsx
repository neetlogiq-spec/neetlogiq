import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Search, 
  GraduationCap, 
  User, 
  LogOut,
  Settings,
  BarChart3,
  Database,
  Shield
} from 'lucide-react';
import ModernButton from './ModernButton';
import ModernInput from './ModernInput';

const ModernNavbar = ({ 
  isAdmin = false,
  onSearch,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const navigation = [
    { name: 'Colleges', href: '/colleges', icon: GraduationCap },
    { name: 'Courses', href: '/courses', icon: Database },
    { name: 'Cutoffs', href: '/cutoffs', icon: BarChart3 },
    { name: 'About', href: '/about', icon: Shield }
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/sector_xp_12', icon: BarChart3 },
    { name: 'Colleges', href: '/sector_xp_12/colleges', icon: GraduationCap },
    { name: 'Programs', href: '/sector_xp_12/programs', icon: Database },
    { name: 'Cutoffs', href: '/sector_xp_12/intelligent-cutoffs', icon: BarChart3 },
    { name: 'Analytics', href: '/sector_xp_12/analytics', icon: BarChart3 },
    { name: 'Users', href: '/sector_xp_12/users', icon: User }
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20' 
          : 'bg-transparent'
      } ${className}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">Medical College Finder</h1>
              <p className="text-xs text-neutral-500">Your Trusted Guide</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </motion.a>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <ModernInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search colleges, courses..."
                size="sm"
                icon={<Search className="w-4 h-4" />}
                className="bg-white/80 backdrop-blur-sm border-white/20 focus:bg-white"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {isAdmin ? (
              <ModernButton
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/sector_xp_12'}
                className="hidden sm:flex"
              >
                <User className="w-4 h-4 mr-2" />
                Admin Panel
              </ModernButton>
            ) : (
              <ModernButton
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = '/sector_xp_12'}
                className="hidden sm:flex"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Access
              </ModernButton>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30"
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-neutral-700" />
              ) : (
                <Menu className="w-6 h-6 text-neutral-700" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="lg:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/95 backdrop-blur-md border-t border-white/20 shadow-xl">
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Search */}
                <div className="mb-6">
                  <ModernInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search colleges, courses..."
                    icon={<Search className="w-5 h-5" />}
                    className="bg-white border-neutral-200"
                  />
                </div>

                {/* Navigation Links */}
                <div className="space-y-2">
                  {navigation.map((item) => (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                      whileHover={{ x: 5 }}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </motion.a>
                  ))}
                </div>

                {/* Admin Section */}
                {isAdmin && (
                  <div className="pt-4 border-t border-neutral-200">
                    <h3 className="px-4 text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                      Admin Panel
                    </h3>
                    <div className="space-y-2">
                      {adminNavigation.map((item) => (
                        <motion.a
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                          whileHover={{ x: 5 }}
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-neutral-200">
                  <div className="grid grid-cols-2 gap-3">
                    <ModernButton
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        window.location.href = '/colleges';
                        setIsOpen(false);
                      }}
                      className="w-full"
                    >
                      Explore Colleges
                    </ModernButton>
                    <ModernButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        window.location.href = '/sector_xp_12';
                        setIsOpen(false);
                      }}
                      className="w-full"
                    >
                      Admin Access
                    </ModernButton>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default ModernNavbar;
