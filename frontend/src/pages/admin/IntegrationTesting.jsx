import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Play,
  Pause,
  Settings,
  Eye,
  Download,
  Upload,
  BarChart3,
  Clock,
  Activity,
  Cpu,
  Database,
  Globe,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Wifi,
  Server,
  HardDrive
} from 'lucide-react';
import { getApiEndpoint } from '../../config/api';

const IntegrationTesting = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    overall: 'healthy',
    database: 'healthy',
    api: 'healthy',
    frontend: 'healthy',
    ai: 'healthy'
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    responseTime: 245,
    throughput: 1250,
    errorRate: 0.12,
    uptime: 99.87
  });
  const [activeTests, setActiveTests] = useState([]);

  useEffect(() => {
    fetchSystemHealth();
    fetchPerformanceMetrics();
    fetchTestResults();
  }, []);

  const fetchSystemHealth = async () => {
    try {
      // Mock system health data
      setSystemHealth({
        overall: 'healthy',
        database: 'healthy',
        api: 'healthy',
        frontend: 'healthy',
        ai: 'healthy'
      });
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      // Mock performance data
      setPerformanceMetrics({
        responseTime: 245 + Math.random() * 50,
        throughput: 1250 + Math.random() * 100,
        errorRate: 0.12 + Math.random() * 0.05,
        uptime: 99.87 + Math.random() * 0.1
      });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  const fetchTestResults = async () => {
    try {
      // Mock test results
      const results = [
        {
          id: 1,
          name: 'Database Connection Test',
          status: 'passed',
          duration: 1250,
          timestamp: new Date().toISOString(),
          details: 'Successfully connected to SQLite database'
        },
        {
          id: 2,
          name: 'API Authentication Test',
          status: 'passed',
          duration: 890,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          details: 'Admin authentication working correctly'
        },
        {
          id: 3,
          name: 'Data CRUD Operations Test',
          status: 'passed',
          duration: 2100,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          details: 'Create, read, update, delete operations successful'
        },
        {
          id: 4,
          name: 'File Upload Test',
          status: 'warning',
          duration: 3400,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          details: 'File upload working but slow for large files'
        },
        {
          id: 5,
          name: 'AI Processing Test',
          status: 'passed',
          duration: 5600,
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          details: 'AI validation and processing working correctly'
        }
      ];
      setTestResults(results);
    } catch (error) {
      console.error('Error fetching test results:', error);
    }
  };

  const runSystemTest = async (testType) => {
    try {
      setLoading(true);
      const testId = Date.now();
      
      // Add test to active tests
      setActiveTests(prev => [...prev, {
        id: testId,
        type: testType,
        status: 'running',
        startTime: new Date().toISOString()
      }]);

      // Simulate test execution
      setTimeout(() => {
        const result = {
          id: testId,
          name: `${testType} Test`,
          status: Math.random() > 0.1 ? 'passed' : 'failed',
          duration: Math.floor(Math.random() * 5000) + 1000,
          timestamp: new Date().toISOString(),
          details: `${testType} test completed successfully`
        };

        setTestResults(prev => [result, ...prev]);
        setActiveTests(prev => prev.filter(t => t.id !== testId));
        setLoading(false);

        if (result.status === 'passed') {
          alert(`${testType} test passed!`);
        } else {
          alert(`${testType} test failed! Check logs for details.`);
        }
      }, Math.floor(Math.random() * 3000) + 2000);

    } catch (error) {
      console.error('Error running system test:', error);
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    try {
      setLoading(true);
      const tests = ['Database', 'API', 'Frontend', 'AI', 'Integration'];
      
      for (const test of tests) {
        await new Promise(resolve => {
          setTimeout(async () => {
            await runSystemTest(test);
            resolve();
          }, 1000);
        });
      }
      
      setLoading(false);
      alert('All tests completed! Check results below.');
    } catch (error) {
      console.error('Error running all tests:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const exportTestReport = () => {
    const headers = ['Test Name', 'Status', 'Duration (ms)', 'Timestamp', 'Details'];
    const csvContent = [
      headers.join(','),
      ...testResults.map(result => [
        result.name,
        result.status,
        result.duration,
        result.timestamp,
        `"${result.details}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integration & Testing</h1>
            <p className="text-gray-600 mt-2">System validation, performance testing, and end-to-end workflow testing</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>Run All Tests</span>
            </button>
            <button
              onClick={exportTestReport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Health</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getHealthColor(systemHealth.overall)}`}>
                {systemHealth.overall}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Database</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getHealthColor(systemHealth.database)}`}>
                {systemHealth.database}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Server className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">API Server</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getHealthColor(systemHealth.api)}`}>
                {systemHealth.api}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Frontend</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getHealthColor(systemHealth.frontend)}`}>
                {systemHealth.frontend}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Cpu className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AI System</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getHealthColor(systemHealth.ai)}`}>
                {systemHealth.ai}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{performanceMetrics.responseTime.toFixed(0)}ms</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Throughput</p>
              <p className="text-2xl font-bold text-gray-900">{performanceMetrics.throughput.toFixed(0)} req/s</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-2xl font-bold text-gray-900">{performanceMetrics.errorRate.toFixed(2)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{performanceMetrics.uptime.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Test Controls</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => runSystemTest('Database')}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Database className="w-4 h-4 inline mr-2" />
            Database
          </button>
          <button
            onClick={() => runSystemTest('API')}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Server className="w-4 h-4 inline mr-2" />
            API
          </button>
          <button
            onClick={() => runSystemTest('Frontend')}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Globe className="w-4 h-4 inline mr-2" />
            Frontend
          </button>
          <button
            onClick={() => runSystemTest('AI')}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Cpu className="w-4 h-4 inline mr-2" />
            AI System
          </button>
          <button
            onClick={() => runSystemTest('Integration')}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Integration
          </button>
        </div>
      </div>

      {/* Active Tests */}
      {activeTests.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Tests</h3>
          <div className="space-y-3">
            {activeTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-sm font-medium text-gray-900">{test.type} Test</span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Running
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  Started: {new Date(test.startTime).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{result.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.duration}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(result.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {result.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IntegrationTesting;
