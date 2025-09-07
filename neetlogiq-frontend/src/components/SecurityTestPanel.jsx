// Security Test Panel - For demonstrating security features
import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import securityService from '../services/securityService';

const SecurityTestPanel = () => {
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const testCases = [
    {
      name: 'Normal Search',
      input: 'AIIMS Delhi',
      expected: 'Should pass validation'
    },
    {
      name: 'XSS Attack',
      input: '<script>alert("XSS")</script>',
      expected: 'Should be blocked'
    },
    {
      name: 'SQL Injection',
      input: "'; DROP TABLE colleges; --",
      expected: 'Should be blocked'
    },
    {
      name: 'Command Injection',
      input: 'MBBS; rm -rf /',
      expected: 'Should be blocked'
    },
    {
      name: 'JavaScript Injection',
      input: 'javascript:alert("hack")', // eslint-disable-line no-script-url
      expected: 'Should be blocked'
    },
    {
      name: 'Long Input',
      input: 'A'.repeat(200),
      expected: 'Should be blocked (too long)'
    },
    {
      name: 'HTML Injection',
      input: '<iframe src="malicious.com"></iframe>',
      expected: 'Should be blocked'
    },
    {
      name: 'URL Injection',
      input: 'data:text/html,<script>alert("XSS")</script>',
      expected: 'Should be blocked'
    }
  ];

  const runSecurityTest = (testCase) => {
    const validation = securityService.validateSearchInput(testCase.input);
    const threats = securityService.detectMaliciousPatterns(testCase.input);
    
    const result = {
      name: testCase.name,
      input: testCase.input,
      expected: testCase.expected,
      isValid: validation.isValid,
      sanitized: validation.sanitized,
      error: validation.error,
      threats: threats,
      timestamp: new Date().toISOString()
    };
    
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const runAllTests = () => {
    setTestResults([]);
    testCases.forEach((testCase, index) => {
      setTimeout(() => runSecurityTest(testCase), index * 500);
    });
  };

  const testCustomInput = () => {
    if (testInput.trim()) {
      runSecurityTest({
        name: 'Custom Test',
        input: testInput,
        expected: 'Custom validation test'
      });
    }
  };

  const getThreatIcon = (threats) => {
    if (threats.length === 0) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (threats.some(t => t.severity === 'CRITICAL')) return <XCircle className="w-4 h-4 text-red-500" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  const getThreatColor = (threats) => {
    if (threats.length === 0) return 'text-green-600';
    if (threats.some(t => t.severity === 'CRITICAL')) return 'text-red-600';
    return 'text-yellow-600';
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Security Test Panel"
        >
          <Shield className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Security Test Panel</h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
        {/* Custom Input Test */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Test Custom Input:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter test input..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={testCustomInput}
              className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Test
            </button>
          </div>
        </div>

        {/* Run All Tests */}
        <button
          onClick={runAllTests}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          Run All Security Tests
        </button>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Results:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {result.name}
                    </span>
                    {getThreatIcon(result.threats)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-gray-600 dark:text-gray-400">
                      <strong>Input:</strong> {result.input}
                    </div>
                    
                    <div className="text-gray-600 dark:text-gray-400">
                      <strong>Valid:</strong> 
                      <span className={result.isValid ? 'text-green-600' : 'text-red-600'}>
                        {result.isValid ? ' Yes' : ' No'}
                      </span>
                    </div>
                    
                    {result.sanitized && (
                      <div className="text-gray-600 dark:text-gray-400">
                        <strong>Sanitized:</strong> {result.sanitized}
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="text-red-600">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    
                    {result.threats.length > 0 && (
                      <div className={getThreatColor(result.threats)}>
                        <strong>Threats:</strong>
                        <ul className="ml-4 list-disc">
                          {result.threats.map((threat, i) => (
                            <li key={i}>
                              {threat.type} ({threat.severity})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityTestPanel;
