import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Filter,
  Calendar,
  Eye,
  FileText,
  Users,
  Building2,
  Award,
  Target,
  Shield,
  Edit,
  CheckCircle,
  AlertCircle,
  Zap,
  Lock,
  RefreshCw
} from 'lucide-react';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample data for reports
  const reportData = {
    overview: {
      title: 'Platform Overview Report',
      description: 'Comprehensive analysis of colleges, programs, and user activity',
      icon: BarChart3,
      metrics: [
        { label: 'Total Colleges', value: '2,401', change: '+12.5%', trend: 'up' },
        { label: 'Active Programs', value: '15,680', change: '+8.2%', trend: 'up' },
        { label: 'Total Cutoffs', value: '45,620', change: '+25.7%', trend: 'up' },
        { label: 'Active Users', value: '1,247', change: '+5.3%', trend: 'up' }
      ]
    },
    colleges: {
      title: 'College Analysis Report',
      description: 'Detailed breakdown of college distribution and performance',
      icon: Building2,
      metrics: [
        { label: 'Medical Colleges', value: '848', change: '+2.4%', trend: 'up' },
        { label: 'Dental Colleges', value: '328', change: '+1.8%', trend: 'up' },
        { label: 'DNB Colleges', value: '1,224', change: '+3.1%', trend: 'up' },
        { label: 'Government', value: '456', change: '+0.9%', trend: 'up' }
      ]
    },
    cutoffs: {
      title: 'Cutoff Trends Report',
      description: 'Analysis of cutoff patterns and rank distributions',
      icon: TrendingUp,
      metrics: [
        { label: 'New Cutoffs', value: '23', change: '+15.2%', trend: 'up' },
        { label: 'Updated Cutoffs', value: '156', change: '+8.7%', trend: 'up' },
        { label: 'Average Rank', value: '45,678', change: '-2.1%', trend: 'down' },
        { label: 'Top Programs', value: '89', change: '+12.3%', trend: 'up' }
      ]
    },
    verification: {
      title: 'Pending Verification Report',
      description: 'Colleges and data awaiting verification and approval',
      icon: Shield,
      metrics: [
        { label: 'Pending Colleges', value: '51', change: '+8.2%', trend: 'up' },
        { label: 'Under Review', value: '23', change: '-5.1%', trend: 'down' },
        { label: 'Rejected', value: '12', change: '+2.3%', trend: 'up' },
        { label: 'Approved Today', value: '18', change: '+15.7%', trend: 'up' }
      ]
    },
    editing: {
      title: 'Data Editing Report',
      description: 'Track changes and modifications to college information',
      icon: Edit,
      metrics: [
        { label: 'Recent Edits', value: '89', change: '+12.4%', trend: 'up' },
        { label: 'Pending Changes', value: '34', change: '+6.8%', trend: 'up' },
        { label: 'Approved Edits', value: '156', change: '+8.9%', trend: 'up' },
        { label: 'Rejected Edits', value: '7', change: '-2.1%', trend: 'down' }
      ]
    },
    clearance: {
      title: 'Clearance Report',
      description: 'Documentation and compliance clearance status',
      icon: CheckCircle,
      metrics: [
        { label: 'Pending Clearance', value: '67', change: '+9.3%', trend: 'up' },
        { label: 'Under Review', value: '28', change: '+4.2%', trend: 'up' },
        { label: 'Cleared Today', value: '42', change: '+18.7%', trend: 'up' },
        { label: 'Compliance Rate', value: '94.2%', change: '+1.8%', trend: 'up' }
      ]
    },
    errors: {
      title: 'System Errors Report',
      description: 'Track system errors, warnings, and critical issues',
      icon: AlertCircle,
      metrics: [
        { label: 'Critical Errors', value: '3', change: '-40.0%', trend: 'down' },
        { label: 'Warnings', value: '28', change: '+12.0%', trend: 'up' },
        { label: 'Resolved Today', value: '15', change: '+25.0%', trend: 'up' },
        { label: 'Uptime', value: '99.7%', change: '+0.2%', trend: 'up' }
      ]
    },
    verificationStatus: {
      title: 'Verification Status Report',
      description: 'Comprehensive verification workflow tracking',
      icon: Shield,
      metrics: [
        { label: 'Total Pending', value: '89', change: '+5.6%', trend: 'up' },
        { label: 'In Progress', value: '34', change: '-8.1%', trend: 'down' },
        { label: 'Completed Today', value: '67', change: '+18.9%', trend: 'up' },
        { label: 'Success Rate', value: '96.8%', change: '+1.2%', trend: 'up' }
      ]
    },
    dataQuality: {
      title: 'Data Quality Report',
      description: 'Monitor data accuracy, completeness, and consistency',
      icon: Award,
      metrics: [
        { label: 'Data Completeness', value: '94.2%', change: '+2.1%', trend: 'up' },
        { label: 'Accuracy Score', value: '97.8%', change: '+1.5%', trend: 'up' },
        { label: 'Validation Errors', value: '23', change: '-12.5%', trend: 'down' },
        { label: 'Quality Score', value: 'A+', change: 'Stable', trend: 'stable' }
      ]
    },
    performance: {
      title: 'Performance Report',
      description: 'System performance metrics and optimization insights',
      icon: Zap,
      metrics: [
        { label: 'Response Time', value: '245ms', change: '-15.2%', trend: 'down' },
        { label: 'Throughput', value: '1,234 req/s', change: '+8.7%', trend: 'up' },
        { label: 'Error Rate', value: '0.12%', change: '-25.0%', trend: 'down' },
        { label: 'Performance Score', value: 'A', change: '+1 Grade', trend: 'up' }
      ]
    },
    security: {
      title: 'Security Report',
      description: 'Security events, threats, and compliance status',
      icon: Lock,
      metrics: [
        { label: 'Security Events', value: '5', change: '-37.5%', trend: 'down' },
        { label: 'Threats Blocked', value: '156', change: '+12.8%', trend: 'up' },
        { label: 'Vulnerabilities', value: '2', change: '-60.0%', trend: 'down' },
        { label: 'Security Score', value: '98.5%', change: '+1.2%', trend: 'up' }
      ]
    },
    compliance: {
      title: 'Compliance Report',
      description: 'Regulatory compliance and audit status',
      icon: FileText,
      metrics: [
        { label: 'Compliance Score', value: '96.8%', change: '+2.1%', trend: 'up' },
        { label: 'Audit Findings', value: '8', change: '-20.0%', trend: 'down' },
        { label: 'Remediation Rate', value: '94.2%', change: '+3.1%', trend: 'up' },
        { label: 'Next Audit', value: '45 days', change: 'Countdown', trend: 'stable' }
      ]
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    // Here you would typically trigger download or show preview
  };

  return (
    <div className="space-y-8">
      {/* Test Banner - Remove this after confirming UI works */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl text-center font-bold text-lg">
        📊 REPORTS PAGE LOADED SUCCESSFULLY! 📊
        <br />
        <span className="text-sm font-normal">This confirms the Reports page is working</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-white/20 rounded-2xl">
            <BarChart3 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-indigo-100">Generate comprehensive reports and insights</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Total Reports</h3>
            <p className="text-2xl font-bold">24</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <h3 className="font-semibold mb-2">This Month</h3>
            <p className="text-2xl font-bold">8</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Downloads</h3>
            <p className="text-2xl font-bold">156</p>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {Object.entries(reportData).map(([key, report]) => {
          const Icon = report.icon;
          const isSelected = selectedReport === key;
          
          return (
            <div
              key={key}
              onClick={() => setSelectedReport(key)}
              className={`cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? 'ring-2 ring-purple-500 scale-105' 
                  : 'hover:scale-105'
              }`}
            >
              <div className={`p-6 rounded-3xl shadow-xl border transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                  : 'bg-white/80 backdrop-blur-xl border-white/20 hover:shadow-2xl'
              }`}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`p-3 rounded-2xl ${
                    isSelected ? 'bg-white/20' : 'bg-purple-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      isSelected ? 'text-white' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${
                      isSelected ? 'text-white' : 'text-gray-900'
                    }`}>
                      {report.title}
                    </h3>
                    <p className={`text-sm ${
                      isSelected ? 'text-purple-100' : 'text-gray-600'
                    }`}>
                      {report.description}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {report.metrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className={`text-sm ${
                        isSelected ? 'text-purple-100' : 'text-gray-600'
                      }`}>
                        {metric.label}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${
                          isSelected ? 'text-white' : 'text-gray-900'
                        }`}>
                          {metric.value}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          metric.trend === 'up' 
                            ? 'bg-green-100 text-green-800' 
                            : metric.trend === 'down'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Controls */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="1year">Last year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <option value="all">All Categories</option>
                <option value="operational">Operational</option>
                <option value="technical">Technical</option>
                <option value="security">Security</option>
                <option value="compliance">Compliance</option>
                <option value="performance">Performance</option>
                <option value="data">Data Quality</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <option value="all">All Trends</option>
                <option value="improving">Improving</option>
                <option value="declining">Declining</option>
                <option value="stable">Stable</option>
                <option value="critical">Critical Issues</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105">
          <Eye className="h-5 w-5" />
          <span>Preview Report</span>
        </button>
        
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105">
          <FileText className="h-5 w-5" />
          <span>Export PDF</span>
        </button>
        
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105">
          <Users className="h-5 w-5" />
          <span>Share Report</span>
        </button>
        
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105">
          <Target className="h-5 w-5" />
          <span>Schedule Report</span>
        </button>
      </div>

      {/* Additional Actions for New Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105">
          <Shield className="h-5 w-5" />
          <span>Verification Queue</span>
        </button>
        
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105">
          <Edit className="h-5 w-5" />
          <span>Edit History</span>
        </button>
        
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105">
          <CheckCircle className="h-5 w-5" />
          <span>Clearance Status</span>
        </button>
      </div>

      {/* Enhanced Actions for New Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105">
          <AlertCircle className="h-5 w-5" />
          <span>Error Dashboard</span>
        </button>
        
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105">
          <Zap className="h-5 w-5" />
          <span>Performance Monitor</span>
        </button>
        
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105">
          <Lock className="h-5 w-5" />
          <span>Security Center</span>
        </button>
        
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105">
          <Award className="h-5 w-5" />
          <span>Quality Metrics</span>
        </button>
      </div>
    </div>
  );
};

export default Reports;
