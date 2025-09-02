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
  EyeOff
} from 'lucide-react';

const ImportExport = () => {
  const [importFile, setImportFile] = useState(null);
  const [importConfig, setImportConfig] = useState({
    authority: 'KEA',
    year: new Date().getFullYear(),
    quota: 'state',
    overwriteExisting: false,
    validateOnly: false
  });
  const [importStatus, setImportStatus] = useState('idle'); // idle, uploading, processing, completed, error
  const [importResult, setImportResult] = useState(null);
  const [exportConfig, setExportConfig] = useState({
    year: '',
    authority: '',
    quota: '',
    format: 'csv'
  });
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const authorities = [
    { code: 'KEA', name: 'Karnataka Examinations Authority' },
    { code: 'AIQ', name: 'All India Quota' },
    { code: 'MCC', name: 'Medical Counselling Committee' },
    { code: 'NEET', name: 'National Eligibility cum Entrance Test' }
  ];

  const quotas = [
    { code: 'state', name: 'State Quota' },
    { code: 'aiq', name: 'All India Quota' },
    { code: 'all_india', name: 'All India' },
    { code: 'central', name: 'Central Quota' },
    { code: 'deemed', name: 'Deemed University' }
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
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

    const formData = new FormData();
    formData.append('csvFile', importFile);
    formData.append('authority', importConfig.authority);
    formData.append('year', importConfig.year);
    formData.append('quota', importConfig.quota);
    formData.append('overwriteExisting', importConfig.overwriteExisting);
    formData.append('validateOnly', importConfig.validateOnly);

    try {
      const response = await fetch('/api/cutoffs/import', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setImportResult(result);
        setImportStatus('completed');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImportResult({ error: error.message });
    }
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (exportConfig.year) params.append('year', exportConfig.year);
    if (exportConfig.authority) params.append('authority', exportConfig.authority);
    if (exportConfig.quota) params.append('quota', exportConfig.quota);
    if (exportConfig.format) params.append('format', exportConfig.format);

    try {
      const response = await fetch(`/api/cutoffs/export?${params}`);
      if (response.ok) {
        if (exportConfig.format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cutoffs-${exportConfig.year || 'all'}-${exportConfig.authority || 'all'}-${exportConfig.quota || 'all'}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          const data = await response.json();
          console.log('Export data:', data);
        }
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + error.message);
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
        return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (importStatus) {
      case 'idle':
        return 'Ready to import';
      case 'uploading':
        return 'Uploading file...';
      case 'processing':
        return 'Processing data...';
      case 'completed':
        return 'Import completed';
      case 'error':
        return 'Import failed';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Import & Export Cutoffs
        </h1>
        <p className="text-gray-600">
          Manage your cutoff data by importing CSV files or exporting data for analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Import Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-blue-600" />
              Import Cutoffs
            </h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <div className="flex items-center space-x-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {importFile && (
                <button
                  onClick={resetImport}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {importFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Import Configuration */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authority
              </label>
              <select
                value={importConfig.authority}
                onChange={(e) => setImportConfig({ ...importConfig, authority: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {authorities.map(auth => (
                  <option key={auth.code} value={auth.code}>
                    {auth.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={importConfig.year}
                onChange={(e) => setImportConfig({ ...importConfig, year: parseInt(e.target.value) })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quota
              </label>
              <select
                value={importConfig.quota}
                onChange={(e) => setImportConfig({ ...importConfig, quota: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={!importFile || importStatus === 'uploading'}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {importStatus === 'uploading' ? 'Importing...' : 'Import Cutoffs'}
          </button>

          {/* Import Status */}
          {importStatus !== 'idle' && (
            <div className="mt-4 p-3 rounded-md bg-gray-50 border">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-700">
                  {getStatusText()}
                </span>
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="mt-4 p-4 rounded-md border">
              {importResult.error ? (
                <div className="text-red-700">
                  <h4 className="font-medium">Import Failed</h4>
                  <p className="text-sm">{importResult.error}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-medium text-green-700">Import Successful</h4>
                  {importResult.data?.parseSummary && (
                    <div className="text-sm text-gray-600">
                      <p>Rows parsed: {importResult.data.parseSummary.successRows}</p>
                      <p>Errors: {importResult.data.parseSummary.errorRows}</p>
                    </div>
                  )}
                  {importResult.data?.importSummary && (
                    <div className="text-sm text-gray-600">
                      <p>Colleges created: {importResult.data.importSummary.collegesCreated}</p>
                      <p>Programs created: {importResult.data.importSummary.programsCreated}</p>
                      <p>Cutoffs created: {importResult.data.importSummary.cutoffsCreated}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2 text-green-600" />
            Export Cutoffs
          </h2>

          {/* Export Configuration */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={exportConfig.year}
                onChange={(e) => setExportConfig({ ...exportConfig, year: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authority
              </label>
              <select
                value={exportConfig.authority}
                onChange={(e) => setExportConfig({ ...exportConfig, authority: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quota
              </label>
              <select
                value={exportConfig.quota}
                onChange={(e) => setExportConfig({ ...exportConfig, quota: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={exportConfig.format}
                onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Export Cutoffs
          </button>

          {/* Export Info */}
          <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Export Information</p>
                <p className="mt-1">
                  Export will include all cutoff data matching your selected filters. 
                  CSV format is recommended for spreadsheet applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Format Guide */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-gray-600" />
          CSV Format Guide
        </h2>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-900 mb-2">Required Columns:</h3>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
            <div><strong>round:</strong> Round number (e.g., r1, r2, r3)</div>
            <div><strong>quota:</strong> Quota type (e.g., state, aiq, all_india)</div>
            <div><strong>college_name:</strong> Full college name with address</div>
            <div><strong>college_location:</strong> City, State format</div>
            <div><strong>course_name:</strong> Degree program and area of focus</div>
            <div><strong>all_ranks:</strong> Category:Rank format (e.g., "GM:15958, SC:25000")</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Example CSV Row:</h3>
          <pre className="text-sm text-gray-600 bg-white p-2 rounded border overflow-x-auto">
{`round,quota,college_name,college_location,course_name,all_ranks
r1,state,"A.J.INSTITUTE OF MEDICAL SCIENCES ,NH 17, KUNTIKANA,MANGALORE","Mangalore, Karnataka",MD ANAESTHESIOLOGY,"GM:15958, SC:25000, OBC:30000"`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
