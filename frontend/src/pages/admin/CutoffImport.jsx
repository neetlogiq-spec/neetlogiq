import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Database, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import ModernCard from '../../components/ui/ModernCard';
import ModernButton from '../../components/ui/ModernButton';
import ModernInput from '../../components/ui/ModernInput';

const CutoffImport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Starting upload...');

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadStatus('Upload completed successfully!');
      setSelectedFile(null);
    } catch (error) {
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      clearInterval(interval);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Cutoff Data Import
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Import and process medical college cutoff data with AI-powered validation and intelligent matching
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Upload Section */}
          <div className="lg:col-span-2">
            <ModernCard className="p-8">
              <div className="text-center mb-8">
                <motion.div
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Upload className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  Upload Cutoff Data
                </h2>
                <p className="text-neutral-600">
                  Select your Excel or CSV file containing cutoff information
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-6">
                <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-8 text-center hover:border-primary-400 transition-colors duration-300">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-neutral-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-neutral-900">
                          {selectedFile ? selectedFile.name : 'Choose a file or drag it here'}
                        </p>
                        <p className="text-sm text-neutral-500 mt-1">
                          Supports Excel (.xlsx, .xls) and CSV files
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Selected File Info */}
                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{selectedFile.name}</p>
                        <p className="text-sm text-green-600">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between text-sm text-neutral-600">
                      <span>{uploadStatus}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Upload Button */}
                <ModernButton
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  loading={isUploading}
                  size="lg"
                  className="w-full hover-lift"
                >
                  {isUploading ? 'Uploading...' : 'Process Cutoff Data'}
                </ModernButton>
              </div>
            </ModernCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Records</span>
                  <span className="font-semibold">2,860</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Processed</span>
                  <span className="font-semibold text-green-600">2,450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Pending</span>
                  <span className="font-semibold text-orange-600">410</span>
                </div>
              </div>
            </ModernCard>

            {/* File Requirements */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                File Requirements
              </h3>
              <div className="space-y-3 text-sm text-neutral-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>7 columns: Rank, Quota, College, Course, Category, Round, Year</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Excel (.xlsx, .xls) or CSV format</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Maximum file size: 50MB</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>Data will be validated against existing college database</span>
                </div>
              </div>
            </ModernCard>

            {/* Recent Imports */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Recent Imports
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">KEA 2024 Medical R1</p>
                  <p className="text-xs text-blue-600">2,860 records • 2 hours ago</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">AIQ 2024 Round 1</p>
                  <p className="text-xs text-green-600">1,240 records • 1 day ago</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">DCI 2024 BDS</p>
                  <p className="text-xs text-purple-600">890 records • 3 days ago</p>
                </div>
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CutoffImport;
