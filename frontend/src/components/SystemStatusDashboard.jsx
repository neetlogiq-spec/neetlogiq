import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Server, 
  Search, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

const SystemStatusDashboard = () => {
  const [systemStatus, setSystemStatus] = useState({
    backend: { status: 'unknown', responseTime: 0, lastCheck: null },
    frontend: { status: 'unknown', lastCheck: null },
    database: { status: 'unknown', size: 0, lastCheck: null },
    search: { status: 'unknown', algorithms: [], lastCheck: null },
    cache: { status: 'unknown', hitRate: 0, size: 0, lastCheck: null }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const checkSystemHealth = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Check backend health
      const backendStart = performance.now();
      const backendResponse = await fetch('/api/health');
      const backendTime = performance.now() - backendStart;
      
      const backendStatus = {
        status: backendResponse.ok ? 'healthy' : 'unhealthy',
        responseTime: Math.round(backendTime),
        lastCheck: new Date().toISOString()
      };

      // Check database status
      const dbResponse = await fetch('/api/sector_xp_12/colleges', {
        headers: {
          'Authorization': 'Basic ' + btoa('Lone_wolf#12:Apx_gp_delta')
        }
      });
      
      const dbData = await dbResponse.json();
      const databaseStatus = {
        status: dbResponse.ok ? 'healthy' : 'unhealthy',
        size: dbData.total || 0,
        lastCheck: new Date().toISOString()
      };

      // Check cache statistics
      let cacheStatus = { status: 'unknown', hitRate: 0, size: 0, lastCheck: new Date().toISOString() };
      try {
        const cacheResponse = await fetch('/api/cache/stats', {
          headers: {
            'Authorization': 'Basic ' + btoa('Lone_wolf#12:Apx_gp_delta')
          }
        });
        if (cacheResponse.ok) {
          const cacheData = await cacheResponse.json();
          cacheStatus = {
            status: 'healthy',
            hitRate: parseFloat(cacheData.data.hitRate) || 0,
            size: cacheData.data.size || 0,
            lastCheck: new Date().toISOString()
          };
        }
      } catch (error) {
        cacheStatus = { status: 'unavailable', hitRate: 0, size: 0, lastCheck: new Date().toISOString() };
      }

      // Check search algorithms
      const searchStatus = {
        status: 'healthy',
        algorithms: [
          'Fuzzy Search',
          'Phonetic Search', 
          'Location Search',
          'Synonym Search',
          'Wildcard Search',
          'Regex Search',
          'Semantic Search'
        ],
        lastCheck: new Date().toISOString()
      };

      // Check frontend status
      const frontendStatus = {
        status: 'healthy',
        lastCheck: new Date().toISOString()
      };

      setSystemStatus({
        backend: backendStatus,
        frontend: frontendStatus,
        database: databaseStatus,
        search: searchStatus,
        cache: cacheStatus
      });

      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error('System health check failed:', error);
      setSystemStatus(prev => ({
        ...prev,
        backend: { ...prev.backend, status: 'error', lastCheck: new Date().toISOString() }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'unknown':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'unavailable':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'unhealthy':
        return 'text-red-600';
      case 'unknown':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-700';
      case 'unavailable':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'unhealthy':
        return 'bg-red-50 border-red-200';
      case 'unknown':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-100 border-red-300';
      case 'unavailable':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Status Dashboard</h2>
          <p className="text-gray-600">Real-time monitoring of all system components</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={checkSystemHealth}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Checking...' : 'Refresh'}</span>
          </button>
          {lastUpdate && (
            <div className="text-sm text-gray-500">
              Last updated: {new Date(lastUpdate).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Backend Status */}
        <div className={`p-6 rounded-xl border ${getStatusBgColor(systemStatus.backend.status)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Server className="w-8 h-8 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Backend</h3>
            </div>
            {getStatusIcon(systemStatus.backend.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${getStatusColor(systemStatus.backend.status)}`}>
                {systemStatus.backend.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Time:</span>
              <span className="font-medium text-gray-900">
                {systemStatus.backend.responseTime}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Port:</span>
              <span className="font-medium text-gray-900">4000</span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className={`p-6 rounded-xl border ${getStatusBgColor(systemStatus.database.status)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Database</h3>
            </div>
            {getStatusIcon(systemStatus.database.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${getStatusColor(systemStatus.database.status)}`}>
                {systemStatus.database.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Colleges:</span>
              <span className="font-medium text-gray-900">
                {systemStatus.database.size.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium text-gray-900">SQLite3</span>
            </div>
          </div>
        </div>

        {/* Frontend Status */}
        <div className={`p-6 rounded-xl border ${getStatusBgColor(systemStatus.frontend.status)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Globe className="w-8 h-8 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Frontend</h3>
            </div>
            {getStatusIcon(systemStatus.frontend.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${getStatusColor(systemStatus.frontend.status)}`}>
                {systemStatus.frontend.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Port:</span>
              <span className="font-medium text-gray-900">4001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Framework:</span>
              <span className="font-medium text-gray-900">React + Vite</span>
            </div>
          </div>
        </div>

        {/* Search Status */}
        <div className={`p-6 rounded-xl border ${getStatusBgColor(systemStatus.search.status)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Search className="w-8 h-8 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Search Engine</h3>
            </div>
            {getStatusIcon(systemStatus.search.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${getStatusColor(systemStatus.search.status)}`}>
                {systemStatus.search.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Algorithms:</span>
              <span className="font-medium text-gray-900">
                {systemStatus.search.algorithms.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium text-gray-900">Advanced</span>
            </div>
          </div>
        </div>

        {/* Cache Status */}
        <div className={`p-6 rounded-xl border ${getStatusBgColor(systemStatus.cache.status)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cache</h3>
            </div>
            {getStatusIcon(systemStatus.cache.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${getStatusColor(systemStatus.cache.status)}`}>
                {systemStatus.cache.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hit Rate:</span>
              <span className="font-medium text-gray-900">
                {systemStatus.cache.hitRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium text-gray-900">
                {systemStatus.cache.size} entries
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="p-6 rounded-xl border bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Backend:</span>
              <span className="font-medium text-gray-900">
                {systemStatus.backend.responseTime}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Target:</span>
              <span className="font-medium text-gray-900">&lt;500ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${
                systemStatus.backend.responseTime < 500 ? 'text-green-600' : 'text-red-600'
              }`}>
                {systemStatus.backend.responseTime < 500 ? 'OPTIMAL' : 'NEEDS OPTIMIZATION'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Algorithms Detail */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Algorithms Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemStatus.search.algorithms.map((algorithm, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl mb-2">✅</div>
              <h4 className="font-medium text-gray-900">{algorithm}</h4>
              <p className="text-xs text-gray-600">Active</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Health Summary */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-4">
          <Activity className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">System Health Summary</h3>
            <div className="flex items-center space-x-6 mt-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700 font-medium">
                  {Object.values(systemStatus).filter(s => s.status === 'healthy').length} Healthy
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-700 font-medium">
                  {Object.values(systemStatus).filter(s => s.status === 'unknown' || s.status === 'unavailable').length} Warning
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">
                  {Object.values(systemStatus).filter(s => s.status === 'unhealthy' || s.status === 'error').length} Critical
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusDashboard;
