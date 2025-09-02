import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Zap,
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Clock,
  FileText,
  Database,
  Settings,
  Play,
  Pause,
  SkipForward,
  RotateCcw
} from 'lucide-react';
import { getApiEndpoint } from '../../config/api';

const DataValidation = () => {
  const [loading, setLoading] = useState(true);
  const [validationResults, setValidationResults] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [correctionData, setCorrectionData] = useState({});
  const [validationStats, setValidationStats] = useState({
    totalRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    correctedRecords: 0,
    accuracy: 0
  });

  useEffect(() => {
    fetchValidationData();
  }, []);

  const fetchValidationData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockData = [
        {
          id: 1,
          type: 'college',
          field: 'name',
          originalValue: 'AIIMS Delhi',
          suggestedValue: 'All India Institute of Medical Sciences, New Delhi',
          confidence: 95,
          status: 'validated',
          errorType: 'formatting',
          severity: 'low',
          description: 'Official name format correction',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'program',
          field: 'duration',
          originalValue: '5',
          suggestedValue: '5 years',
          confidence: 88,
          status: 'pending',
          errorType: 'missing_unit',
          severity: 'medium',
          description: 'Duration should include unit specification',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          type: 'college',
          field: 'location',
          originalValue: 'Mumbai, Maharashtra',
          suggestedValue: 'Mumbai, Maharashtra, India',
          confidence: 92,
          status: 'corrected',
          errorType: 'incomplete',
          severity: 'low',
          description: 'Country information missing',
          timestamp: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 4,
          type: 'program',
          field: 'total_seats',
          originalValue: 'abc',
          suggestedValue: '100',
          confidence: 78,
          status: 'error',
          errorType: 'invalid_format',
          severity: 'high',
          description: 'Non-numeric value in numeric field',
          timestamp: new Date(Date.now() - 259200000).toISOString()
        }
      ];

      setValidationResults(mockData);
      setValidationStats({
        totalRecords: mockData.length,
        validRecords: mockData.filter(r => r.status === 'validated').length,
        invalidRecords: mockData.filter(r => r.status === 'error').length,
        correctedRecords: mockData.filter(r => r.status === 'corrected').length,
        accuracy: Math.round((mockData.filter(r => r.status === 'validated' || r.status === 'corrected').length / mockData.length) * 100)
      });
    } catch (error) {
      console.error('Error fetching validation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startValidation = async () => {
    try {
      setLoading(true);
      // Simulate validation process
      setTimeout(() => {
        setLoading(false);
        alert('Data validation completed! Found 4 issues that need attention.');
      }, 3000);
    } catch (error) {
      console.error('Error starting validation:', error);
      setLoading(false);
    }
  };

  const applyCorrection = async (recordId, correctionData) => {
    try {
      // In a real app, this would send the correction to the API
      const response = await fetch(`${getApiEndpoint('VALIDATION_CORRECT')}/${recordId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(correctionData)
      });

      if (response.ok) {
        setShowCorrectionModal(false);
        setSelectedRecord(null);
        setCorrectionData({});
        fetchValidationData();
        alert('Correction applied successfully!');
      }
    } catch (error) {
      console.error('Error applying correction:', error);
      alert('Failed to apply correction. Please try again.');
    }
  };

  const markAsValid = async (recordId) => {
    try {
      const response = await fetch(`${getApiEndpoint('VALIDATION_VALIDATE')}/${recordId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchValidationData();
        alert('Record marked as valid!');
      }
    } catch (error) {
      console.error('Error marking record as valid:', error);
      alert('Failed to mark record as valid. Please try again.');
    }
  };

  const openCorrectionModal = (record) => {
    setSelectedRecord(record);
    setCorrectionData({
      suggestedValue: record.suggestedValue,
      description: record.description
    });
    setShowCorrectionModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'corrected':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'validated':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'corrected':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredResults = validationResults.filter(record =>
    record.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.field?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.originalValue?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(record => 
    filterStatus === 'all' || record.status === filterStatus
  ).filter(record => 
    filterType === 'all' || record.type === filterType
  );

  const exportValidationReport = () => {
    const headers = ['ID', 'Type', 'Field', 'Original Value', 'Suggested Value', 'Status', 'Confidence', 'Error Type', 'Severity', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(record => [
        record.id,
        record.type,
        record.field,
        `"${record.originalValue}"`,
        `"${record.suggestedValue}"`,
        record.status,
        record.confidence,
        record.errorType,
        record.severity,
        `"${record.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Validation & Error Correction</h1>
            <p className="text-gray-600 mt-2">AI-powered data validation and intelligent error correction</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={startValidation}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              <span>{loading ? 'Validating...' : 'Start Validation'}</span>
            </button>
            <button
              onClick={exportValidationReport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{validationStats.totalRecords}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valid</p>
              <p className="text-2xl font-bold text-gray-900">{validationStats.validRecords}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Invalid</p>
              <p className="text-2xl font-bold text-gray-900">{validationStats.invalidRecords}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Corrected</p>
              <p className="text-2xl font-bold text-gray-900">{validationStats.correctedRecords}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{validationStats.accuracy}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="validated">Validated</option>
              <option value="pending">Pending</option>
              <option value="corrected">Corrected</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="college">College</option>
              <option value="program">Program</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchValidationData}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validation Results Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Validation Results</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggestion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.type} - {record.field}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.originalValue}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(record.severity)}`}>
                          {record.severity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.errorType}</div>
                        <div className="text-sm text-gray-500">{record.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.suggestedValue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${record.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{record.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openCorrectionModal(record)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Apply Correction"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => markAsValid(record.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Mark as Valid"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openCorrectionModal(record)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Correction Modal */}
      {showCorrectionModal && selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Apply Correction</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Original Value</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedRecord.originalValue}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Suggested Value</label>
                  <input
                    type="text"
                    value={correctionData.suggestedValue}
                    onChange={(e) => setCorrectionData({...correctionData, suggestedValue: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={correctionData.description}
                    onChange={(e) => setCorrectionData({...correctionData, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => applyCorrection(selectedRecord.id, correctionData)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Apply Correction
                  </button>
                  <button
                    onClick={() => setShowCorrectionModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataValidation;
