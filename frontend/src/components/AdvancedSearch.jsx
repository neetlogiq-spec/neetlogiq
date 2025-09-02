import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Lightbulb, MapPin, Building2, DollarSign, Users, BookOpen } from 'lucide-react';

const AdvancedSearch = ({ onSearch, onFiltersChange, initialFilters = {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNaturalLanguage, setShowNaturalLanguage] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    state: '',
    city: '',
    college_type: '',
    management_type: '',
    max_fees: '',
    min_seats: '',
    program: '',
    ...initialFilters
  });

  const naturalLanguageExamples = [
    "Government medical colleges under 50k fees",
    "Private dental colleges in Karnataka",
    "Medical colleges with more than 100 seats",
    "AIIMS colleges in Delhi"
  ];

  const filterOptions = {
    college_type: ['MEDICAL', 'DENTAL', 'DNB', 'MULTI'],
    management_type: ['GOVERNMENT', 'PRIVATE', 'DEEMED', 'CENTRAL'],
    states: ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh']
  };

  const getSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/sector_xp_12/admin/search/suggestions?q=${encodeURIComponent(query)}&size=8`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data || []);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getSuggestions(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, getSuggestions]);

  const handleSearch = useCallback(async (query = searchQuery, searchFilters = filters) => {
    if (!query.trim() && Object.values(searchFilters).every(v => !v)) return;

    setIsLoading(true);
    try {
      if (onSearch) {
        await onSearch(query, searchFilters);
      }
      if (onFiltersChange) {
        onFiltersChange(searchFilters);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters, onSearch, onFiltersChange]);

  const handleNaturalLanguageSearch = useCallback(async (example) => {
    setSearchQuery(example);
    setShowNaturalLanguage(false);
    
    try {
      const response = await fetch(`/api/sector_xp_12/admin/search/natural-language?q=${encodeURIComponent(example)}`);
      if (response.ok) {
        const data = await response.json();
        const extractedFilters = data.extractedFilters || {};
        const newFilters = { ...filters, ...extractedFilters };
        setFilters(newFilters);
        await handleSearch(example, newFilters);
      }
    } catch (error) {
      await handleSearch(example, filters);
    }
  }, [filters, handleSearch]);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (searchQuery.trim()) {
      handleSearch(searchQuery, newFilters);
    }
  }, [filters, searchQuery, handleSearch]);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      state: '', city: '', college_type: '', management_type: '',
      max_fees: '', min_seats: '', program: ''
    };
    setFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  }, [onFiltersChange]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
    clearFilters();
  }, [clearFilters]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchQuery(suggestion.text);
    setSuggestions([]);
    
    const newFilters = { ...filters };
    if (suggestion.city) newFilters.city = suggestion.city;
    if (suggestion.state) newFilters.state = suggestion.state;
    if (suggestion.type) newFilters.college_type = suggestion.type;
    
    setFilters(newFilters);
    handleSearch(suggestion.text, newFilters);
  }, [filters, handleSearch]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      } else if (e.key === 'Escape') {
        clearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clearSearch]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search colleges, courses, cities, or use natural language... (Press / to focus)"
            className="w-full pl-12 pr-20 py-4 text-lg border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 shadow-lg"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {searchQuery && (
              <button onClick={clearSearch} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowNaturalLanguage(!showNaturalLanguage)}
              className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
              title="Natural Language Search"
            >
              <Lightbulb className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Advanced Filters"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full p-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{suggestion.text}</div>
                    <div className="text-sm text-gray-500">
                      {suggestion.city && `${suggestion.city}, `}{suggestion.state}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {suggestion.type?.toUpperCase()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Natural Language Examples */}
      {showNaturalLanguage && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Natural Language Search Examples</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {naturalLanguageExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleNaturalLanguageSearch(example)}
                className="p-3 text-left bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
              >
                <div className="text-sm text-blue-800 font-medium">{example}</div>
                <div className="text-xs text-blue-600 mt-1">Click to search</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">All States</option>
                {filterOptions.states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="inline w-4 h-4 mr-1" />
                College Type
              </label>
              <select
                value={filters.college_type}
                onChange={(e) => handleFilterChange('college_type', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Types</option>
                {filterOptions.college_type.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Max Fees (₹)
              </label>
              <input
                type="number"
                value={filters.max_fees}
                onChange={(e) => handleFilterChange('max_fees', e.target.value)}
                placeholder="e.g., 50000"
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Min Seats
              </label>
              <input
                type="number"
                value={filters.min_seats}
                onChange={(e) => handleFilterChange('min_seats', e.target.value)}
                placeholder="e.g., 100"
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center space-x-4">
          <span className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">/</kbd>
            <span>Focus search</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd>
            <span>Clear search</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
            <span>Search</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
