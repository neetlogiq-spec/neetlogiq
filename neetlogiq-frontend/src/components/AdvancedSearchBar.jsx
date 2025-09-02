import React, { useState, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import BeautifulLoader from './BeautifulLoader';
import { useTheme } from '../context/ThemeContext';

const AdvancedSearchBar = ({
  placeholder = "Search...",
  onSearchSubmit,
  className = "",
  debounceMs = 300,
  advancedSearchService = null,
  showAdvancedFeatures = true
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { isDarkMode } = useTheme();
  
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Debounced search to prevent loops
  const debouncedSearch = useCallback((searchQuery) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.trim().length >= 2) {
        setIsSearching(true);
        onSearchSubmit(searchQuery.trim());
        setIsSearching(false);
      } else if (!searchQuery.trim()) {
        onSearchSubmit(''); // Clear search
      }
    }, debounceMs);
  }, [onSearchSubmit, debounceMs]);

  // Handle input change with debounced search
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Trigger search with debounce
    debouncedSearch(newQuery);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() && query.trim().length >= 2) {
      setIsSearching(true);
      onSearchSubmit(query.trim());
      setIsSearching(false);
      inputRef.current?.blur();
    }
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    onSearchSubmit(''); // Clear search
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            className={`w-full px-6 py-4 text-lg rounded-2xl border-0 focus:ring-4 focus:ring-primary-500/50 focus:outline-none pr-20 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-600' 
                : 'bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg border border-gray-200'
            }`}
          />
          
          {/* Search Button */}
          <button
            type="submit"
            disabled={!query.trim() || isSearching || query.trim().length < 2}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white p-3 rounded-xl transition-colors"
            title={query.trim().length < 2 ? "Type at least 2 characters to search" : "Search"}
          >
            {isSearching ? (
              <div className="w-6 h-6">
                <BeautifulLoader size="small" showText={false} />
              </div>
            ) : (
              <Search className="w-6 h-6" />
            )}
          </button>
          
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={`absolute right-16 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {/* Input Length Indicator */}
          {query && (
            <div className={`absolute right-20 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 rounded ${
              query.length >= 2 
                ? (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-500/20 text-green-600')
                : (isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-500/20 text-yellow-600')
            }`}>
              {query.length}/2
            </div>
          )}
        </div>
      </form>

      {/* Advanced Search Features - REMOVED */}
      {/* Dropdown with "Advanced Search Active", "AI + Fuzzy", and "Smart Suggestions" has been removed */}
    </div>
  );
};

export default AdvancedSearchBar;
