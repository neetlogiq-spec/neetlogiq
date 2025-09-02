import React, { useState, useCallback } from 'react';
import { Upload, FileText, Database, CheckCircle, AlertCircle, Eye, Download, RefreshCw, BarChart3 } from 'lucide-react';
import { api } from '../../utils/api';

const IntelligentCutoffs = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [stagingData, setStagingData] = useState([]);
  const [aggregationData, setAggregationData] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingStatus('Processing file...');

    try {
      const formData = new FormData();
      formData.append('cutoffFile', file);

      const response = await api.post('/admin/cutoffs/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.success) {
        setProcessingStatus('File processed successfully!');
        setStagingData(response.data.stagingResults);
        // Refresh staging data
        fetchStagingStatus();
      } else {
        setProcessingStatus(`Error: ${response.error}`);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setProcessingStatus(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchStagingStatus = useCallback(async () => {
    try {
      const response = await api.get('/admin/cutoffs/status');
      if (response.success) {
        setStagingData(response.data.recentRecords);
      }
    } catch (error) {
      console.error('Error fetching staging status:', error);
    }
  }, []);

  const aggregateCutoffs = async (round, year) => {
    try {
      const response = await api.post('/admin/cutoffs/aggregate', {
        round,
        year,
        forceProcess: true
      });

      if (response.success) {
        setAggregationData(response.data);
        setProcessingStatus('Cutoffs aggregated successfully!');
      } else {
        setProcessingStatus(`Error: ${response.error}`);
      }
    } catch (error) {
      console.error('Error aggregating cutoffs:', error);
      setProcessingStatus(`Error: ${error.message}`);
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'matched':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'needs_review':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Intelligent Cutoffs System
          </h1>
          <p className="text-gray-600">
            AI-powered data processing and validation for medical college cutoffs
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'upload', label: 'File Upload', icon: Upload },
              { id: 'staging', label: 'Staging Data', icon: Database },
              { id: 'aggregation', label: 'Aggregation', icon: BarChart3 },
              { id: 'results', label: 'Final Results', icon: CheckCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* File Upload Tab */}
          {activeTab === 'upload' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Upload Cutoff Data File
                </h2>
                <p className="text-gray-600 mb-4">
                  Upload your Excel or CSV file with the 7 required columns:
                  ALL INDIA RANK, QUOTA, COLLEGE/INSTITUTE, COURSE, CATEGORY, ROUND, YEAR
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="mb-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500 font-medium">
                      Choose a file
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Excel (.xlsx, .xls) or CSV files up to 10MB
                </p>
              </div>

              {file && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">{file.name}</p>
                        <p className="text-sm text-blue-700">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={processFile}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Database className="w-4 h-4" />
                      )}
                      <span>{isProcessing ? 'Processing...' : 'Process File'}</span>
                    </button>
                  </div>
                </div>
              )}

              {processingStatus && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{processingStatus}</p>
                </div>
              )}
            </div>
          )}

          {/* Staging Data Tab */}
          {activeTab === 'staging' && (
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Staging Data Review
                </h2>
                <button
                  onClick={fetchStagingStatus}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {stagingData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          College
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quota
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Confidence
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stagingData.slice(0, 20).map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.college_institute}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.course}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.quota}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.all_india_rank}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getConfidenceColor(record.confidence_score)}`}>
                              {(record.confidence_score * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(record.status)}
                              <span className="text-sm text-gray-900 capitalize">
                                {record.status.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stagingData.length > 20 && (
                    <p className="mt-4 text-sm text-gray-500 text-center">
                      Showing first 20 records of {stagingData.length} total
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No staging data available</p>
                  <p className="text-sm text-gray-400">
                    Upload and process a file to see staging data
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Aggregation Tab */}
          {activeTab === 'aggregation' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Cutoff Aggregation
                </h2>
                <p className="text-gray-600 mb-4">
                  Aggregate processed data to create final cutoff rankings
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">KEA Medical 2024</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => aggregateCutoffs('KEA_R1', 2024)}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Aggregate KEA_R1
                    </button>
                    <button
                      onClick={() => aggregateCutoffs('KEA_R2', 2024)}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Aggregate KEA_R2
                    </button>
                    <button
                      onClick={() => aggregateCutoffs('KEA_R3', 2024)}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Aggregate KEA_R3
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">AIQ PG 2024</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => aggregateCutoffs('AIQ_R1', 2024)}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Aggregate AIQ_R1
                    </button>
                    <button
                      onClick={() => aggregateCutoffs('AIQ_R2', 2024)}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Aggregate AIQ_R2
                    </button>
                  </div>
                </div>
              </div>

              {aggregationData && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Aggregation Results</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Round:</span>
                      <span className="ml-2 font-medium">{aggregationData.round}</span>
                    </div>
                    <div>
                      <span className="text-green-700">Year:</span>
                      <span className="ml-2 font-medium">{aggregationData.year}</span>
                    </div>
                    <div>
                      <span className="text-green-700">Total Cutoffs:</span>
                      <span className="ml-2 font-medium">{aggregationData.aggregatedCutoffs}</span>
                    </div>
                    <div>
                      <span className="text-green-700">Status:</span>
                      <span className="ml-2 font-medium text-green-600">Completed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Final Cutoff Results
                </h2>
                <p className="text-gray-600">
                  View and export final aggregated cutoff data
                </p>
              </div>

              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Final results will appear here</p>
                <p className="text-sm text-gray-400">
                  Complete the aggregation process to view final cutoffs
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelligentCutoffs;
