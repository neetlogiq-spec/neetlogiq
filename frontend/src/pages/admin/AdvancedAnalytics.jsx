import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  GraduationCap,
  Target,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  PieChart,
  Activity,
  Zap,
  Sparkles,
  Globe,
  MapPin,
  Clock,
  Award,
  Star,
  TrendingDown
} from 'lucide-react';
import { getApiEndpoint } from '../../config/api';

const AdvancedAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    stateDistribution: [],
    programDistribution: [],
    yearTrends: [],
    topColleges: [],
    qualityMetrics: [],
    consistencyChecks: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch overview analytics
      const overviewResponse = await fetch('/api/sector_xp_12/admin/analytics/overview', {
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        if (overviewData.success) {
          setAnalyticsData(prev => ({
            ...prev,
            overview: overviewData.data.overview,
            stateDistribution: overviewData.data.stateDistribution,
            programDistribution: overviewData.data.programDistribution,
            yearTrends: overviewData.data.yearTrends,
            topColleges: overviewData.data.topColleges
          }));
        }
      }
      
      // Fetch validation analytics
      const validationResponse = await fetch('/api/sector_xp_12/admin/analytics/validation', {
        headers: {
          'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (validationResponse.ok) {
        const validationData = await validationResponse.json();
        if (validationData.success) {
          setAnalyticsData(prev => ({
            ...prev,
            qualityMetrics: validationData.data.qualityMetrics,
            consistencyChecks: validationData.data.consistencyChecks
          }));
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const exportReport = (format = 'csv') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `analytics_report_${timestamp}.${format}`;
    
    if (format === 'csv') {
      const csvContent = [
        'Metric,Value,Change',
        `Total Colleges,${analyticsData.overview.totalColleges},+${analyticsData.overview.growthRate}%`,
        `Total Programs,${analyticsData.overview.totalPrograms},+${analyticsData.overview.growthRate}%`,
        `Total Seats,${analyticsData.overview.totalSeats},+${analyticsData.overview.growthRate}%`,
        `Active Users,${analyticsData.overview.activeUsers},+${analyticsData.overview.growthRate}%`
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const renderMetricCard = (title, value, change, icon, color) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          <div className="flex items-center mt-2">
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          </div>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const renderChart = (data, title, type = 'bar') => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-64 flex items-end justify-center space-x-2">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className={`w-8 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600`}
              style={{ height: `${(value / Math.max(...data)) * 200}px` }}
            ></div>
            <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPieChart = (data, title) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-900">{item.count.toLocaleString()}</span>
              <span className="text-sm text-gray-500">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPerformanceTable = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Top Colleges by Program Count</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                College
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Programs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Seats
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {analyticsData.topColleges?.map((college, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{college.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>{college.city}</div>
                    <div className="text-gray-500">{college.state}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    college.college_type === 'MEDICAL' ? 'bg-blue-100 text-blue-800' :
                    college.college_type === 'DENTAL' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {college.college_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {college.program_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {college.total_seats?.toLocaleString() || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button
              onClick={() => exportReport('csv')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
            <button
              onClick={fetchAnalyticsData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {renderMetricCard(
          'Total Colleges',
          analyticsData.overview.total_colleges || 0,
          0,
          <Building2 className="w-6 h-6 text-blue-600" />,
          'blue'
        )}
        {renderMetricCard(
          'Total Programs',
          analyticsData.overview.total_programs || 0,
          0,
          <GraduationCap className="w-6 h-6 text-green-600" />,
          'green'
        )}
        {renderMetricCard(
          'Total Seats',
          analyticsData.overview.total_seats || 0,
          0,
          <Users className="w-6 h-6 text-purple-600" />,
          'purple'
        )}
        {renderMetricCard(
          'Medical Colleges',
          analyticsData.overview.medical_colleges || 0,
          0,
          <Activity className="w-6 h-6 text-orange-600" />,
          'orange'
        )}
      </div>

      {/* State Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Colleges by State (Top 15)</h3>
          <div className="space-y-3">
            {analyticsData.stateDistribution?.slice(0, 15).map((state, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: `hsl(${index * 25}, 70%, 50%)` }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{state.state}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-900">{state.college_count}</span>
                  <div className="flex space-x-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {state.medical_count || 0}M
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {state.dental_count || 0}D
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {state.dnb_count || 0}N
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Programs by Level</h3>
          <div className="space-y-3">
            {analyticsData.programDistribution?.map((program, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{program.program_level}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-900">{program.program_count}</span>
                  <span className="text-sm text-gray-500">
                    ({((program.program_count / (analyticsData.overview.total_programs || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="mb-8">
        {renderPerformanceTable()}
      </div>

      {/* Data Quality Metrics */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Data Quality & Validation</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quality Metrics */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Data Completeness</h4>
                <div className="space-y-3">
                  {analyticsData.qualityMetrics?.map((metric, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {metric.table_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {metric.total_records} records
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Names: {metric.name_completeness || 0}%</span>
                          <span className="text-gray-500">
                            {metric.valid_names}/{metric.total_records}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${metric.name_completeness || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consistency Checks */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Data Consistency</h4>
                <div className="space-y-3">
                  {analyticsData.consistencyChecks?.map((check, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {check.check_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          check.issue_count > 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {check.issue_count} issues
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{check.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">States Covered</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.total_states || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cities Covered</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.total_cities || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Seats/Program</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(analyticsData.overview.avg_seats_per_program || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
