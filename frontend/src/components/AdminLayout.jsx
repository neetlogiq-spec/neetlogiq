import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  TrendingUp, 
  FileText, 
  Upload, 
  Download, 
  Settings, 
  Users, 
  BarChart3,
  Menu,
  X,
  LogOut,
  Sparkles,
  Crown,
  ChevronLeft,
  ChevronRight,
  Database,
  BookOpen
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Load sidebar state from localStorage
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const location = useLocation();
  const sidebarRef = useRef(null);
  const navItemsRef = useRef([]);
  const heroRef = useRef(null);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/sector_xp_12/admin',
      icon: LayoutDashboard,
      description: 'Overview and analytics',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Colleges',
      href: '/sector_xp_12/colleges',
      icon: Building2,
      description: 'Manage college information',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Programs',
      href: '/sector_xp_12/programs',
      icon: GraduationCap,
      description: 'Manage course programs',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Cutoffs',
      href: '/sector_xp_12/cutoffs',
      icon: TrendingUp,
      description: 'Manage cutoff data',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      name: 'Cutoff Import',
      href: '/sector_xp_12/cutoff-import',
      icon: Database,
      description: 'Staging database import manager',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      name: 'Intelligent Cutoffs',
      href: '/sector_xp_12/intelligent-cutoffs',
      icon: Sparkles,
      description: 'AI-powered cutoff processing',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      name: 'Error Corrections',
      href: '/sector_xp_12/error-corrections',
      icon: BookOpen,
      description: 'Manage error correction dictionary',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      name: 'Import/Export',
      href: '/sector_xp_12/import-export',
      icon: Upload,
      description: 'CSV import and export',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      name: 'Reports',
      href: '/sector_xp_12/reports',
      icon: BarChart3,
      description: 'Analytics and reports',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Users',
      href: '/sector_xp_12/users',
      icon: Users,
      description: 'User management',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      name: 'Settings',
      href: '/sector_xp_12/settings',
      icon: Settings,
      description: 'System configuration',
      gradient: 'from-gray-500 to-slate-500'
    }
  ];

  const isActive = (href) => {
    if (href === '/sector_xp_12/admin') {
      return location.pathname === '/sector_xp_12/admin';
    }
    return location.pathname.startsWith(href);
  };

  // Initialize animations when component mounts
  useEffect(() => {
    // Temporarily disable animations to debug content visibility
    console.log('🎨 AdminLayout: Animations temporarily disabled for debugging');
    return;
    
    // Hero entrance animation
    
    // Hero entrance animation
    if (heroRef.current && window.anime) {
      window.anime.timeline()
        .add({
          targets: heroRef.current,
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 800,
          easing: 'easeOutCubic'
        })
        .add({
          targets: '.hero-stats',
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
          delay: window.anime.stagger(100),
          easing: 'easeOutCubic'
        }, '-=400');
    }

    // Sidebar entrance animation
    if (sidebarRef.current && window.anime) {
      window.anime({
        targets: sidebarRef.current,
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutCubic'
      });
    }

    // Navigation items stagger animation
    if (navItemsRef.current.length > 0 && window.anime) {
      window.anime({
        targets: navItemsRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 600,
        delay: window.anime.stagger(80),
        easing: 'easeOutCubic'
      });
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed]);

  // Animate sidebar open/close
  const handleSidebarToggle = (open) => {
    setSidebarOpen(open);
    
    if (open && window.anime) {
      // Animate sidebar opening
      window.anime({
        targets: '.mobile-sidebar',
        translateX: [-320, 0],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutCubic'
      });
    } else if (!open && window.anime) {
      // Animate sidebar closing
      window.anime({
        targets: '.mobile-sidebar',
        translateX: [0, -320],
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInCubic'
      });
    }
  };

  // Hover animations for navigation items
  const handleNavHover = (index, isHovering) => {
    const navItem = navItemsRef.current[index];
    if (navItem && window.anime) {
      if (isHovering) {
        window.anime({
          targets: navItem,
          scale: 1.02,
          translateX: 5,
          duration: 200,
          easing: 'easeOutCubic'
        });
      } else {
        window.anime({
          targets: navItem,
          scale: 1,
          translateX: 0,
          duration: 200,
          easing: 'easeOutCubic'
        });
      }
    }
  };

  // Toggle sidebar collapse
  const toggleSidebarCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    // Save to localStorage
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Test Banner - Remove this after confirming UI works */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 text-center font-bold text-lg z-50 relative">
        🎨 NEW ADMIN LAYOUT LOADED! 🎨
        <span className="text-sm font-normal ml-4">Glassmorphism design active</span>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={() => handleSidebarToggle(false)}
        />
        <div 
          ref={sidebarRef}
          className="mobile-sidebar fixed inset-y-0 left-0 flex w-80 flex-col bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/20"
        >
          <div className="flex h-20 items-center justify-between px-6 border-b border-white/20 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">NeetLogIQ</h1>
                <p className="text-blue-100 text-sm">Admin Suite</p>
              </div>
            </div>
            <button
              onClick={() => handleSidebarToggle(false)}
              className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-2xl transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  ref={el => navItemsRef.current[index] = el}
                  to={item.href}
                  className={`group relative flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 ${
                    active 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.gradient.split('-')[1]}-500/25` 
                      : 'text-gray-700 hover:bg-white/60 hover:text-gray-900 hover:shadow-lg'
                  }`}
                  onClick={() => handleSidebarToggle(false)}
                  onMouseEnter={() => handleNavHover(index, true)}
                  onMouseLeave={() => handleNavHover(index, false)}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    active ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white'
                  }`}>
                    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${active ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </p>
                    <p className={`text-sm ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                  {active && (
                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/20">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar - Collapsible - START */}
      <div ref={sidebarRef} className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-500 ease-in-out transform ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-80'
      }`}>
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/20">
          <div className={`flex h-20 items-center border-b border-white/20 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ${
            sidebarCollapsed ? 'px-4 justify-center' : 'px-6'
          }`}>
            <div className={`flex items-center transition-all duration-300 ${
              sidebarCollapsed ? 'justify-center' : 'space-x-3'
            }`}>
              <div className="p-2 bg-white/20 rounded-xl">
                <Crown className="h-6 w-6 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-white">NeetLogIQ</h1>
                  <p className="text-blue-100 text-sm">Admin Suite</p>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={toggleSidebarCollapse}
                className="ml-auto p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>
          <nav className={`flex-1 space-y-2 py-6 transition-all duration-300 ${
            sidebarCollapsed ? 'px-2' : 'px-4'
          }`}>
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  ref={el => navItemsRef.current[index] = el}
                  to={item.href}
                  className={`group relative flex items-center rounded-2xl transition-all duration-300 ${
                    sidebarCollapsed 
                      ? 'justify-center px-3 py-4' 
                      : 'space-x-4 px-4 py-4'
                  } ${
                    active 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.gradient.split('-')[1]}-500/25` 
                      : 'text-gray-700 hover:bg-white/60 hover:text-gray-900 hover:shadow-lg'
                  }`}
                  onMouseEnter={() => handleNavHover(index, true)}
                  onMouseLeave={() => handleNavHover(index, false)}
                  title={sidebarCollapsed ? `${item.name} - ${item.description}` : undefined}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    active ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white'
                  }`}>
                    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1">
                        <p className={`font-semibold ${active ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </p>
                        <p className={`text-sm ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                      {active && (
                        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className={`border-t border-white/20 transition-all duration-300 ${
            sidebarCollapsed ? 'p-2' : 'p-4'
          }`}>
            {sidebarCollapsed ? (
              <button
                onClick={toggleSidebarCollapse}
                className="w-full p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                title="Expand Sidebar"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200">
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-500 ease-in-out ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-80'
      }`}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => handleSidebarToggle(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <button
                type="button"
                className="hidden lg:flex p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
                onClick={toggleSidebarCollapse}
                title={`${sidebarCollapsed ? "Expand" : "Collapse"} Sidebar (Ctrl+B)`}
              >
                {sidebarCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {sidebarCollapsed ? "Expand" : "Collapse"} (Ctrl+B)
                </span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>Welcome back, Admin</span>
              </div>
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 min-h-screen bg-transparent">
          {/* Debug - Remove after fixing */}
          <div className="bg-blue-100 border border-blue-400 text-blue-800 p-2 rounded mb-4 text-sm">
            AdminLayout: Children received: {children ? 'YES' : 'NO'} | Type: {typeof children}
          </div>
          <div className="bg-green-100 border border-green-400 text-green-800 p-2 rounded mb-4 text-sm">
            Main content area is visible - Content should appear below
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
