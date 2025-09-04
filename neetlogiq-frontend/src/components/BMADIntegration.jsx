import React, { useState, useEffect } from 'react';
import { getBMADAnalytics, getBMADPerformance } from '../services/apiService';

const BMADIntegration = () => {
  const [analytics, setAnalytics] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBMADData();
    // Set up real-time monitoring
    const interval = setInterval(fetchBMADData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBMADData = async () => {
    try {
      setLoading(true);
      const [analyticsData, performanceData] = await Promise.all([
        getBMADAnalytics(),
        getBMADPerformance()
      ]);
      
      setAnalytics(analyticsData);
      setPerformance(performanceData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch BMAD data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="bmad-integration-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading BMAD Analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bmad-integration-error bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">⚠️</div>
          <span className="ml-2 text-red-800">BMAD Integration Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bmad-integration bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          🤖 BMAD-METHOD™ Integration
          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            ACTIVE
          </span>
        </h3>
        <button
          onClick={fetchBMADData}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-sm text-gray-600">Response Time</div>
            <div className="text-xl font-bold text-blue-600">
              {performance?.metrics?.averageResponseTime || 0}ms
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-sm text-gray-600">Throughput</div>
            <div className="text-xl font-bold text-green-600">
              {performance?.metrics?.throughput || 0}/min
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-sm text-gray-600">Error Rate</div>
            <div className="text-xl font-bold text-red-600">
              {Math.round(performance?.metrics?.errorRate || 0)}%
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-sm text-gray-600">Search Accuracy</div>
            <div className="text-xl font-bold text-purple-600">
              {Math.round(performance?.metrics?.searchAccuracy || 0)}%
            </div>
          </div>
        </div>
      )}

      {analytics?.recommendations && analytics.recommendations.length > 0 && (
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-2">🧠 AI Recommendations</h4>
          <div className="space-y-2">
            {analytics.recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                <span className="font-medium">{rec.type}:</span> {rec.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics?.bmad && (
        <div className="mt-3 text-xs text-gray-600">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
            BMAD Optimized
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
            AI-Powered
          </span>
        </div>
      )}
    </div>
  );
};

export default BMADIntegration;
