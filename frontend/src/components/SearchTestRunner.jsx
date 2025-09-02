import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Clock, BarChart3, Zap } from 'lucide-react';
import SearchTestSuite from '../utils/searchTests.js';

const SearchTestRunner = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  // Override console.log to capture test output
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, { message, timestamp: new Date().toISOString() }]);
      originalLog.apply(console, args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    setLogs([]);
    setTestResults(null);

    try {
      const testSuite = new SearchTestSuite();
      const results = await testSuite.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
      setLogs(prev => [...prev, { 
        message: `❌ Test execution failed: ${error.message}`, 
        timestamp: new Date().toISOString() 
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults(null);
  };

  const getStatusIcon = (passed) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusColor = (passed) => {
    return passed ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Search Test Suite</h2>
          <p className="text-gray-600">Comprehensive testing for all search algorithms</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
          >
            {isRunning ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span>{isRunning ? 'Running Tests...' : 'Run All Tests'}</span>
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Test Results Summary */}
      {testResults && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Test Results Summary</h3>
              <div className="flex items-center space-x-6 mt-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">
                    {testResults.passed} Passed
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">
                    {testResults.failed} Failed
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-700 font-medium">
                    {((testResults.passed / testResults.total) * 100).toFixed(1)}% Success Rate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Details */}
      {testResults && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testResults.details.map((test, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  test.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(test.passed)}
                      <span className={`font-medium ${getStatusColor(test.passed)}`}>
                        {test.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{test.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div><strong>Input:</strong> "{test.input}"</div>
                      <div><strong>Expected:</strong> "{test.expected}"</div>
                      <div><strong>Time:</strong> {new Date(test.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Logs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Test Execution Logs</h3>
          <span className="text-sm text-gray-500">{logs.length} log entries</span>
        </div>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet. Run tests to see output.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className="ml-2">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Test Categories */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Fuzzy Search', icon: '🔍', description: 'Typo tolerance & similarity' },
            { name: 'Phonetic Search', icon: '🎵', description: 'Sound-based matching' },
            { name: 'Location Search', icon: '📍', description: 'City & region matching' },
            { name: 'Synonym Search', icon: '🔄', description: 'Medical term expansion' },
            { name: 'Wildcard Search', icon: '⭐', description: 'Pattern matching' },
            { name: 'Regex Search', icon: '🔧', description: 'Regular expressions' },
            { name: 'Semantic Search', icon: '🧠', description: 'Meaning-based matching' },
            { name: 'Performance', icon: '⚡', description: 'Response time validation' }
          ].map((category, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl mb-2">{category.icon}</div>
              <h4 className="font-medium text-gray-900 mb-1">{category.name}</h4>
              <p className="text-xs text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchTestRunner;
