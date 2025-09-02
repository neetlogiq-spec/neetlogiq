import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Award, 
  BarChart3, 
  PieChart, 
  Activity,
  Calendar,
  MapPin,
  Star,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  RefreshCw,
  Plus,
  Settings,
  GraduationCap,
  Shield,
  Brain,
  Upload,
  Database,
  AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalColleges: 2401,
    activeColleges: 2350,
    totalPrograms: 15680,
    totalSeats: 234500,
    totalCutoffs: 45620,
    pendingVerifications: 51
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'college_added',
      message: 'New Medical College added: AIIMS Patna',
      timestamp: '2 hours ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'cutoff_updated',
      message: 'Cutoff data updated for 15 colleges',
      timestamp: '4 hours ago',
      status: 'info'
    },
    {
      id: 3,
      type: 'verification_pending',
      message: '5 colleges pending verification',
      timestamp: '6 hours ago',
      status: 'warning'
    },
    {
      id: 4,
      type: 'data_export',
      message: 'College data exported successfully',
      timestamp: '1 day ago',
      status: 'success'
    }
  ]);

  const [collegeTypes, setCollegeTypes] = useState([
    { type: 'Medical', count: 848, percentage: 35.3, color: 'emerald', icon: '🏥' },
    { type: 'Dental', count: 328, percentage: 13.7, color: 'blue', icon: '🌿' },
    { type: 'DNB', count: 1224, percentage: 51.0, color: 'purple', icon: '🎓' }
  ]);

  const [managementTypes, setManagementTypes] = useState([
    { type: 'Government', count: 456, percentage: 19.0, color: 'blue', icon: '🏛️' },
    { type: 'Private', count: 1567, percentage: 65.3, color: 'gray', icon: '🏢' },
    { type: 'Deemed', count: 378, percentage: 15.7, color: 'purple', icon: '🎓' }
  ]);

  const [topStates, setTopStates] = useState([
    { state: 'Karnataka', colleges: 234, color: 'emerald' },
    { state: 'Maharashtra', colleges: 198, color: 'blue' },
    { state: 'Tamil Nadu', colleges: 187, color: 'purple' },
    { state: 'Uttar Pradesh', colleges: 165, color: 'orange' },
    { state: 'Gujarat', colleges: 143, color: 'red' }
  ]);

  const [growthData, setGrowthData] = useState([
    { month: 'Jan', colleges: 2350, programs: 15400, cutoffs: 43200 },
    { month: 'Feb', colleges: 2370, programs: 15500, cutoffs: 43800 },
    { month: 'Mar', colleges: 2385, programs: 15600, cutoffs: 44200 },
    { month: 'Apr', colleges: 2390, programs: 15650, cutoffs: 44800 },
    { month: 'May', colleges: 2395, programs: 15680, cutoffs: 45200 },
    { month: 'Jun', colleges: 2401, programs: 15680, cutoffs: 45620 }
  ]);

  // Animation refs
  const heroRef = useRef(null);
  const statsRefs = useRef([]);
  const chartsRef = useRef(null);
  const growthRef = useRef(null);
  const statesRef = useRef(null);
  const activityRef = useRef(null);
  const actionsRef = useRef(null);

  // Initialize animations when component mounts
  useEffect(() => {
    console.log('🎨 AdminDashboard: Component mounted, checking anime.js...');
    console.log('🎨 AdminDashboard: window.anime available:', !!window.anime);
    console.log('🎨 AdminDashboard: Data state:', {
      stats,
      recentActivity: recentActivity.length,
      collegeTypes: collegeTypes.length,
      managementTypes: managementTypes.length,
      topStates: topStates.length,
      growthData: growthData.length
    });
    
    // Temporarily disable animations to debug content visibility
    console.log('🎨 AdminDashboard: Animations temporarily disabled for debugging');
    return;
    
    // Hero section entrance animation
    if (heroRef.current && window.anime) {
      console.log('🎨 AdminDashboard: Starting hero animation...');
      window.anime.timeline()
        .add({
          targets: heroRef.current,
          opacity: [0, 1],
          translateY: [50, 0],
          duration: 1000,
          easing: 'easeOutCubic'
        })
        .add({
          targets: '.hero-stats',
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 800,
          delay: window.anime.stagger(150),
          easing: 'easeOutCubic'
        }, '-=600');
    }

    // Quick stats animation
    if (statsRefs.current.length > 0 && window.anime) {
      console.log('🎨 AdminDashboard: Starting stats animation...');
      window.anime({
        targets: statsRefs.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        delay: window.anime.stagger(100),
        easing: 'easeOutCubic'
      });
    }

    // Charts section animation
    if (chartsRef.current && window.anime) {
      console.log('🎨 AdminDashboard: Starting charts animation...');
      window.anime({
        targets: chartsRef.current,
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 1000,
        delay: 400,
        easing: 'easeOutCubic'
      });
    }

    // Growth chart animation
    if (growthRef.current && window.anime) {
      console.log('🎨 AdminDashboard: Starting growth animation...');
      window.anime({
        targets: growthRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        delay: 600,
        easing: 'easeOutCubic'
      });
    }

    // States and activity animation
    if (statesRef.current && activityRef.current && window.anime) {
      console.log('🎨 AdminDashboard: Starting states/activity animation...');
      window.anime({
        targets: [statesRef.current, activityRef.current],
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        delay: window.anime.stagger(200),
        easing: 'easeOutCubic'
      });
    }

    // Quick actions animation
    if (actionsRef.current && window.anime) {
      console.log('🎨 AdminDashboard: Starting actions animation...');
      window.anime({
        targets: actionsRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: 800,
        easing: 'easeOutCubic'
      });
    }
  }, [stats, recentActivity, collegeTypes, managementTypes, topStates, growthData]);

  // Hover animations for quick action buttons
  const handleActionHover = (buttonRef, isHovering) => {
    if (buttonRef && window.anime) {
      if (isHovering) {
        window.anime({
          targets: buttonRef,
          scale: 1.05,
          translateY: -5,
          duration: 300,
          easing: 'easeOutCubic'
        });
      } else {
        window.anime({
          targets: buttonRef,
          scale: 1,
          translateY: 0,
          duration: 300,
          easing: 'easeOutCubic'
        });
      }
    }
  };

  // Animate chart bars
  const animateChartBars = () => {
    if (window.anime) {
      window.anime({
        targets: '.chart-bar',
        scaleY: [0, 1],
        duration: 1000,
        delay: window.anime.stagger(100),
        easing: 'easeOutCubic'
      });
    }
  };

  // Animate percentage bars
  const animatePercentageBars = () => {
    if (window.anime) {
      window.anime({
        targets: '.percentage-bar',
        width: [0, (el) => el.getAttribute('data-percentage') + '%'],
        duration: 1200,
        delay: window.anime.stagger(150),
        easing: 'easeOutCubic'
      });
    }
  };

  // Trigger chart animations when component is visible
  useEffect(() => {
    const timer = setTimeout(() => {
      animateChartBars();
      animatePercentageBars();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Eye className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 bg-white/50 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/20">
      {/* Test Banner - Remove this after confirming UI works */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-xl text-center font-bold text-lg">
        🎉 NEW UI/UX LOADED SUCCESSFULLY! 🎉
        <br />
        <span className="text-sm font-normal">This confirms the updated AdminDashboard is working</span>
        <br />
        <span className="text-xs font-normal">
          Data: {recentActivity.length} activities, {topStates.length} states, {collegeTypes.length} college types
        </span>
      </div>

      {/* Debug Section - Remove after fixing */}
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-lg">
        <h4 className="font-bold">Debug Info:</h4>
        <p>Recent Activity: {recentActivity.length} items</p>
        <p>Top States: {topStates.length} items</p>
        <p>College Types: {collegeTypes.length} items</p>
        <p>Stats: {JSON.stringify(stats)}</p>
        <p>Component rendered at: {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Hero Section */}
      <div ref={heroRef} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-sm">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold">Admin Dashboard</h1>
              <p className="text-indigo-100 text-xl">Welcome to NeetLogIQ Admin Suite</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="hero-stats bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <Building2 className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.totalColleges.toLocaleString()}</p>
                  <p className="text-indigo-100 text-sm">Total Colleges</p>
                </div>
              </div>
            </div>
            
            <div className="hero-stats bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Users className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.totalSeats.toLocaleString()}</p>
                  <p className="text-indigo-100 text-sm">Total Seats</p>
                </div>
              </div>
            </div>
            
            <div className="hero-stats bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Award className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.totalPrograms.toLocaleString()}</p>
                  <p className="text-indigo-100 text-sm">Total Programs</p>
                </div>
              </div>
            </div>
            
            <div className="hero-stats bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-orange-300" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.totalCutoffs.toLocaleString()}</p>
                  <p className="text-indigo-100 text-sm">Total Cutoffs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div ref={el => statsRefs.current[0] = el} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Active Colleges</h3>
            <div className="flex items-center space-x-2 text-green-600">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm font-medium">+2.1%</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-2xl">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.activeColleges}</p>
              <p className="text-sm text-gray-600">Out of {stats.totalColleges} total</p>
            </div>
          </div>
        </div>

        <div ref={el => statsRefs.current[1] = el} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Pending Verifications</h3>
            <div className="flex items-center space-x-2 text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Attention</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-2xl">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingVerifications}</p>
              <p className="text-sm text-gray-600">Requires review</p>
            </div>
          </div>
        </div>

        <div ref={el => statsRefs.current[2] = el} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Data Accuracy</h3>
            <div className="flex items-center space-x-2 text-blue-600">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">98.7%</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">98.7%</p>
              <p className="text-sm text-gray-600">Verified data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* College Types Distribution */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">College Types Distribution</h3>
            <PieChart className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {collegeTypes.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-gray-900">{item.type}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`percentage-bar bg-${item.color}-500 h-2 rounded-full transition-all duration-500`}
                      data-percentage={item.percentage}
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-16 text-right">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Management Types */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Management Types</h3>
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {managementTypes.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-gray-900">{item.type}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`percentage-bar bg-${item.color}-500 h-2 rounded-full transition-all duration-500`}
                      data-percentage={item.percentage}
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-16 text-right">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div ref={growthRef} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Growth Trends (Last 6 Months)</h3>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600">Real-time data</span>
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-4">
          {growthData.map((item, index) => (
            <div key={index} className="text-center">
              <div className="bg-gradient-to-b from-blue-50 to-indigo-100 rounded-2xl p-4 border border-blue-200">
                <p className="text-sm font-medium text-gray-600 mb-2">{item.month}</p>
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">
                    Colleges: {item.colleges.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Programs: {item.programs.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Cutoffs: {item.cutoffs.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top States & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top States */}
        <div ref={statesRef} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top States by Colleges</h3>
            <MapPin className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topStates.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 bg-${item.color}-500 rounded-full`}></div>
                  <span className="font-medium text-gray-900">{item.state}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">{item.colleges}</span>
                  <span className="text-sm text-gray-500">colleges</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div ref={activityRef} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Live updates</span>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="mt-1">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                  {activity.type.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div ref={actionsRef} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            ref={el => handleActionHover(el, false)}
            onMouseEnter={(e) => handleActionHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleActionHover(e.currentTarget, false)}
            onClick={() => navigate('/sector_xp_12/colleges')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>Manage Colleges</span>
          </button>
          
          <button 
            ref={el => handleActionHover(el, false)}
            onMouseEnter={(e) => handleActionHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleActionHover(e.currentTarget, false)}
            onClick={() => navigate('/sector_xp_12/programs')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105"
          >
            <GraduationCap className="h-5 w-5" />
            <span>Manage Programs</span>
          </button>
          
          <button 
            ref={el => handleActionHover(el, false)}
            onMouseEnter={(e) => handleActionHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleActionHover(e.currentTarget, false)}
            onClick={() => navigate('/sector_xp_12/users')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-2xl hover:from-purple-600 hover:to-violet-600 transition-all duration-200 transform hover:scale-105"
          >
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </button>
          
          <button 
            ref={el => handleActionHover(el, false)}
            onMouseEnter={(e) => handleActionHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleActionHover(e.currentTarget, false)}
            onClick={() => navigate('/sector_xp_12/analytics')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 transform hover:scale-105"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Advanced Analytics</span>
          </button>
          
          <button 
            ref={el => handleActionHover(el, false)}
            onMouseEnter={(e) => handleActionHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleActionHover(e.currentTarget, false)}
            onClick={() => navigate('/sector_xp_12/cutoff-import')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105"
          >
            <Upload className="h-5 w-5" />
            <span>Import Cutoffs</span>
          </button>
          
          <button 
            ref={el => handleActionHover(el, false)}
            onMouseEnter={(e) => handleActionHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleActionHover(e.currentTarget, false)}
            onClick={() => navigate('/sector_xp_12/validation')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
          >
            <Shield className="h-5 w-5" />
            <span>Data Validation</span>
          </button>
          
          <button 
            ref={el => handleActionHover(el, false)}
            onMouseEnter={(e) => handleActionHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleActionHover(e.currentTarget, false)}
            onClick={() => navigate('/sector_xp_12/ai')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
          >
            <Brain className="h-5 w-5" />
            <span>BMAD AI</span>
          </button>
          
          <button 
            ref={el => handleActionHover(el, false)}
            onMouseEnter={(e) => handleActionHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleActionHover(e.currentTarget, false)}
            onClick={() => navigate('/sector_xp_12/testing')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-2xl hover:from-gray-600 hover:to-slate-600 transition-all duration-200 transform hover:scale-105"
          >
            <CheckCircle className="h-5 w-5" />
            <span>System Testing</span>
          </button>
          
          <button 
            ref={el => handleActionHover(el, false)}
            onMouseEnter={(e) => handleActionHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleActionHover(e.currentTarget, false)}
            onClick={() => navigate('/sector_xp_12/cutoff-data')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
          >
            <Database className="h-5 w-5" />
            <span>Cutoff Data Management</span>
          </button>
          
          <button 
            ref={el => handleActionHover(el, false)}
            onMouseEnter={(e) => handleActionHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleActionHover(e.currentTarget, false)}
            onClick={() => navigate('/sector_xp_12/errors-corrections')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
          >
            <AlertTriangle className="h-5 w-5" />
            <span>Errors & Corrections</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
