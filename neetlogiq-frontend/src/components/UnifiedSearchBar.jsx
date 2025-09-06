/**
 * 🚀 Unified Search Bar Component
 * Advanced search bar that uses the unified search engine
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X, BrainCircuit, Zap, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUnifiedSearch } from '../hooks/useUnifiedSearch';

const UnifiedSearchBar = ({
  placeholder = "Search colleges, courses, cutoffs...",
  onSearchResults,
  className = "",
  debounceMs = 300,
  contentType = 'colleges',
  collegesData = [],
  showAdvancedFeatures = true,
  showPerformanceMetrics = false,
  autoFocus = false,
  showSuggestions: enableSuggestions = true
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // New state for suggestions
  const [searchHistory, setSearchHistory] = useState([]);
  
  const { isDarkMode } = useTheme();
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Initialize unified search
  const {
    performSearch,
    searchMetadata,
    isInitialized,
    isLoading,
    error,
    performanceMetrics,
    getSuggestions
  } = useUnifiedSearch(collegesData, { contentType });

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle search input changes
  const handleInputChange = useCallback(async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value && value.trim().length > 1) {
      setShowSuggestions(true);
      debounceTimer.current = setTimeout(async () => {
        if (enableSuggestions) {
          const fetchedSuggestions = await getSuggestions(value, 5);
          setSuggestions(fetchedSuggestions);
        }
        
        // Also perform real-time search for immediate results
        try {
          const results = await performSearch(value, { contentType });
          if (onSearchResults) {
            onSearchResults({
              results: results,
              query: value,
              searchType: 'realtime',
              metadata: searchMetadata
            });
          }
        } catch (error) {
          console.error('Real-time search error:', error);
        }
      }, debounceMs); // Use configurable debounce timing
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      // Also clear main results
      if (onSearchResults) {
        onSearchResults({ results: [], query: '', searchType: 'none' });
      }
    }
  }, [getSuggestions, onSearchResults, performSearch, contentType, searchMetadata, enableSuggestions, debounceMs]);

  // Handle search submission
  const handleSearchSubmit = useCallback(async (searchQuery = null) => {
    const queryToSearch = searchQuery || (query ? query.trim() : '');
    
    if (!queryToSearch) return;
    
    try {
      setIsSearching(true);
      setShowSuggestions(false);
      
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [queryToSearch, ...prev.filter(item => item !== queryToSearch)];
        return newHistory.slice(0, 10); // Keep last 10 searches
      });
      
      console.log('🔍 Unified search submitted:', queryToSearch);
      
      const results = await performSearch(queryToSearch, { contentType });
      
      // Search completed successfully
      
      // Notify parent component
      if (onSearchResults) {
        onSearchResults({
          results,
          searchType: searchMetadata?.searchType || 'unified',
          metadata: searchMetadata,
          query: queryToSearch
        });
      }
      
    } catch (err) {
      console.error('❌ Search submission failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, [query, performSearch, contentType, onSearchResults, searchMetadata]);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, [handleSearchSubmit]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setQuery('');
    setShowSuggestions(false);
    
    if (onSearchResults) {
      onSearchResults({
        results: [],
        searchType: 'none',
        metadata: {}
      });
    }
    
    inputRef.current?.focus();
  }, [onSearchResults]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    setQuery(suggestion);
    handleSearchSubmit(suggestion);
  }, [handleSearchSubmit]);

  // Get search status indicator
  const getSearchStatusIndicator = () => {
    if (isLoading || isSearching) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    if (error) {
      return <X className="w-4 h-4 text-red-500" />;
    }
    
    if (isInitialized) {
      return <Zap className="w-4 h-4 text-green-500" />;
    }
    
    return <Search className="w-4 h-4 text-gray-400" />;
  };

  // Get performance metrics display
  const getPerformanceDisplay = () => {
    if (!showPerformanceMetrics || !performanceMetrics) return null;
    
    return (
      <div className="text-xs text-gray-500 mt-1">
        <span>Avg: {performanceMetrics.averageResponseTime?.toFixed(0)}ms</span>
        <span className="mx-2">•</span>
        <span>Success: {(performanceMetrics.successRate * 100)?.toFixed(0)}%</span>
        <span className="mx-2">•</span>
        <span>Cache: {performanceMetrics.cacheHitRate || 0}</span>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input Container */}
      <div className={`
        relative flex items-center
        ${isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-300 text-gray-900'
        }
        border rounded-lg shadow-sm
        focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500
        transition-all duration-200
      `}>
        {/* Search Icon */}
        <div className="pl-3 pr-2">
          {getSearchStatusIndicator()}
        </div>
        
        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className={`
            flex-1 py-3 px-2
            ${isDarkMode ? 'bg-transparent text-white placeholder-gray-400' : 'bg-transparent text-gray-900 placeholder-gray-500'}
            border-0 outline-none
            text-sm
          `}
          disabled={!isInitialized}
        />
        
        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClearSearch}
            className={`
              p-2 mr-2 rounded-full
              ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
              transition-colors duration-200
            `}
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {/* Search Button */}
        <button
          onClick={() => handleSearchSubmit()}
          disabled={!query || !query.trim() || !isInitialized || isLoading}
          className={`
            px-4 py-2 mr-1 rounded-md
            ${query && query.trim() && isInitialized && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : isDarkMode 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
            transition-colors duration-200
            flex items-center gap-2
          `}
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Search</span>
        </button>
      </div>
      
      {/* Search Suggestions Dropdown */}
      {enableSuggestions && showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
        <div className={`
          absolute top-full left-0 right-0 mt-1 z-50
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          border rounded-lg shadow-lg
          ${suggestions.length <= 3 ? 'h-auto' : 'max-h-80 overflow-y-auto'}
        `}>
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2">Suggestions</div>
              {suggestions.map((item, index) => (
                <button
                  key={`sugg-${index}`}
                  onClick={() => handleSuggestionClick(item)}
                  className={`
                    w-full text-left px-3 py-2 rounded-md
                    ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}
                    transition-colors duration-200 text-sm
                  `}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          {searchHistory.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2">Recent Searches</div>
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={`hist-${index}`}
                  onClick={() => handleSuggestionClick(item)}
                  className={`
                    w-full text-left px-3 py-2 rounded-md
                    ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}
                    transition-colors duration-200 text-sm
                  `}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Performance Metrics */}
      {getPerformanceDisplay()}
      
      {/* Search Status */}
      {showAdvancedFeatures && (
        <div className="mt-2 text-xs text-gray-500">
          {isInitialized ? (
            <span className="flex items-center gap-1">
              <BrainCircuit className="w-3 h-3" />
              Unified Search Engine Ready
              {searchMetadata?.engines && (
                <span className="ml-2">
                  ({searchMetadata.engines.join(', ')})
                </span>
              )}
            </span>
          ) : (
            <span>Initializing search engine...</span>
          )}
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mt-2 text-xs text-red-500">
          Search error: {error}
        </div>
      )}
    </div>
  );
};

export default UnifiedSearchBar;