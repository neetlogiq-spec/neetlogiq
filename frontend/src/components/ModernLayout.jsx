import React, { useState, useEffect } from 'react';
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
  Search,
  Bell,
  User,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const ModernLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      description: 'Overview and analytics',
      badge: null
    },
    {
      name: 'Colleges',
      href: '/admin/colleges',
      icon: Building2,
      description: 'Manage college information',
      badge: 'New'
    },
    {
      name: 'Programs',
      href: '/admin/programs',
      icon: GraduationCap,
      description: 'Manage course programs',
      badge: null
    },
    {
      name: 'Cutoffs',
      href: '/admin/cutoffs',
      icon: TrendingUp,
      description: 'Manage cutoff data',
      badge: 'Hot'
    },
    {
      name: 'Import/Export',
      href: '/admin/import-export',
      icon: Upload,
      description: 'CSV import and export',
      badge: null
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: BarChart3,
      description: 'Analytics and reports',
      badge: null
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      description: 'User management',
      badge: null
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'System configuration',
      badge: null
    }
  ];

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className="fixed inset-y-0 left-0 flex w-80 flex-col">
          <div className="flex h-20 items-center justify-between px-6 border-b border-white/20 bg-white/10 backdrop-blur-xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  NeetLogIQ
                </h1>
                <p className="text-xs text-gray-500 font-medium">Enterprise Admin</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
          
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 shadow-lg shadow-blue-500/25 border border-blue-200/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/40 hover:shadow-lg hover:shadow-gray-500/10'
                  }`}
                >
                  <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100/50 group-hover:bg-white/80'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.badge === 'New' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.description}
                    </p>
                  </div>
                  {isActive(item.href) && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-2xl shadow-gray-900/5">
          <div className="flex h-20 items-center px-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white animate-pulse shadow-lg"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  NeetLogIQ
                </h1>
                <p className="text-sm text-gray-500 font-medium">Enterprise Admin Portal</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-3 px-4 py-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative flex items-center px-4 py-4 text-sm font-medium rounded-2xl transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 shadow-xl shadow-blue-500/25 border border-blue-200/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:shadow-xl hover:shadow-gray-500/10'
                  }`}
                >
                  <div className={`relative p-3 rounded-xl transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl'
                      : 'bg-gray-100/50 group-hover:bg-white/80'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{item.name}</span>
                      {item.badge && (
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          item.badge === 'New' 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' 
                            : 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {item.description}
                    </p>
                  </div>
                  {isActive(item.href) && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-full shadow-lg"></div>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* User section */}
          <div className="border-t border-white/20 p-6">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-gray-100 hover:to-blue-100/50 transition-all duration-300 cursor-pointer group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@neetlogiq.com</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-900/5 border-b border-white/50' 
            : 'bg-transparent'
        }`}>
          <div className="flex h-20 items-center gap-x-4 px-6 sm:gap-x-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              {/* Search bar */}
              <div className="relative flex flex-1 max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search colleges, programs, cutoffs..."
                  className="block w-full pl-10 pr-3 py-2 border-0 bg-white/60 backdrop-blur-sm rounded-2xl text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white/80 transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Notifications */}
                <button className="relative p-2 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-200 backdrop-blur-sm">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-200 backdrop-blur-sm"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">Admin</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-900/10 border border-white/50 py-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Admin User</p>
                        <p className="text-xs text-gray-500">admin@neetlogiq.com</p>
                      </div>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernLayout;
