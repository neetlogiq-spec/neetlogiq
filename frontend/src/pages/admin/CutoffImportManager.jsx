import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Eye,
  Trash2,
  Play,
  Pause,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Building2,
  GraduationCap,
  Target,
  Zap,
  Sparkles
} from 'lucide-react';
import { getApiEndpoint } from '../../config/api';

const CutoffImportManager = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [importHistory, setImportHistory] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [stats, setStats] = useState({
    totalImports: 0,
    successfulImports: 0,
    failedImports: 0,
    totalRecords: 0,
    lastImport: null
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [fileInputRef] = useState(useRef());

  useEffect(() => {
    fetchImportHistory();
    fetchStats();
  }, []);

  const fetchImportHistory = async () => {
    try {
      const response = await fetch(getApiEndpoint('CUTOFF_SESSIONS'), {
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setImportHistory(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching import history:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(getApiEndpoint('CUTOFF_STATS'), {
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type === 'text/csv' || 
                         file.type === 'application/vnd.ms-excel' ||
                         file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        alert(`Invalid file type: ${file.name}. Please upload CSV or Excel files only.`);
      }
      if (!isValidSize) {
        alert(`File too large: ${file.name}. Please upload files smaller than 10MB.`);
      }
      
      return isValidType && isValidSize;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(getApiEndpoint('CUTOFF_UPLOAD'), {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentSession(result.session);
        setFiles([]);
        fetchImportHistory();
        fetchStats();
        alert('Files uploaded successfully! Processing will begin shortly.');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const processFiles = async () => {
    if (!currentSession) {
      alert('No active session to process');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${getApiEndpoint('CUTOFF_PROCESS')}/${currentSession.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Processing completed! ${result.processedRecords} records processed.`);
        fetchImportHistory();
        fetchStats();
      } else {
        throw new Error('Processing failed');
      }
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const previewFile = async (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim() || '';
        });
        return row;
      });
      
      setPreviewData(preview);
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `College Name,Program,Category,Round,Year,Opening Rank,Closing Rank,Seats
AIIMS Delhi,MBBS,General,1,2023,1,50,100
AIIMS Delhi,MBBS,OBC,1,2023,51,100,50
AIIMS Delhi,MBBS,SC,1,2023,101,150,25
AIIMS Delhi,MBBS,ST,1,2023,151,200,25`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cutoff_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
      <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold text-gray-900">Cutoff Import Manager</h1>
            <p className="text-gray-600 mt-2">Upload, validate, and process cutoff data from CSV/Excel files</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={downloadTemplate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Imports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalImports}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successfulImports}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failedImports}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRecords.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h3>
        
        {/* File Input */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Select Files
              </button>
              <p className="text-sm text-gray-500 mt-2">
                CSV, Excel files up to 10MB each
              </p>
            </div>
          </div>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Files:</h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
              </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => previewFile(file)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
                </div>

            <div className="mt-4 flex space-x-3">
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {uploading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
              </button>
              
              {currentSession && (
                  <button
                  onClick={processFiles}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {processing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>{processing ? 'Processing...' : 'Process Files'}</span>
                  </button>
              )}
            </div>
          </div>
        )}
                </div>

      {/* Import History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Import History</h3>
        </div>
                  <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Files
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Records
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
              {importHistory.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                      Session #{session.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.description || 'Cutoff Import'}
                              </div>
                            </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.file_count || 0} files
                  </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(session.status)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                              </div>
                            </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.record_count || 0}
                            </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(session.created_at).toLocaleDateString()}
                            </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                          setCurrentSession(session); // Set current session for preview
                          setShowPreview(true);
                                  }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                >
                        <Eye className="w-4 h-4" />
                                </button>
                                <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

      {/* File Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">File Preview</h3>
              <button
                  onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                  <XCircle className="w-6 h-6" />
              </button>
            </div>
            
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {previewData.length > 0 && Object.keys(previewData[0]).map((header) => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Showing first 5 rows of {previewData.length} total rows
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CutoffImportManager;
