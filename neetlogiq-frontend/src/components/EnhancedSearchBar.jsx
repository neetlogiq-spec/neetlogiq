import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X, BrainCircuit, Zap, Loader2, Filter, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useDebounce } from '../hooks/useDebounce';
import unifiedSearchService from '../services/unifiedSearchService';
import SearchSkeleton from './SearchSkeleton';
import EmptyState from './EmptyState';
import ProgressIndicator from './ProgressIndicator';
import Tooltip from './Tooltip';

const EnhancedSearchBar = ({
  placeholder = "Search with AI-powered intelligence...",
  onSearchResults,
  className = "",
  debounceMs = 300,
  contentType = 'all',
  showSuggestions = true,
  showAIInsight = true,
  showFilters = false,
  onFilterClick
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [searchType, setSearchType] = useState('none');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const { isDarkMode } = useTheme();
  
  const inputRef = useRef(null);
  const suggestionsTimer = useRef(null);
  
  // Use the new debounce hook
  const debouncedQuery = useDebounce(query, debounceMs);

  // Simulate search progress
  const simulateProgress = useCallback(() => {
    setSearchProgress(0);
    const interval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          return 3;
        }
        return prev + 1;
      });
    }, 200);
    return interval;
  }, []);

  // Perform unified search with enhanced animations
  const performSearch = useCallback(async (searchQuery) => {
    setIsSearching(true);
    setShowSkeleton(true);
    setHasSearched(true);
    setShowEmptyState(false);
    
    const progressInterval = simulateProgress();
    
    try {
      console.log(`🔍 Enhanced search for "${searchQuery}" (${contentType})`);
      
      const searchResult = await unifiedSearchService.search(searchQuery, contentType);
      
      setAiInsight(searchResult.aiInsight);
      setSearchType(searchResult.searchType);
      setResultsCount(searchResult.totalResults || 0);
      setShowSkeleton(false);
      
      // Show empty state if no results
      if (!searchResult.results || searchResult.results.length === 0) {
        setShowEmptyState(true);
      }
      
      // Call the callback with results
      if (onSearchResults) {
        onSearchResults(searchResult);
      }
      
      console.log(`✅ Search completed: ${searchResult.totalResults} results (${searchResult.searchType})`);
    } catch (error) {
      console.error('Search error:', error);
      setAiInsight('Sorry, search is temporarily unavailable. Please try again.');
      setSearchType('error');
      setShowSkeleton(false);
      setShowEmptyState(true);
    } finally {
      setIsSearching(false);
      clearInterval(progressInterval);
      setSearchProgress(0);
    }
  }, [contentType, onSearchResults, simulateProgress]);

  // Effect to handle debounced search
  useEffect(() => {
    if (debouncedQuery.trim() && debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery.trim());
    } else if (!debouncedQuery.trim()) {
      // Clear search
      setAiInsight('');
      setSearchType('none');
      setShowSkeleton(false);
      setShowEmptyState(false);
      setHasSearched(false);
      setResultsCount(0);
      if (onSearchResults) {
        onSearchResults({ results: [], aiInsight: '', searchType: 'none' });
      }
    }
  }, [debouncedQuery, performSearch, onSearchResults]);

  // Debounced suggestions
  const debouncedSuggestions = useCallback((searchQuery) => {
    if (suggestionsTimer.current) {
      clearTimeout(suggestionsTimer.current);
    }
    
    suggestionsTimer.current = setTimeout(async () => {
      if (searchQuery.trim() && searchQuery.trim().length >= 2) {
        const suggestions = await unifiedSearchService.getSuggestions(searchQuery, contentType);
        setSuggestions(suggestions);
        setShowSuggestionsList(true);
      } else {
        setSuggestions([]);
        setShowSuggestionsList(false);
      }
    }, 150);
  }, [contentType]);

  // Handle input change
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Trigger suggestions only
    if (showSuggestions) {
      debouncedSuggestions(newQuery);
    }
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() && query.trim().length >= 2) {
      performSearch(query.trim());
      setShowSuggestionsList(false);
      inputRef.current?.blur();
    }
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    setAiInsight('');
    setSearchType('none');
    setSuggestions([]);
    setShowSuggestionsList(false);
    setShowSkeleton(false);
    setShowEmptyState(false);
    setHasSearched(false);
    setResultsCount(0);
    if (onSearchResults) {
      onSearchResults({ results: [], aiInsight: '', searchType: 'none' });
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const suggestionText = suggestion.name || suggestion.college || suggestion.course_name || suggestion.course;
    setQuery(suggestionText);
    performSearch(suggestionText);
    setShowSuggestionsList(false);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Progress Indicator */}
      <ProgressIndicator
        isVisible={isSearching}
        currentStep={searchProgress}
        totalSteps={3}
        currentAction={searchType === 'ai' ? "AI is analyzing your query..." : "Searching database..."}
        searchType={searchType}
        resultsCount={resultsCount}
      />

      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isSearching ? 1.02 : 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative"
        >
          <motion.input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            className={`w-full px-6 py-4 text-lg rounded-2xl border-0 focus:ring-4 focus:ring-primary-500/50 focus:outline-none pr-24 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-600' 
                : 'bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg border border-gray-200'
            } ${searchType === 'ai' ? 'ring-2 ring-blue-500/30' : searchType === 'regular' ? 'ring-2 ring-green-500/30' : ''} ${
              showFilters ? 'pr-20' : 'pr-16'
            }`}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Filter Button */}
          {showFilters && (
            <Tooltip content="Advanced filters and sorting options" position="bottom">
              <motion.button
                type="button"
                onClick={onFilterClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              >
                <Filter className="w-4 h-4" />
              </motion.button>
            </Tooltip>
          )}

          {/* AI/Regular Search Indicator - ALWAYS COLORED */}
          <Tooltip 
            content={searchType === 'ai' ? "AI-powered search active" : searchType === 'regular' ? "Regular search active" : "Ready to search"}
            position="bottom"
          >
            <motion.div 
              className={`absolute right-16 top-1/2 transform -translate-y-1/2 p-2 rounded-xl transition-all duration-300 ${
                searchType === 'ai' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : searchType === 'regular'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
              ) : searchType === 'ai' ? (
                <BrainCircuit className="w-5 h-5" />
              ) : searchType === 'regular' ? (
                <Search className="w-5 h-5" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
            </motion.div>
          </Tooltip>

          {/* Search Button - ALWAYS COLORED */}
          <Tooltip 
            content={query.trim().length < 2 ? "Type at least 2 characters to search" : "Search now"}
            position="bottom"
          >
            <motion.button
              type="submit"
              disabled={!query.trim() || isSearching || query.trim().length < 2}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-500 disabled:opacity-70 text-white shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6"
                >
                  <Loader2 className="w-6 h-6" />
                </motion.div>
              ) : (
                <Search className="w-6 h-6" />
              )}
            </motion.button>
          </Tooltip>
          
          {/* Clear Button - ALWAYS COLORED when visible */}
          <AnimatePresence>
            {query && (
              <Tooltip content="Clear search" position="bottom">
                <motion.button
                  type="button"
                  onClick={handleClear}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-32 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </Tooltip>
            )}
          </AnimatePresence>
          
          {/* Input Length Indicator */}
          <AnimatePresence>
            {query && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`absolute right-36 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 rounded ${
                  query.length >= 2 
                    ? (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-500/20 text-green-600')
                    : (isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-500/20 text-yellow-600')
                }`}
              >
                {query.length}/2
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && showSuggestionsList && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-lg z-50 max-h-64 overflow-y-auto ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`p-3 cursor-pointer transition-colors border-b last:border-b-0 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 border-gray-700' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                whileHover={{ x: 5 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className={`font-semibold text-sm ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {suggestion.name || suggestion.college || suggestion.course_name || suggestion.course}
                    </h5>
                    <div className={`flex items-center gap-2 text-xs mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {suggestion.city && suggestion.state && (
                        <span>{suggestion.city}, {suggestion.state}</span>
                      )}
                      {suggestion.stream && (
                        <span>Stream: {suggestion.stream}</span>
                      )}
                      {suggestion.category && (
                        <span>Category: {suggestion.category}</span>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    isDarkMode 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {suggestion.category || 'Match'}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skeleton Loading */}
      <AnimatePresence>
        {showSkeleton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <SearchSkeleton count={3} type={contentType} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {showEmptyState && hasSearched && !showSkeleton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            <EmptyState
              type={contentType}
              title="No results found"
              subtitle={`We couldn't find any ${contentType} matching "${query}". Try adjusting your search terms or filters.`}
              actionText="Clear search"
              onAction={handleClear}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insight Display */}
      <AnimatePresence>
        {showAIInsight && aiInsight && !showSkeleton && !showEmptyState && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={`mt-4 p-4 rounded-xl border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-blue-900/20 border-blue-500/30' 
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {searchType === 'ai' ? (
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BrainCircuit className="text-blue-500 mt-1" size={20} />
                </motion.div>
              ) : (
                <Search className="text-green-500 mt-1" size={20} />
              )}
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-blue-200' : 'text-blue-800'
              }`}>
                {aiInsight}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Type Indicator */}
      <AnimatePresence>
        {searchType !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className={`mt-2 flex items-center gap-2 text-xs ${
              searchType === 'ai' 
                ? (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                : (isDarkMode ? 'text-green-400' : 'text-green-600')
            }`}
          >
            {searchType === 'ai' ? (
              <>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <BrainCircuit size={14} />
                </motion.div>
                <span>AI-Powered Search Active</span>
              </>
            ) : (
              <>
                <Search size={14} />
                <span>Regular Search Active</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSearchBar;
