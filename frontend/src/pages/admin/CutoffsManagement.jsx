import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Building2,
  GraduationCap,
  Calendar,
  MapPin,
  Award,
  RefreshCw
} from 'lucide-react';

const CutoffsManagement = () => {
  const [cutoffs, setCutoffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    year: '',
    authority: '',
    quota: '',
    category: '',
    state: '',
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
    hasNext: false,
    hasPrev: false
  });

  const authorities = [
    { code: 'KEA', name: 'Karnataka Examinations Authority' },
    { code: 'AIQ', name: 'All India Quota' },
    { code: 'MCC', name: 'Medical Counselling Committee' },
    { code: 'NEET', name: 'National Eligibility cum Entrance Test' }
  ];

  const quotas = [
    { code: 'state', name: 'State Quota' },
    { code: 'aiq', name: 'All India Quota' },
    { code: 'central', name: 'Central Quota' },
    { code: 'deemed', name: 'Deemed University' }
  ];

  const categories = [
    { code: 'GM', name: 'General Merit' },
    { code: 'SC', name: 'Scheduled Caste' },
    { code: 'ST', name: 'Scheduled Tribe' },
    { code: 'OBC', name: 'Other Backward Classes' },
    { code: 'EWS', name: 'Economically Weaker Section' }
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchCutoffs();
  }, [filters]);

  const fetchCutoffs = async () => {
    try {
      setLoading(true);
      
      // Get admin session for authentication
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('No admin session found');
      }
      
      const session = JSON.parse(adminSession);
      const credentials = btoa(`${session.username}:${session.password}`);

      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/sector_xp_12/cutoffs?${params.toString()}`, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCutoffs(result.data || []);
        setPagination(result.pagination || {});
      } else {
        console.error('Failed to fetch cutoffs');
        setCutoffs([]);
      }
    } catch (error) {
      console.error('Error fetching cutoffs:', error);
      setCutoffs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      year: '',
      authority: '',
      quota: '',
      category: '',
      state: '',
      page: 1,
      limit: 50
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 rounded-3xl"></div>
        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl shadow-gray-900/5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent mb-3">
                Cutoffs Management
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                View, edit, and manage cutoff data across all colleges, programs, and counseling rounds. 
                Comprehensive data management with advanced filtering and export capabilities.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/25">
                  <TrendingUp className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-400 rounded-full border-4 border-white animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-gray-900/5 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Filters & Search</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300">
              <Plus className="w-4 h-4" />
              <span>Add Cutoff</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search colleges, programs..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
            />
          </div>

          {/* Year Filter */}
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Authority Filter */}
          <select
            value={filters.authority}
            onChange={(e) => handleFilterChange('authority', e.target.value)}
            className="rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
          >
            <option value="">All Authorities</option>
            {authorities.map(auth => (
              <option key={auth.code} value={auth.code}>{auth.name}</option>
            ))}
          </select>

          {/* Quota Filter */}
          <select
            value={filters.quota}
            onChange={(e) => handleFilterChange('quota', e.target.value)}
            className="rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
          >
            <option value="">All Quotas</option>
            {quotas.map(quota => (
              <option key={quota.code} value={quota.code}>{quota.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.code} value={category.code}>{category.name}</option>
            ))}
          </select>

          {/* State Filter */}
          <input
            type="text"
            placeholder="State"
            value={filters.state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            className="rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
          />

          {/* Items per page */}
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', e.target.value)}
            className="rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
          >
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>

          {/* Export Button */}
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
            <Download className="w-4 h-4" />
            <span>Export Filtered</span>
          </button>
        </div>
      </div>

      {/* Cutoffs Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-gray-900/5 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              Cutoffs Data {pagination.totalItems > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({pagination.totalItems} total records)
                </span>
              )}
            </h3>
            {loading && (
              <div className="flex items-center space-x-2 text-emerald-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  College & Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ranks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200">
              {cutoffs.map((cutoff, index) => (
                <tr key={cutoff.id || index} className="hover:bg-emerald-50/50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-900 text-sm">
                          {cutoff.college_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">
                          {cutoff.program_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-500">
                          {cutoff.college_city}, {cutoff.college_state}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {cutoff.year} • Round {cutoff.round}
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {cutoff.authority}
                        </span>
                        <span className="ml-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          {cutoff.quota}
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                          {cutoff.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        Opening: {cutoff.opening_rank ? cutoff.opening_rank.toLocaleString() : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Closing: {cutoff.closing_rank ? cutoff.closing_rank.toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {cutoff.seats_available || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {cutoffs.length === 0 && !loading && (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cutoffs found</h3>
              <p className="text-gray-600">
                {Object.values(filters).some(v => v && v !== '') 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Import some cutoff data to get started.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CutoffsManagement;
