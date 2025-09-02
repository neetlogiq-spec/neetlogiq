import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Database,
  FileText,
  BarChart3,
  Settings,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Filter,
  Search,
  Plus,
  Save,
  ArrowRight,
  Shield,
  Target,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react';


const CutoffDataManagement = () => {
  const [loading, setLoading] = useState(false);
  const [stagingData, setStagingData] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [importHistory, setImportHistory] = useState([]);
  const [stats, setStats] = useState({
    totalStaging: 0,
    validated: 0,
    pending: 0,
    errors: 0,
    accuracy: 0
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationProgress, setValidationProgress] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [qualityMetrics, setQualityMetrics] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [bulkEditData, setBulkEditData] = useState({});

  useEffect(() => {
    fetchStagingData();
    fetchValidationResults();
    fetchImportHistory();
    fetchStats();
  }, []);

  const fetchStagingData = async () => {
    try {
      const response = await fetch('/api/sector_xp_12/admin/cutoffs/staging', {
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStagingData(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching staging data:', error);
    }
  };

  const fetchValidationResults = async () => {
    try {
      // Use staging data as validation results
      const response = await fetch('/api/sector_xp_12/admin/cutoffs/staging', {
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setValidationResults(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching validation results:', error);
    }
  };

  const fetchImportHistory = async () => {
    try {
      const response = await fetch('/api/sector_xp_12/admin/cutoffs/history', {
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setImportHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching import history:', error);
    }
  };

  const fetchPreviewData = async () => {
    try {
      const response = await fetch('/api/sector_xp_12/admin/cutoffs/preview', {
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.preview_data);
      }
    } catch (error) {
      console.error('Error fetching preview data:', error);
    }
  };

  const fetchQualityMetrics = async () => {
    try {
      const response = await fetch('/api/sector_xp_12/admin/cutoffs/quality-metrics', {
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQualityMetrics(data.quality_metrics);
      }
    } catch (error) {
      console.error('Error fetching quality metrics:', error);
    }
  };

  const handleBulkEdit = async () => {
    try {
      if (selectedRecords.length === 0) {
        alert('Please select records to edit');
        return;
      }

      const response = await fetch('/api/sector_xp_12/admin/cutoffs/bulk-edit', {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordIds: selectedRecords,
          updates: bulkEditData
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Bulk update completed! ${result.records_updated} records updated.`);
        setShowBulkEditModal(false);
        setSelectedRecords([]);
        setBulkEditData({});
        fetchStagingData();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Bulk update failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in bulk edit:', error);
      alert('Bulk update failed');
    }
  };

  const toggleRecordSelection = (recordId) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleExport = async (format) => {
    try {
      const response = await fetch(`/api/sector_xp_12/admin/cutoffs/export?format=${format}&status=all`, {
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
        }
      });

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cutoff_data_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cutoff_data_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        alert(`${format.toUpperCase()} export completed successfully!`);
      } else {
        alert(`Export failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed');
    }
  };

  const handleGenerateReport = async (reportType) => {
    try {
      const response = await fetch(`/api/sector_xp_12/admin/cutoffs/reports?type=${reportType}`, {
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Display report in a modal or download as file
        const reportContent = JSON.stringify(data, null, 2);
        const blob = new Blob([reportContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert(`${reportType} report generated successfully!`);
      } else {
        alert(`Report generation failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Report generation failed');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/sector_xp_12/admin/cutoffs/stats', {
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalStaging: data.total_records || 0,
          validated: data.validated || 0,
          pending: data.pending_validation || 0,
          errors: data.rejected || 0,
          accuracy: data.validation_progress || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/sector_xp_12/admin/cutoffs/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`File uploaded successfully! ${result.records_added} records added to staging.`);
        setShowUploadModal(false);
        fetchStagingData();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const startValidation = async () => {
    try {
      setLoading(true);
      setValidationProgress(0);

      const response = await fetch('/api/sector_xp_12/admin/cutoffs/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setValidationProgress(100);
        alert(`Validation completed! ${result.records_processed} records processed.`);
        fetchValidationResults();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Validation failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error starting validation:', error);
      alert('Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const approveRecord = async (recordId) => {
    try {
      const response = await fetch(`/api/sector_xp_12/admin/cutoffs/approve/${recordId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Record approved successfully');
        fetchStagingData();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Approval failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving record:', error);
      alert('Approval failed');
    }
  };

  const editRecord = async (recordId, updatedData) => {
    try {
      const response = await fetch(`/api/sector_xp_12/admin/cutoffs/staging/${recordId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        alert('Record updated successfully');
        fetchStagingData();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Update failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Update failed');
    }
  };

  const importToUnified = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/sector_xp_12/admin/cutoffs/import', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Import successful! ${result.records_imported} records imported to unified database.`);
        if (result.errors) {
          console.warn('Import completed with errors:', result.errors);
        }
        fetchStagingData();
        fetchStats();
        fetchImportHistory();
      } else {
        const error = await response.json();
        alert(`Import failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error importing to unified:', error);
      alert('Import failed');
    } finally {
      setLoading(false);
    }
  };

  const resetStaging = async () => {
    if (window.confirm('Are you sure you want to reset all staging data? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/sector_xp_12/admin/cutoffs/staging/reset', {
          method: 'DELETE',
          headers: {
            'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          alert('Staging data reset successfully');
          fetchStagingData();
          fetchStats();
        } else {
          const error = await response.json();
          alert(`Reset failed: ${error.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error resetting staging:', error);
        alert('Reset failed');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
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
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
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
            <h1 className="text-3xl font-bold text-gray-900">Cutoff Data Management</h1>
            <p className="text-gray-600 mt-2">Import, validate, and correct cutoff data before importing to unified database</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>Upload File</span>
            </button>
            <button
              onClick={startValidation}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Shield className="w-5 h-5" />
              <span>Start Validation</span>
            </button>
            <button
              onClick={importToUnified}
              disabled={loading || stats.validated === 0}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Database className="w-5 h-5" />
              <span>Import to Unified</span>
            </button>
            <button
              onClick={() => { fetchPreviewData(); setShowPreviewModal(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span>Data Preview</span>
            </button>
            <button
              onClick={() => { fetchQualityMetrics(); }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Quality Metrics</span>
            </button>
            <button
              onClick={() => setShowBulkEditModal(true)}
              disabled={selectedRecords.length === 0}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Edit className="w-5 h-5" />
              <span>Bulk Edit ({selectedRecords.length})</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => handleGenerateReport('summary')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Summary Report</span>
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
              <p className="text-sm font-medium text-gray-600">Total Staging</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStaging}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Validated</p>
              <p className="text-2xl font-bold text-gray-900">{stats.validated}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.errors}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.accuracy}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Progress */}
      {validationProgress > 0 && validationProgress < 100 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Validation Progress</h3>
            <span className="text-sm text-gray-500">{validationProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${validationProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Validating cutoff data...</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters & Search</h3>
          <button
            onClick={resetStaging}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Reset Staging Data
          </button>
        </div>
        <div className="flex space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="validated">Validated</option>
            <option value="error">Error</option>
          </select>
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Staging Data Table */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Staging Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRecords(stagingData.map(record => record.id));
                      } else {
                        setSelectedRecords([]);
                      }
                    }}
                    checked={selectedRecords.length === stagingData.length && stagingData.length > 0}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cutoff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stagingData
                .filter(item => filterStatus === 'all' || item.status === filterStatus)
                .filter(item => 
                  searchTerm === '' || 
                  item.college_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.program_name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(record.id)}
                      onChange={() => toggleRecordSelection(record.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.college_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.program_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.cutoff_score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approveRecord(record.id)}
                        disabled={record.status === 'validated'}
                        className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowValidationModal(true)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
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

      {/* Import History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Import History</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {importHistory.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{session.filename}</h4>
                    <p className="text-sm text-gray-600">
                      {session.recordsProcessed} records processed • {session.validRecords} valid • {session.errorRecords} errors
                    </p>
                    <p className="text-xs text-gray-500">{new Date(session.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      session.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Cutoff File</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleFileUpload(selectedFile)}
                    disabled={!selectedFile || loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    onClick={() => setShowUploadModal(false)}
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

      {/* Data Preview Modal */}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Data Preview - {previewData.filename}</h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">File Summary</h4>
                  <p className="text-sm text-blue-700">Total Rows: {previewData.total_rows}</p>
                  <p className="text-sm text-blue-700">Valid Records: {previewData.validation_summary.valid_records}</p>
                  <p className="text-sm text-blue-700">Total Errors: {previewData.validation_summary.total_errors}</p>
                  <p className="text-sm text-blue-700">Total Warnings: {previewData.validation_summary.total_warnings}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Sample Records</h4>
                  <div className="space-y-2">
                    {previewData.sample_records.slice(0, 3).map((record, index) => (
                      <div key={index} className="text-sm text-green-700">
                        Row {record.row}: {record.college_name} - {record.program_name} ({record.category})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quality Metrics Modal */}
      {qualityMetrics && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Data Quality Metrics</h3>
                <button
                  onClick={() => setQualityMetrics(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Quality Score</h4>
                  <div className="text-2xl font-bold text-blue-600">{qualityMetrics.data_quality_score}%</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-700">Validation Rate</p>
                    <p className="text-lg font-semibold text-green-900">{qualityMetrics.validation_rate}%</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-700">Error Rate</p>
                    <p className="text-lg font-semibold text-red-900">{qualityMetrics.error_rate}%</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-700">Completeness Score</p>
                  <p className="text-lg font-semibold text-yellow-900">{qualityMetrics.completeness_score}%</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setQualityMetrics(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Bulk Edit Records</h3>
                <button
                  onClick={() => setShowBulkEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Editing {selectedRecords.length} selected records
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">College Name</label>
                  <input
                    type="text"
                    value={bulkEditData.college_name || ''}
                    onChange={(e) => setBulkEditData({...bulkEditData, college_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave empty to skip"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Name</label>
                  <input
                    type="text"
                    value={bulkEditData.program_name || ''}
                    onChange={(e) => setBulkEditData({...bulkEditData, program_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave empty to skip"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={bulkEditData.category || ''}
                    onChange={(e) => setBulkEditData({...bulkEditData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                    <option value="PWD">PWD</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cutoff Score</label>
                  <input
                    type="number"
                    value={bulkEditData.cutoff_score || ''}
                    onChange={(e) => setBulkEditData({...bulkEditData, cutoff_score: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave empty to skip"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleBulkEdit}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Apply Changes
                </button>
                <button
                  onClick={() => setShowBulkEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CutoffDataManagement;
