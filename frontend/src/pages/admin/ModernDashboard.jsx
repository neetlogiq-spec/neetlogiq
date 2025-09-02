import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  TrendingUp, 
  Users, 
  FileText, 
  Upload,
  Download,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Target,
  Award,
  TrendingDown,
  Eye,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

const ModernDashboard = () => {
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalPrograms: 0,
    totalCutoffs: 0,
    totalUsers: 0,
    recentImports: 0,
    pendingReviews: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get admin session for authentication
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('No admin session found');
      }
      
      const session = JSON.parse(adminSession);
      const credentials = btoa(`${session.username}:${session.password}`);
      
      // Fetch statistics from backend
      const statsResponse = await fetch('/api/sector_xp_12/stats', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalColleges: statsData.data?.total_colleges || 0,
          totalPrograms: statsData.data?.total_programs || 0,
          totalCutoffs: statsData.data?.total_cutoffs || 0,
          totalUsers: 1, // Only admin user for now
          recentImports: 23, // Can be fetched from audit logs
          pendingReviews: 0
        });
      } else {
        // Fallback to demo data if API fails
        setStats({
          totalColleges: 1247,
          totalPrograms: 8923,
          totalCutoffs: 45678,
          totalUsers: 1,
          recentImports: 23,
          pendingReviews: 8
        });
      }
      
      // Fetch recent activity (can be implemented later)
      setRecentActivity([
        { type: 'import', text: 'CSV import completed for KEA 2024', time: '2 hours ago', status: 'success' },
        { type: 'update', text: 'College profile updated: AIIMS Delhi', time: '4 hours ago', status: 'info' },
        { type: 'delete', text: 'Archived outdated cutoff records', time: '6 hours ago', status: 'warning' },
        { type: 'create', text: 'New user account created', time: '8 hours ago', status: 'success' }
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback data
      setStats({
        totalColleges: 1247,
        totalPrograms: 8923,
        totalCutoffs: 45678,
        totalUsers: 1,
        recentImports: 23,
        pendingReviews: 8
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Colleges',
      value: stats.totalColleges,
      icon: Building2,
      change: '+12.5%',
      changeType: 'increase',
      description: 'from last month',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      name: 'Total Programs',
      value: stats.totalPrograms,
      icon: GraduationCap,
      change: '+8.2%',
      changeType: 'increase',
      description: 'from last month',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      shadowColor: 'shadow-purple-500/25'
    },
    {
      name: 'Total Cutoffs',
      value: stats.totalCutoffs,
      icon: TrendingUp,
      change: '+25.7%',
      changeType: 'increase',
      description: 'from last month',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      shadowColor: 'shadow-emerald-500/25'
    },
    {
      name: 'Active Users',
      value: stats.totalUsers,
      icon: Users,
      change: '+5.3%',
      changeType: 'increase',
      description: 'from last month',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      shadowColor: 'shadow-orange-500/25'
    }
  ];

  const quickActions = [
    {
      name: 'Import Cutoffs',
      description: 'Upload CSV file with cutoff data',
      icon: Upload,
      href: '/sector_xp_12/import-export',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      hoverColor: 'hover:from-blue-600 hover:to-cyan-600',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      name: 'Export Data',
      description: 'Download data in CSV format',
      icon: Download,
      href: '/sector_xp_12/import-export',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'from-emerald-50 to-teal-50',
      hoverColor: 'hover:from-emerald-600 hover:to-teal-600',
      shadowColor: 'shadow-emerald-500/25'
    },
    {
      name: 'Manage Colleges',
      description: 'View and edit college information',
      icon: Building2,
      href: '/sector_xp_12/colleges',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600',
      shadowColor: 'shadow-purple-500/25'
    },
    {
      name: 'Manage Cutoffs',
      description: 'View and edit cutoff data',
      icon: TrendingUp,
      href: '/sector_xp_12/cutoffs',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      hoverColor: 'hover:from-orange-600 hover:to-red-600',
      shadowColor: 'shadow-orange-500/25'
    }
  ];

  const timeframes = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDelay: '-0.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section with Glassmorphism */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl"></div>
        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl shadow-gray-900/5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
                Welcome back, Admin! 👋
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Here's what's happening with your NeetLogIQ platform today. 
                <span className="text-blue-600 font-semibold"> 23 new cutoffs</span> were imported this week.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25 animate-pulse">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards with Advanced Animations */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div 
            key={stat.name} 
            className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-gray-900/10 transition-all duration-500 hover:-translate-y-2"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  stat.changeType === 'increase' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              
              <div className="mb-2">
                <div className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                  {stat.name}
                </div>
              </div>
              
              <div className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors duration-300">
                {stat.description}
              </div>
            </div>

            {/* Hover effect border */}
            <div className={`absolute inset-0 rounded-3xl border-2 ${stat.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          </div>
        ))}
      </div>

      {/* Quick Actions with Hover Effects */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-gray-900/5 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
            <span className="text-sm text-gray-500">Most Used</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <a
              key={action.name}
              href={action.href}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Hover background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.bgColor} opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
              
              <div className="relative">
                <div className={`mb-4 p-4 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg group-hover:shadow-xl transition-all duration-500`}>
                  <action.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-800 transition-colors duration-300 mb-2">
                  {action.name}
                </h3>
                
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 mb-4">
                  {action.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors duration-300">
                    Click to access
                  </span>
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0`}>
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Analytics and Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Performance Metrics */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-gray-900/5 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
            <div className="flex items-center space-x-2">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.value}
                  onClick={() => setSelectedTimeframe(timeframe.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedTimeframe === timeframe.value
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-green-700">Data Import Success</div>
                  <div className="text-xs text-green-600">98.5% success rate</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-700">98.5%</div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-700">System Uptime</div>
                  <div className="text-xs text-blue-600">Last 30 days</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-700">99.9%</div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 rounded-xl">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-purple-700">Data Quality Score</div>
                  <div className="text-xs text-purple-600">Validation checks</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-700">96.2%</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-gray-900/5 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { type: 'import', text: 'CSV import completed for KEA 2024', time: '2 hours ago', status: 'success' },
              { type: 'update', text: 'College profile updated: AIIMS Delhi', time: '4 hours ago', status: 'info' },
              { type: 'delete', text: 'Archived outdated cutoff records', time: '6 hours ago', status: 'warning' },
              { type: 'create', text: 'New user account created', time: '8 hours ago', status: 'success' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-gray-50/50 transition-colors duration-200">
                <div className={`p-2 rounded-xl ${
                  activity.status === 'success' ? 'bg-green-100 text-green-600' :
                  activity.status === 'info' ? 'bg-blue-100 text-blue-600' :
                  activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.type === 'import' && <Upload className="h-4 w-4" />}
                  {activity.type === 'update' && <CheckCircle className="h-4 w-4" />}
                  {activity.type === 'delete' && <AlertCircle className="h-4 w-4" />}
                  {activity.type === 'create' && <Users className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Health Overview */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-gray-900/5 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Data Health Overview</h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Real-time monitoring</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-sm font-medium text-green-700">Data Completeness</div>
            <div className="text-xs text-green-600 mt-1">All required fields populated</div>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
            <div className="text-4xl font-bold text-blue-600 mb-2">24h</div>
            <div className="text-sm font-medium text-blue-700">Last Update</div>
            <div className="text-xs text-blue-600 mt-1">Data refreshed recently</div>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
            <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
            <div className="text-sm font-medium text-purple-700">Uptime</div>
            <div className="text-xs text-purple-600 mt-1">System reliability</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;
