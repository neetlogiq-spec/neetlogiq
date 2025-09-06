// Typesense Natural Language Search Bar Component
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Filter, Sparkles } from 'lucide-react';
import { useTypesenseSearch } from '../hooks/useTypesenseSearch';

const TypesenseSearchBar = ({ 
  onSearchResults, 
  placeholder = "Search with natural language...",
  type = 'all',
  showSuggestions = true,
  showFacets = true,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({});
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  const {
    query,
    results,
    isLoading,
    error,
    facets,
    suggestions,
    total,
    searchTime,
    setQuery,
    performSearch,
    getSuggestions,
    searchWithFilters,
    clearSearch,
    hasResults,
    hasError
  } = useTypesenseSearch({ type });

  // Handle search input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length >= 2) {
      getSuggestions(value);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      if (Object.keys(filters).length > 0) {
        searchWithFilters(searchQuery, filters);
      } else {
        performSearch(searchQuery);
      }
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
    setIsFocused(false);
  };

  // Handle key events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
      setIsFocused(false);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notify parent of search results
  useEffect(() => {
    if (onSearchResults && hasResults) {
      onSearchResults({
        results,
        total,
        searchTime,
        query,
        type: 'typesense'
      });
    }
  }, [results, total, searchTime, query, onSearchResults, hasResults]);

  // Handle filter change
  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value === 'all' ? undefined : value
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isLoading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-1 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Advanced Search Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-2 flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Advanced Filters</span>
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg border"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <select
                  value={filters.city || 'all'}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Cities</option>
                  {facets.city?.map(facet => (
                    <option key={facet.value} value={facet.value}>
                      {facet.value} ({facet.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={filters.state || 'all'}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All States</option>
                  {facets.state?.map(facet => (
                    <option key={facet.value} value={facet.value}>
                      {facet.value} ({facet.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* College Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Type
                </label>
                <select
                  value={filters.college_type || 'all'}
                  onChange={(e) => handleFilterChange('college_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {facets.college_type?.map(facet => (
                    <option key={facet.value} value={facet.value}>
                      {facet.value} ({facet.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => handleSearch()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{suggestion.text}</div>
                    {suggestion.city && (
                      <div className="text-sm text-gray-500">
                        {suggestion.city}, {suggestion.state}
                      </div>
                    )}
                    {suggestion.stream && (
                      <div className="text-sm text-gray-500">
                        {suggestion.stream} - {suggestion.college_name}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results Info */}
      {hasResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center justify-between text-sm text-gray-600"
        >
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>{total} results found</span>
            </span>
            {searchTime > 0 && (
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{searchTime}ms</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-blue-600">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Search</span>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center justify-center space-x-2 text-gray-600"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span>Searching...</span>
        </motion.div>
      )}
    </div>
  );
};

export default TypesenseSearchBar;
