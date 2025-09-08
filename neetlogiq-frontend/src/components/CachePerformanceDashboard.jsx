// Cache Performance Dashboard Component
// Displays real-time cache performance metrics and recommendations

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cachePerformanceService from '../services/cachePerformanceService';
import cacheService from '../services/cacheService';
import cacheInvalidationService from '../services/cacheInvalidationService';

const CachePerformanceDashboard = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Refresh metrics
  const refreshMetrics = () => {
    const performanceMetrics = cachePerformanceService.getMetrics();
    const cacheStatistics = cacheService.getStats();
    const invalidationStats = cacheInvalidationService.getInvalidationStats();
    
    setMetrics(performanceMetrics);
    setCacheStats(cacheStatistics);
  };

  // Auto-refresh
  useEffect(() => {
    if (!isOpen) return;
    
    refreshMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(refreshMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isOpen, autoRefresh, refreshInterval]);

  // Manual refresh
  const handleRefresh = () => {
    refreshMetrics();
  };

  // Clear all cache
  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear all cache? This will force reload all data.')) {
      cacheService.clear();
      cacheInvalidationService.clearAllCache();
      refreshMetrics();
    }
  };

  // Reset performance metrics
  const handleResetMetrics = () => {
    if (window.confirm('Are you sure you want to reset performance metrics?')) {
      cachePerformanceService.reset();
      refreshMetrics();
    }
  };

  if (!isOpen) return null;

  const getPerformanceColor = (grade) => {
    switch (grade) {
      case 'A+': case 'A': return 'text-green-600';
      case 'B+': case 'B': return 'text-blue-600';
      case 'C+': case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 0.8) return 'text-green-600';
    if (efficiency >= 0.6) return 'text-blue-600';
    if (efficiency >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Cache Performance Dashboard</h2>
                <p className="text-blue-100 mt-1">Real-time cache metrics and optimization insights</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={onClose}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {metrics && cacheStats ? (
              <div className="space-y-6">
                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(metrics.cacheHitRate * 100)}%
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">Cache Hit Rate</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.averageResponseTime}ms
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Avg Response Time</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.totalRequests}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Total Requests</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-4 rounded-lg">
                    <div className={`text-2xl font-bold ${getPerformanceColor(metrics.performanceGrade)}`}>
                      {metrics.performanceGrade}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Performance Grade</div>
                  </div>
                </div>

                {/* Cache Efficiency */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Cache Efficiency</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Hit Rate</div>
                      <div className={`text-xl font-bold ${getEfficiencyColor(metrics.cacheEfficiency.hitRate)}`}>
                        {Math.round(metrics.cacheEfficiency.hitRate * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Request Reduction</div>
                      <div className={`text-xl font-bold ${getEfficiencyColor(metrics.cacheEfficiency.efficiency)}`}>
                        {metrics.cacheEfficiency.requestReduction}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Overall Efficiency</div>
                      <div className={`text-xl font-bold ${getEfficiencyColor(metrics.cacheEfficiency.efficiency)}`}>
                        {Math.round(metrics.cacheEfficiency.efficiency * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cache Statistics */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Cache Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
                      <div className="text-xl font-bold">{cacheStats.totalEntries}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Valid Entries</div>
                      <div className="text-xl font-bold text-green-600">{cacheStats.validEntries}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Expired Entries</div>
                      <div className="text-xl font-bold text-red-600">{cacheStats.expiredEntries}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Cache Size</div>
                      <div className="text-xl font-bold">{cacheStats.totalSize}</div>
                    </div>
                  </div>
                </div>

                {/* Performance by Type */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Performance by Data Type</h3>
                  <div className="space-y-3">
                    {Object.entries(metrics.byType || {}).map(([type, typeMetrics]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium capitalize">{type}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Hits:</span>
                            <span className="ml-1 font-bold text-green-600">{typeMetrics.hits}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Misses:</span>
                            <span className="ml-1 font-bold text-red-600">{typeMetrics.misses}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Hit Rate:</span>
                            <span className="ml-1 font-bold">{Math.round(typeMetrics.hitRate * 100)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Avg Time:</span>
                            <span className="ml-1 font-bold">{typeMetrics.averageResponseTime}ms</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-2">
                    {metrics.recommendations?.map((rec, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        rec.type === 'error' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        rec.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">
                            {rec.type === 'error' ? '❌' : rec.type === 'warning' ? '⚠️' : '✅'}
                          </span>
                          <div>
                            <div className="font-medium">{rec.message}</div>
                            <div className="text-sm opacity-75">Priority: {rec.priority}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Cache Controls</h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleClearCache}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      🗑️ Clear All Cache
                    </button>
                    <button
                      onClick={handleResetMetrics}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      🔄 Reset Metrics
                    </button>
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        autoRefresh 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {autoRefresh ? '⏸️ Pause Auto-refresh' : '▶️ Start Auto-refresh'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading metrics...</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CachePerformanceDashboard;
