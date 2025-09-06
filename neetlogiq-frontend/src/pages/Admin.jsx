// AI-Generated React Page Template
// Generated for: Admin
// Template: react-page
// Date: 2025-08-28

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Users, Database, BarChart3, Shield, Trash2, 
  Plus, Search, Download, Upload, GraduationCap, Activity,
  TrendingUp, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import BMADStatus from '../components/BMADStatus';

const Admin = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoaded(true);
    }, 200); // Fast loading
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Admin search for:', searchQuery);
    }
  };

  const dashboardStats = [
    { title: 'Total Users', value: '12,847', change: '+12%', trend: 'up', icon: Users },
    { title: 'Active Colleges', value: '1,234', change: '+5%', trend: 'up', icon: GraduationCap },
    { title: 'Data Updates', value: '89', change: '+23%', trend: 'up', icon: Database },
    { title: 'System Health', value: '98%', change: '+2%', trend: 'up', icon: Activity }
  ];

  const recentActivities = [
    { action: 'New college added', target: 'AIIMS Delhi', time: '2 minutes ago', type: 'success' },
    { action: 'Course updated', target: 'MBBS at JIPMER', time: '15 minutes ago', type: 'info' },
    { action: 'User registered', target: 'john.doe@email.com', time: '1 hour ago', type: 'success' },
    { action: 'Data backup', target: 'Database backup completed', time: '2 hours ago', type: 'warning' }
  ];

  const pendingApprovals = [
    { type: 'College', name: 'New Medical College Mumbai', submitted: '2 hours ago', priority: 'high' },
    { type: 'Course', name: 'MD in Cardiology', submitted: '4 hours ago', priority: 'medium' },
    { type: 'User', name: 'admin@college.edu', submitted: '6 hours ago', priority: 'low' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Clock;
      default: return Activity;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with overlay - Same as landing page */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundImage: 'url(/images/overlay.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Header - Same style as landing page */}
        <motion.header
          className="flex items-center justify-between p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">NeetLogIQ Admin</h1>
        </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <Link to="/colleges" className="text-white/80 hover:text-white transition-colors">Colleges</Link>
            <Link to="/courses" className="text-white/80 hover:text-white transition-colors">Courses</Link>
            <Link to="/cutoffs" className="text-white/80 hover:text-white transition-colors">Cutoffs</Link>
            <Link to="/about" className="text-white/80 hover:text-white transition-colors">About</Link>
            <Link to="/admin" className="text-white font-semibold">Admin</Link>
          </nav>
      </motion.header>

      {/* Main Content */}
        <main className="flex-1 px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Admin Dashboard</h1>
              <p className="text-xl text-white/80">Manage your medical education platform with powerful tools</p>
            </motion.div>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users, colleges, courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-6 py-4 text-lg rounded-2xl border-0 focus:ring-4 focus:ring-primary-500/50 focus:outline-none transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-600' 
                      : 'bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg border border-gray-200'
                  }`}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-colors"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </motion.form>

            {/* Dashboard Stats */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {dashboardStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
                  transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/70">{stat.change}</div>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
            </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/70">{stat.title}</div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Admin Tabs */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <div className="flex flex-wrap gap-2 mb-6">
                {['dashboard', 'users', 'colleges', 'courses', 'data', 'settings'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-primary-600 text-white'
                        : 'bg-white/20 text-white/80 hover:bg-white/30'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'dashboard' && (
                  <div className="space-y-8">
                    {/* BMAD Status */}
                    <BMADStatus />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Recent Activities */}
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Recent Activities</h3>
                        <div className="space-y-3">
                          {recentActivities.map((activity, index) => {
                            const ActivityIcon = getActivityIcon(activity.type);
                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -10 }}
                                transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
                                className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg"
                              >
                                <ActivityIcon className={`w-5 h-5 ${getActivityColor(activity.type)}`} />
                                <div className="flex-1">
                                  <div className="text-white font-medium">{activity.action}</div>
                                  <div className="text-white/70 text-sm">{activity.target}</div>
                                </div>
                                <div className="text-white/60 text-xs">{activity.time}</div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Pending Approvals */}
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Pending Approvals</h3>
                        <div className="space-y-3">
                          {pendingApprovals.map((approval, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 10 }}
                              transition={{ delay: 0.8 + index * 0.05, duration: 0.3 }}
                              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                            >
                              <div>
                                <div className="text-white font-medium">{approval.type}</div>
                                <div className="text-white/70 text-sm">{approval.name}</div>
                                <div className="text-white/60 text-xs">{approval.submitted}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs ${getPriorityColor(approval.priority)}`}>
                                  {approval.priority.toUpperCase()}
                                </span>
                                <button className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </button>
                                <button className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
                      transition={{ duration: 0.3, delay: 0.9 }}
                    >
                      <button className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-center">
                        <Plus className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">Add New College</h3>
                        <p className="text-white/70 text-sm">Register a new medical college</p>
                      </button>

                      <button className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-center">
                        <Upload className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">Bulk Import</h3>
                        <p className="text-white/70 text-sm">Import data from Excel/CSV</p>
                      </button>

                      <button className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-center">
                        <Download className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">Export Data</h3>
                        <p className="text-white/70 text-sm">Download platform data</p>
                      </button>
                    </motion.div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="text-center py-20">
                    <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">User Management</h3>
                    <p className="text-white/60">Manage user accounts, permissions, and access control</p>
                  </div>
                )}

                {activeTab === 'colleges' && (
                  <div className="text-center py-20">
                    <GraduationCap className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">College Management</h3>
                    <p className="text-white/60">Add, edit, and manage medical college information</p>
                  </div>
                )}

                {activeTab === 'courses' && (
                  <div className="text-center py-20">
                    <Database className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Course Management</h3>
                    <p className="text-white/60">Manage medical courses, specializations, and curriculum</p>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="text-center py-20">
                    <BarChart3 className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Data Analytics</h3>
                    <p className="text-white/60">View platform statistics and performance metrics</p>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="text-center py-20">
                    <Settings className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">System Settings</h3>
                    <p className="text-white/60">Configure platform settings and preferences</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer - Same style as landing page */}
        <motion.footer
          className={`text-center p-8 transition-colors duration-300 ${
            isDarkMode ? 'text-white/60' : 'text-gray-500'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 1.0 }}
        >
          <p>&copy; 2024 NeetLogIQ. All rights reserved. Built with ❤️ for medical aspirants.</p>
        </motion.footer>
        </div>
    </div>
  );
};

export default Admin;
