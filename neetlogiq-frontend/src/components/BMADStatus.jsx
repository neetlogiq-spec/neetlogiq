import React, { useState, useEffect } from 'react';
import { getBMADAnalytics, getBMADPerformance, healthCheck } from '../services/apiService';

const BMADStatus = () => {
  const [status, setStatus] = useState({
    cloudflareWorker: false,
    analytics: null,
    performance: null,
    loading: true
  });

  useEffect(() => {
    checkBMADStatus();
    const interval = setInterval(checkBMADStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkBMADStatus = async () => {
    try {
      const [workerHealth, analytics, performance] = await Promise.allSettled([
        healthCheck(),
        getBMADAnalytics(),
        getBMADPerformance()
      ]);

      setStatus({
        cloudflareWorker: workerHealth.status === 'fulfilled' && workerHealth.value,
        analytics: analytics.status === 'fulfilled' ? analytics.value : null,
        performance: performance.status === 'fulfilled' ? performance.value : null,
        loading: false
      });
    } catch (error) {
      console.error('BMAD status check failed:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isActive) => {
    return isActive ? '✅' : '❌';
  };

  if (status.loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          🤖 BMAD-METHOD™ Status
        </h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        🤖 BMAD-METHOD™ Status
        <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          Cloudflare Worker Integration
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Cloudflare Worker Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Cloudflare Worker</h3>
            <span className={`text-lg ${getStatusColor(status.cloudflareWorker)}`}>
              {getStatusIcon(status.cloudflareWorker)}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {status.cloudflareWorker ? 'Connected and running' : 'Not accessible'}
          </p>
        </div>

        {/* BMAD Analytics Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">BMAD Analytics</h3>
            <span className={`text-lg ${getStatusColor(!!status.analytics)}`}>
              {getStatusIcon(!!status.analytics)}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {status.analytics ? 'Data available' : 'No data'}
          </p>
        </div>

        {/* Performance Monitoring Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Performance Monitoring</h3>
            <span className={`text-lg ${getStatusColor(!!status.performance)}`}>
              {getStatusIcon(!!status.performance)}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {status.performance ? 'Metrics available' : 'No metrics'}
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      {status.performance && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">📊 Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {status.performance.metrics?.averageResponseTime || 0}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {status.performance.metrics?.throughput || 0}
              </div>
              <div className="text-sm text-gray-600">Requests/Min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(status.performance.metrics?.errorRate || 0)}%
              </div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(status.performance.metrics?.searchAccuracy || 0)}%
              </div>
              <div className="text-sm text-gray-600">Search Accuracy</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {status.analytics?.recommendations && status.analytics.recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">🧠 AI Recommendations</h3>
          <div className="space-y-2">
            {status.analytics.recommendations.slice(0, 5).map((rec, index) => (
              <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-blue-600">💡</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">{rec.type}:</span> {rec.message}
                    </p>
                    {rec.suggestions && (
                      <div className="mt-1">
                        <p className="text-xs text-blue-600">Suggestions:</p>
                        <ul className="text-xs text-blue-700 list-disc list-inside">
                          {rec.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">🔧 System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">API Base URL:</span>
            <span className="ml-2 text-gray-600">http://localhost:8787</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Integration Type:</span>
            <span className="ml-2 text-gray-600">Cloudflare Worker + BMAD</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Last Updated:</span>
            <span className="ml-2 text-gray-600">{new Date().toLocaleTimeString()}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span className="ml-2 text-green-600 font-medium">MAXIMUM POTENTIAL</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={checkBMADStatus}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default BMADStatus;
