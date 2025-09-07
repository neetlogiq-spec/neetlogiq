import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import BeautifulLoader from './BeautifulLoader';
import { useTheme } from '../context/ThemeContext';

const IntelligentFilters = ({ 
  filters, 
  appliedFilters, 
  onFilterChange, 
  onClearFilters,
  type = 'colleges' // 'colleges' or 'courses'
}) => {
  const { isDarkMode } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize local filters with applied filters
  useEffect(() => {
    setLocalFilters(appliedFilters || {});
  }, [appliedFilters]);

  // Debug: Monitor filters prop changes
  useEffect(() => {
    console.log('🔍 IntelligentFilters: filters prop changed:', filters);
  }, [filters]);

  // Handle filter changes with intelligent synchronization
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...localFilters };
    
    if (value) {
      newFilters[filterType] = value;
      
      // Intelligent synchronization logic for Stream, State, Management Type
      if (filterType === 'stream') {
        // When stream changes, reset state and management_type to show synchronized options
        delete newFilters.state;
        delete newFilters.management_type;
      }
    } else {
      delete newFilters[filterType];
    }
    
    setLocalFilters(newFilters);
    
    // Immediately notify parent component of the filter change
    onFilterChange(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    setIsLoading(true);
    onFilterChange(localFilters);
    setTimeout(() => setIsLoading(false), 500);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setLocalFilters({});
    onClearFilters();
  };

  // Hardcoded stream options with proper synchronization
  const STREAM_OPTIONS = [
    { value: 'MEDICAL', label: 'Medical' },
    { value: 'DENTAL', label: 'Dental' },
    { value: 'DNB', label: 'DNB' }
  ];



  // Get available options based on current filter selections
  const getAvailableOptions = (filterType) => {
    console.log('🔍 getAvailableOptions called with:', filterType);
    console.log('🔍 Current filters state:', filters);
    
    if (!filters || !filters.available) {
      console.log('🔍 No filters or available data');
      return [];
    }
    
    const { available } = filters;
    console.log('🔍 Available data:', available);
    
    // Map filter types to backend response keys
    const filterTypeMap = {
      'states': 'states',
      'managementTypes': 'managementTypes',
      'streams': 'streams'
    };
    
    const backendKey = filterTypeMap[filterType];
    console.log('🔍 Backend key:', backendKey);
    
    const result = backendKey ? (available[backendKey] || []) : [];
    console.log('🔍 Result for', filterType, ':', result);
    
    return result;
  };

  // Get filter count (only count Stream, State, Management Type)
  const getFilterCount = () => {
    const validFilters = ['stream', 'state', 'management_type'];
    return Object.keys(appliedFilters || {}).filter(key => 
      validFilters.includes(key) && appliedFilters[key]
    ).length;
  };

  const filterCount = getFilterCount();

  return (
    <motion.div 
      className={`backdrop-blur-md rounded-2xl border-2 mb-8 shadow-lg transition-all duration-300 ${
        isExpanded ? 'p-6' : 'p-4'
      } ${
        isDarkMode 
          ? 'bg-white/10 border-white/20 shadow-white/10' 
          : 'bg-green-50/40 border-green-200/60 shadow-green-200/30'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Filter Header */}
      <div className={`flex items-center justify-between ${isExpanded ? 'mb-6' : 'mb-0'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Filters
            </h3>
            {isExpanded && (
              <p className={`text-sm ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}>
                {type === 'colleges' ? 'Filter colleges by multiple criteria' : 'Filter courses by multiple criteria'}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {filterCount > 0 && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isDarkMode 
                ? 'bg-primary-500/20 text-primary-300' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {filterCount} active
            </span>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700'
            }`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsed State Summary */}
      {!isExpanded && filterCount > 0 && (
        <div className={`text-sm ${
          isDarkMode ? 'text-white/70' : 'text-gray-600'
        }`}>
          {Object.entries(appliedFilters || {}).map(([key, value]) => {
            if (!value) return null;
            const label = key === 'stream' ? 'Stream' : 
                         key === 'state' ? 'State' : 
                         key === 'management_type' ? 'Management' : key;
            return (
              <span key={key} className="inline-block mr-3">
                <span className="font-medium">{label}:</span> {value}
              </span>
            );
          }).filter(Boolean)}
        </div>
      )}

      {/* Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Filter Options - Reordered Layout */}
            <div className="space-y-4">
              {/* Line 1: Stream - Single Line Layout */}
              <div className="flex flex-wrap items-center gap-4">
                <label className={`text-sm font-medium whitespace-nowrap ${
                  isDarkMode ? 'text-white/90' : 'text-gray-700'
                }`}>Stream</label>
                <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleFilterChange('stream', '')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        !localFilters.stream
                          ? isDarkMode 
                            ? 'bg-white/30 text-white border border-white/40'
                            : 'bg-blue-500 text-white border border-blue-400'
                          : isDarkMode 
                            ? 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-300'
                      }`}
                    >
                      All Streams
                    </button>
                    {STREAM_OPTIONS.map((stream) => (
                      <button
                        key={stream.value}
                        onClick={() => handleFilterChange('stream', stream.value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          localFilters.stream === stream.value
                            ? stream.value === 'MEDICAL'
                              ? isDarkMode 
                                ? 'bg-blue-500 text-white border border-blue-400 shadow-lg'
                                : 'bg-blue-500 text-white border border-blue-400 shadow-lg'
                              : stream.value === 'DENTAL'
                              ? isDarkMode 
                                ? 'bg-green-500 text-white border border-green-400 shadow-lg'
                                : 'bg-green-500 text-white border border-green-400 shadow-lg'
                              : stream.value === 'DNB'
                              ? isDarkMode 
                                ? 'bg-purple-500 text-white border border-purple-400 shadow-lg'
                                : 'bg-purple-500 text-white border border-purple-400 shadow-lg'
                              : isDarkMode 
                                ? 'bg-primary-500 text-white border border-primary-400 shadow-lg'
                                : 'bg-primary-500 text-white border border-primary-400 shadow-lg'
                            : stream.value === 'MEDICAL'
                            ? isDarkMode 
                              ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30 hover:bg-blue-500/30 hover:text-blue-100'
                              : 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200 hover:text-blue-900'
                            : stream.value === 'DENTAL'
                            ? isDarkMode 
                              ? 'bg-green-500/20 text-green-200 border border-green-400/30 hover:bg-green-500/30 hover:text-green-100'
                              : 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 hover:text-green-900'
                            : stream.value === 'DNB'
                            ? isDarkMode 
                              ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30 hover:bg-purple-500/30 hover:text-purple-100'
                              : 'bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200 hover:text-purple-900'
                            : isDarkMode 
                              ? 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-300'
                        }`}
                      >
                        {stream.label}
                      </button>
                    ))}
                </div>
              </div>

              {/* Line 2: State, Management Type (Synchronized with Stream) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State Filter */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-white/90' : 'text-gray-700'
                  }`}>State</label>
                  <select
                    value={localFilters.state || ''}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none ${
                      isDarkMode 
                        ? 'bg-white/10 border border-white/20 text-white focus:border-primary-400' 
                        : 'bg-gray-100/80 border border-gray-300/50 text-gray-700 focus:border-blue-400'
                    }`}
                  >
                    <option value="">All States</option>
                    {getAvailableOptions('states').map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Management Type Filter */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-white/90' : 'text-gray-700'
                  }`}>Management Type</label>
                  <select
                    value={localFilters.management_type || ''}
                    onChange={(e) => handleFilterChange('management_type', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none ${
                      isDarkMode 
                        ? 'bg-white/10 border border-white/20 text-white focus:border-primary-400' 
                        : 'bg-gray-100/80 border border-gray-300/50 text-gray-700 focus:border-blue-400'
                    }`}
                  >
                    <option value="">All Management Types</option>
                    {getAvailableOptions('managementTypes').map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className={`flex items-center justify-between pt-4 border-t ${
              isDarkMode ? 'border-white/20' : 'border-gray-200/50'
            }`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={applyFilters}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4">
                  <BeautifulLoader size="small" showText={false} />
                </div>
                  ) : (
                    <Filter className="w-4 h-4" />
                  )}
                  {isLoading ? 'Applying...' : 'Apply Filters'}
                </button>

                <button
                  onClick={clearAllFilters}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700'
                  }`}
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>

              {/* Filter Summary */}
              {filterCount > 0 && (
                <div className={`text-sm ${
                  isDarkMode ? 'text-white/70' : 'text-gray-600'
                }`}>
                  {filterCount} filter{filterCount !== 1 ? 's' : ''} applied
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default IntelligentFilters;
