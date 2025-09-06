import React, { useState, useRef, useCallback } from 'react';
import { Search, X, BrainCircuit, Zap } from 'lucide-react';
import BeautifulLoader from './BeautifulLoader';
import { useTheme } from '../context/ThemeContext';

const AdvancedSearchBar = ({
  placeholder = "Search...",
  onSearchSubmit,
  className = "",
  debounceMs = 300,
  advancedSearchService = null,
  showAdvancedFeatures = true,
  onAISearch = null // New prop for AI search
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [isAISearching, setIsAISearching] = useState(false);
  const { isDarkMode } = useTheme();
  
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // AI Search function - ENHANCED VERSION
  const performAISearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      return;
    }

    setIsAISearching(true);
    try {
      console.log('🤖 Performing AI search for:', searchQuery);
      
      // Determine content type based on placeholder or context
      let contentType = 'colleges'; // Default
      if (placeholder.toLowerCase().includes('course')) {
        contentType = 'courses';
      } else if (placeholder.toLowerCase().includes('cutoff')) {
        contentType = 'cutoffs';
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://neetlogiq-backend.neetlogiq.workers.dev'}/api/ai-search?q=${encodeURIComponent(searchQuery)}&type=${contentType}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🤖 AI search results:', data);
        setAiResults(data);
        
        // CRITICAL FIX: Ensure AI results update the main list
        if (onAISearch && data.results && data.results.length > 0) {
          console.log(`🤖 Updating main ${contentType} list with AI results:`, data.results.length, contentType);
          onAISearch(data);
        } else if (data.results && data.results.length === 0) {
          console.log('🤖 AI search returned no results');
          // Clear the main list if no results
          if (onAISearch) {
            onAISearch({ results: [] });
          }
        }
      } else {
        console.error('AI search failed:', response.status);
        setAiResults(null);
      }
    } catch (error) {
      console.error('AI search error:', error);
      setAiResults(null);
    } finally {
      setIsAISearching(false);
    }
  }, [onAISearch, placeholder]);

  // Debounced search to prevent loops - ENHANCED VERSION
  const debouncedSearch = useCallback((searchQuery) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.trim().length >= 2) {
        setIsSearching(true);
        
        if (isAIMode) {
          // CRITICAL FIX: Use AI search ONLY - don't call regular search
          console.log('🤖 AI Mode: Using AI search only');
          performAISearch(searchQuery.trim());
        } else {
          // Use regular search ONLY
          console.log('🔍 Regular Mode: Using regular search');
          onSearchSubmit(searchQuery.trim());
        }
        
        setIsSearching(false);
      } else if (!searchQuery.trim()) {
        // Clear search - call regular search to reset
        console.log('🔍 Clearing search');
        onSearchSubmit(''); // Clear search
        setAiResults(null);
      }
    }, debounceMs);
  }, [onSearchSubmit, debounceMs, isAIMode, performAISearch]);

  // Handle input change with debounced search
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Trigger search with debounce
    debouncedSearch(newQuery);
  };

  // Handle search submission - ENHANCED VERSION
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() && query.trim().length >= 2) {
      setIsSearching(true);
      
      if (isAIMode) {
        console.log('🤖 Manual AI search trigger');
        performAISearch(query.trim());
      } else {
        console.log('🔍 Manual regular search trigger');
        onSearchSubmit(query.trim());
      }
      
      setIsSearching(false);
      inputRef.current?.blur();
    }
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    onSearchSubmit(''); // Clear search
    setAiResults(null);
  };

  // Toggle AI mode - ENHANCED VERSION
  const toggleAIMode = () => {
    const newAIMode = !isAIMode;
    setIsAIMode(newAIMode);
    setAiResults(null);
    
    console.log('🤖 AI Mode toggled:', newAIMode ? 'ON' : 'OFF');
    
    // Re-trigger search with current query if it exists
    if (query.trim() && query.trim().length >= 2) {
      if (newAIMode) {
        // Switching to AI mode - use AI search
        performAISearch(query.trim());
      } else {
        // Switching to regular mode - use regular search
        onSearchSubmit(query.trim());
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={isAIMode ? "Ask me anything... e.g., 'top colleges in Delhi'" : placeholder}
            value={query}
            onChange={handleInputChange}
            className={`w-full px-6 py-4 text-lg rounded-2xl border-0 focus:ring-4 focus:ring-primary-500/50 focus:outline-none pr-24 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-600' 
                : 'bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg border border-gray-200'
            } ${isAIMode ? 'ring-2 ring-blue-500/30' : ''}`}
          />
          
          {/* AI Mode Toggle */}
          <button
            type="button"
            onClick={toggleAIMode}
            className={`absolute right-16 top-1/2 transform -translate-y-1/2 p-2 rounded-xl transition-all duration-300 ${
              isAIMode 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                : isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
            title={isAIMode ? "AI Search Active - Click to switch to regular search" : "Click to enable AI-powered search"}
          >
            <BrainCircuit className="w-5 h-5" />
          </button>

          {/* Search Button */}
          <button
            type="submit"
            disabled={!query.trim() || isSearching || isAISearching || query.trim().length < 2}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-3 rounded-xl transition-colors ${
              isAIMode 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:bg-gray-400 text-white' 
                : 'bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white'
            }`}
            title={query.trim().length < 2 ? "Type at least 2 characters to search" : isAIMode ? "AI Search" : "Search"}
          >
            {(isSearching || isAISearching) ? (
              <div className="w-6 h-6">
                <BeautifulLoader size="small" showText={false} />
              </div>
            ) : isAIMode ? (
              <Zap className="w-6 h-6" />
            ) : (
              <Search className="w-6 h-6" />
            )}
          </button>
          
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={`absolute right-32 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
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
            <div className={`absolute right-36 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 rounded ${
              query.length >= 2 
                ? (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-500/20 text-green-600')
                : (isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-500/20 text-yellow-600')
            }`}>
              {query.length}/2
            </div>
          )}
        </div>
      </form>

      {/* AI Results Display */}
      {isAIMode && aiResults && (
        <div className={`mt-4 p-4 rounded-xl border transition-all duration-300 ${
          isDarkMode 
            ? 'bg-blue-900/20 border-blue-500/30' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          {/* AI Insight */}
          {aiResults.aiInsight && (
            <div className="flex items-start gap-3 mb-3">
              <BrainCircuit className="text-blue-500 mt-1" size={20} />
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-blue-200' : 'text-blue-800'
              }`}>
                {aiResults.aiInsight}
              </p>
            </div>
          )}
          
          {/* AI Results */}
          {aiResults.results && aiResults.results.length > 0 && (
            <div className="space-y-2">
              <h4 className={`text-xs font-semibold uppercase tracking-wide ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                AI Found {aiResults.results.length} Results (Also shown in main list below)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {aiResults.results.map((result) => (
                  <div 
                    key={result.id} 
                    className={`p-3 rounded-lg border transition-colors cursor-pointer hover:shadow-md ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                        : 'bg-white/80 border-gray-200 hover:bg-white'
                    }`}
                    onClick={() => {
                      // You can add click handler here to navigate to details
                      console.log('Selected result:', result);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className={`font-semibold text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {result.name || result.college || result.course_name}
                        </h5>
                        <div className={`flex items-center gap-2 text-xs mt-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {/* Display different info based on content type */}
                          {result.city && result.state && (
                            <span>{result.city}, {result.state}</span>
                          )}
                          {result.stream && (
                            <span>Stream: {result.stream}</span>
                          )}
                          {result.course && (
                            <span>Course: {result.course}</span>
                          )}
                          {result.college_count && (
                            <span>Available in {result.college_count} colleges</span>
                          )}
                          {result.management_type && (
                            <>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                result.management_type === 'GOVERNMENT' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {result.management_type}
                              </span>
                            </>
                          )}
                          {result.category && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              result.category === 'General' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {result.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        isDarkMode 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {Math.round(result.score * 100)}% match
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Mode Indicator */}
      {isAIMode && (
        <div className={`mt-2 flex items-center gap-2 text-xs ${
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        }`}>
          <BrainCircuit size={14} />
          <span>AI Search Active - Results shown in both dropdown and main college cards</span>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;
