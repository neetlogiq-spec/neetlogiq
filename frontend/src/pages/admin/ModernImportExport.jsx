import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Info,
  Settings,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Database,
  Cloud,
  Shield,
  Clock,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const ModernImportExport = () => {
  const [importFile, setImportFile] = useState(null);
  const [importConfig, setImportConfig] = useState({
    authority: 'KEA',
    year: new Date().getFullYear(),
    quota: 'state',
    overwriteExisting: false,
    validateOnly: false
  });
  const [importStatus, setImportStatus] = useState('idle');
  const [importResult, setImportResult] = useState(null);
  const [exportConfig, setExportConfig] = useState({
    year: '',
    authority: '',
    quota: '',
    format: 'csv'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const authorities = [
    { code: 'KEA', name: 'Karnataka Examinations Authority', color: 'from-blue-500 to-cyan-500' },
    { code: 'AIQ', name: 'All India Quota', color: 'from-purple-500 to-pink-500' },
    { code: 'MCC', name: 'Medical Counselling Committee', color: 'from-emerald-500 to-teal-500' },
    { code: 'NEET', name: 'National Eligibility cum Entrance Test', color: 'from-orange-500 to-red-500' }
  ];

  const quotas = [
    { code: 'state', name: 'State Quota', color: 'from-blue-500 to-cyan-500' },
    { code: 'aiq', name: 'All India Quota', color: 'from-purple-500 to-pink-500' },
    { code: 'all_india', name: 'All India', color: 'from-emerald-500 to-teal-500' },
    { code: 'central', name: 'Central Quota', color: 'from-orange-500 to-red-500' },
    { code: 'deemed', name: 'Deemed University', color: 'from-indigo-500 to-purple-500' }
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setImportFile(file);
        setImportStatus('idle');
        setImportResult(null);
      }
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setImportFile(file);
      setImportStatus('idle');
      setImportResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    setImportStatus('uploading');

    try {
      // Get admin session for authentication
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('No admin session found');
      }
      
      const session = JSON.parse(adminSession);
      const credentials = btoa(`${session.username}:${session.password}`);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('authority', importConfig.authority);
      formData.append('year', importConfig.year.toString());
      formData.append('quota', importConfig.quota);
      formData.append('overwriteExisting', importConfig.overwriteExisting.toString());

      // Send import request
      const response = await fetch('/api/sector_xp_12/import', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setImportStatus('completed');
        setImportResult({
          success: true,
          data: result.data
        });
        
        // Show success message
        console.log('Import successful:', result);
      } else {
        const errorData = await response.json();
        setImportStatus('error');
        setImportResult({
          success: false,
          error: errorData.error || 'Import failed'
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImportResult({
        success: false,
        error: error.message || 'Network error during import'
      });
    }
  };

  const handleExport = async () => {
    try {
      // Get admin session for authentication
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('No admin session found');
      }
      
      const session = JSON.parse(adminSession);
      const credentials = btoa(`${session.username}:${session.password}`);

      // Build query parameters
      const params = new URLSearchParams();
      if (exportConfig.year) params.append('year', exportConfig.year);
      if (exportConfig.authority) params.append('authority', exportConfig.authority);
      if (exportConfig.quota) params.append('quota', exportConfig.quota);
      params.append('format', exportConfig.format);

      // Send export request
      const response = await fetch(`/api/sector_xp_12/export?${params.toString()}`, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        if (exportConfig.format === 'csv') {
          // Handle CSV download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cutoffs-export-${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          alert('CSV export downloaded successfully!');
        } else {
          // Handle JSON response
          const result = await response.json();
          console.log('Export data:', result);
          alert(`Export completed! Found ${result.data.length} records.`);
        }
      } else {
        const errorData = await response.json();
        alert(`Export failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportStatus('idle');
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = () => {
    switch (importStatus) {
      case 'uploading':
        return <div className="relative">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDelay: '-0.5s' }}></div>
        </div>;
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600" />;
      default:
        return <FileText className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (importStatus) {
      case 'idle':
        return 'Ready to import';
      case 'uploading':
        return 'Processing your data...';
      case 'completed':
        return 'Import successful!';
      case 'error':
        return 'Import failed';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Glassmorphism */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl"></div>
        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl shadow-gray-900/5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
                Import & Export Cutoffs
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                Manage your cutoff data with enterprise-grade tools. Import CSV files with intelligent parsing, 
                export data for analysis, and maintain data integrity with advanced validation.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                  <Database className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Import Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-gray-900/5 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center">
              <Upload className="h-6 w-6 mr-3" />
              Import Cutoffs
            </h2>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
              <span className="text-sm text-gray-500 font-medium">Smart Import</span>
            </div>
          </div>

          {/* Drag & Drop File Upload */}
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-blue-400 bg-blue-50/50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {!importFile ? (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Drop your CSV file here
                  </p>
                  <p className="text-gray-600 mb-4">
                    or <span className="text-blue-600 font-medium">browse files</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports .csv files up to 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {importFile.name}
                  </p>
                  <p className="text-gray-600 mb-4">
                    {(importFile.size / 1024).toFixed(1)} KB • Ready to import
                  </p>
                  <button
                    onClick={resetImport}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Remove file
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Import Configuration */}
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-600" />
              Import Configuration
            </h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authority
                </label>
                <select
                  value={importConfig.authority}
                  onChange={(e) => setImportConfig({ ...importConfig, authority: e.target.value })}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                >
                  {authorities.map(auth => (
                    <option key={auth.code} value={auth.code}>
                      {auth.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={importConfig.year}
                  onChange={(e) => setImportConfig({ ...importConfig, year: parseInt(e.target.value) })}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quota
                </label>
                <select
                  value={importConfig.quota}
                  onChange={(e) => setImportConfig({ ...importConfig, quota: e.target.value })}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                >
                  {quotas.map(quota => (
                    <option key={quota.code} value={quota.code}>
                      {quota.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importConfig.overwriteExisting}
                    onChange={(e) => setImportConfig({ ...importConfig, overwriteExisting: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Overwrite existing</span>
                </label>
              </div>
            </div>
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={!importFile || importStatus === 'uploading'}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {importStatus === 'uploading' ? 'Processing...' : 'Import Cutoffs'}
          </button>

          {/* Import Status */}
          {importStatus !== 'idle' && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50/30 border border-blue-200">
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-700">
                  {getStatusText()}
                </span>
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="mt-6 p-6 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Import Successful!</h4>
                </div>
                
                {importResult.data?.parseSummary && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/50 p-3 rounded-xl">
                      <div className="text-green-700 font-semibold">{importResult.data.parseSummary.successRows}</div>
                      <div className="text-green-600">Rows processed</div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-xl">
                      <div className="text-red-700 font-semibold">{importResult.data.parseSummary.errorRows}</div>
                      <div className="text-red-600">Errors found</div>
                    </div>
                  </div>
                )}
                
                {importResult.data?.importSummary && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/50 p-3 rounded-xl text-center">
                      <div className="text-blue-700 font-semibold">{importResult.data.importSummary.collegesCreated}</div>
                      <div className="text-blue-600">Colleges</div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-xl text-center">
                      <div className="text-purple-700 font-semibold">{importResult.data.importSummary.programsCreated}</div>
                      <div className="text-purple-600">Programs</div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-xl text-center">
                      <div className="text-emerald-700 font-semibold">{importResult.data.importSummary.cutoffsCreated}</div>
                      <div className="text-emerald-600">Cutoffs</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-gray-900/5 p-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 flex items-center">
            <Download className="h-6 w-6 mr-3" />
            Export Cutoffs
          </h2>

          {/* Export Configuration */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={exportConfig.year}
                onChange={(e) => setExportConfig({ ...exportConfig, year: e.target.value })}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authority
              </label>
              <select
                value={exportConfig.authority}
                onChange={(e) => setExportConfig({ ...exportConfig, authority: e.target.value })}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
              >
                <option value="">All Authorities</option>
                {authorities.map(auth => (
                  <option key={auth.code} value={auth.code}>
                    {auth.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quota
              </label>
              <select
                value={exportConfig.quota}
                onChange={(e) => setExportConfig({ ...exportConfig, quota: e.target.value })}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
              >
                <option value="">All Quotas</option>
                {quotas.map(quota => (
                  <option key={quota.code} value={quota.code}>
                    {quota.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={exportConfig.format}
                onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value })}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
              >
                <option value="csv">CSV (Recommended)</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-2xl font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Export Cutoffs
          </button>

          {/* Export Info */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div className="text-sm text-emerald-700">
                <p className="font-medium">Export Information</p>
                <p className="mt-1">
                  Export will include all cutoff data matching your selected filters. 
                  CSV format is recommended for spreadsheet applications and data analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Format Guide */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-gray-900/5 p-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6 flex items-center">
          <FileText className="h-6 w-6 mr-3" />
          CSV Format Guide
        </h2>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Required Columns</h3>
            <div className="space-y-3">
              {[
                { field: 'round', desc: 'Round number (e.g., r1, r2, r3)', example: 'r1' },
                { field: 'quota', desc: 'Quota type (e.g., state, aiq, all_india)', example: 'state' },
                { field: 'college_name', desc: 'Full college name with address', example: 'A.J.INSTITUTE OF MEDICAL SCIENCES' },
                { field: 'college_location', desc: 'City, State format', example: 'Mangalore, Karnataka' },
                { field: 'course_name', desc: 'Degree program and area of focus', example: 'MD ANAESTHESIOLOGY' },
                { field: 'all_ranks', desc: 'Category:Rank format', example: 'GM:15958, SC:25000' }
              ].map((col, index) => (
                <div key={col.field} className="flex items-start space-x-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{col.field}</div>
                    <div className="text-sm text-gray-600">{col.desc}</div>
                    <div className="text-xs text-gray-500 mt-1">Example: {col.example}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Example CSV Row</h3>
            <div className="bg-gray-900 rounded-2xl p-6 text-green-400 font-mono text-sm overflow-x-auto">
              <div className="space-y-2">
                <div className="text-gray-400"># Header row</div>
                <div>round,quota,college_name,college_location,course_name,all_ranks</div>
                <div className="text-gray-400"># Data row</div>
                <div>r1,state,"A.J.INSTITUTE OF MEDICAL SCIENCES ,NH 17, KUNTIKANA,MANGALORE","Mangalore, Karnataka",MD ANAESTHESIOLOGY,"GM:15958, SC:25000, OBC:30000"</div>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Data Validation</p>
                  <p className="mt-1">
                    Our system automatically validates your CSV data and provides detailed error reports 
                    to ensure data quality and integrity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernImportExport;
