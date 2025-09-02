import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  BarChart3, 
  Database, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Upload,
  Settings,
  Shield
} from 'lucide-react';
import ModernCard from '../../components/ui/ModernCard';
import ModernButton from '../../components/ui/ModernButton';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalPrograms: 0,
    totalUsers: 0,
    totalCutoffs: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState('healthy');

  useEffect(() => {
    // Simulate fetching dashboard data
    setStats({
      totalColleges: 2437,
      totalPrograms: 15680,
      totalUsers: 1250,
      totalCutoffs: 45620
    });

    setRecentActivity([
      {
        id: 1,
        type: 'upload',
        message: 'KEA 2024 Medical R1 cutoff data uploaded',
        timestamp: '2 hours ago',
        status: 'completed',
        icon: Upload
      },
      {
        id: 2,
        type: 'processing',
        message: 'AI processing completed for 2,860 records',
        timestamp: '3 hours ago',
        status: 'completed',
        icon: CheckCircle
      },
      {
        id: 3,
        type: 'user',
        message: 'New user registration: Priya Sharma',
        timestamp: '4 hours ago',
        status: 'completed',
        icon: Users
      },
      {
        id: 4,
        type: 'system',
        message: 'Database backup completed successfully',
        timestamp: '6 hours ago',
        status: 'completed',
        icon: Database
      }
    ]);
  }, []);

  const quickActions = [
    {
      title: 'Upload Cutoffs',
      description: 'Import new cutoff data files',
      icon: Upload,
      color: 'from-blue-500 to-cyan-500',
      href: '/sector_xp_12/cutoff-import'
    },
    {
      title: 'Manage Colleges',
      description: 'Add, edit, or remove colleges',
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-500',
      href: '/sector_xp_12/colleges'
    },
    {
      title: 'View Analytics',
      description: 'Check system performance metrics',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500',
      href: '/sector_xp_12/analytics'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      href: '/sector_xp_12/users'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-neutral-600">
            Welcome back! Here's what's happening with your medical college platform.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ModernCard className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-2">
                {stats.totalColleges.toLocaleString()}
              </div>
              <div className="text-neutral-600">Total Colleges</div>
            </ModernCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ModernCard className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-2">
                {stats.totalPrograms.toLocaleString()}
              </div>
              <div className="text-neutral-600">Total Programs</div>
            </ModernCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <ModernCard className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-2">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-neutral-600">Active Users</div>
            </ModernCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ModernCard className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-2">
                {stats.totalCutoffs.toLocaleString()}
              </div>
              <div className="text-neutral-600">Cutoff Records</div>
            </ModernCard>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <ModernCard
                key={index}
                className="p-6 text-center cursor-pointer hover-lift"
                onClick={() => window.location.href = action.href}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl mb-4`}>
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-neutral-600">
                  {action.description}
                </p>
              </ModernCard>
            ))}
          </div>
        </motion.div>

        {/* System Status and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <ModernCard className="p-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-green-600" />
                System Status
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Database</span>
                  </div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">AI Processing</span>
                  </div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Last Backup</span>
                  </div>
                  <span className="text-sm text-blue-600">6 hours ago</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">API Services</span>
                  </div>
                  <span className="text-sm text-green-600">All Running</span>
                </div>
              </div>
            </ModernCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <ModernCard className="p-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <activity.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {activity.timestamp}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <ModernButton
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.href = '/sector_xp_12/analytics'}
                  className="w-full"
                >
                  View All Activity
                </ModernButton>
              </div>
            </ModernCard>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <ModernCard className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Performance Metrics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">99.8%</div>
                <div className="text-sm text-neutral-600">Uptime</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">2.3s</div>
                <div className="text-sm text-neutral-600">Avg Response Time</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">15.2K</div>
                <div className="text-sm text-neutral-600">Requests Today</div>
              </div>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
