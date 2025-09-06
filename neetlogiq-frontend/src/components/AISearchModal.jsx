import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BrainCircuit, GraduationCap, BookOpen, TrendingUp, MapPin, Building, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import unifiedSearchService from '../services/unifiedSearchService';
import useScrollLock from '../hooks/useScrollLock';

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AISearchModal = ({ isVisible, onClose, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [aiInsight, setAiInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // all, colleges, courses, cutoffs
  const debouncedQuery = useDebounce(query, 350);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  // Lock body scroll when modal is open
  useScrollLock(isVisible);

  useEffect(() => {
    if (isVisible) {
      // Focus input when the modal becomes visible
      inputRef.current?.focus();
      if (initialQuery) {
        setQuery(initialQuery);
      }
    } else {
      // Reset state when closed
      setQuery('');
      setResults([]);
      setAiInsight('');
      setError('');
      setSelectedCategory('all');
    }
  }, [isVisible, initialQuery]);

  const performSearch = useCallback(async (searchQuery) => {
    if (searchQuery.length < 3) {
      setResults([]);
      setAiInsight('');
      setError('');
      return;
    }
    
    setIsLoading(true);
    setAiInsight('');
    setError('');

    try {
      console.log(`🔍 Unified search in modal for "${searchQuery}" (${selectedCategory})`);
      
      // Use the unified search service
      const searchResult = await unifiedSearchService.search(searchQuery, selectedCategory);
      
      setResults(searchResult.results || []);
      setAiInsight(searchResult.aiInsight || '');
      
      console.log(`✅ Modal search completed: ${searchResult.totalResults} results (${searchResult.searchType})`);
    } catch (error) {
      console.error('Unified search error:', error);
      setError('Search is temporarily unavailable. Please try again.');
      setResults([]);
      setAiInsight('');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleResultClick = (result, category) => {
    onClose();
    
    // Navigate based on category
    switch (category) {
      case 'colleges':
        navigate(`/colleges?search=${encodeURIComponent(result.name)}`);
        break;
      case 'courses':
        navigate(`/courses?search=${encodeURIComponent(result.name)}`);
        break;
      case 'cutoffs':
        navigate(`/cutoffs?search=${encodeURIComponent(result.name)}`);
        break;
      default:
        navigate(`/colleges?search=${encodeURIComponent(result.name)}`);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'colleges':
        return <Building className="w-4 h-4" />;
      case 'courses':
        return <BookOpen className="w-4 h-4" />;
      case 'cutoffs':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <GraduationCap className="w-4 h-4" />;
    }
  };

  const filteredResults = selectedCategory === 'all' ? results : results.filter(result => {
    // Simple filtering logic - you can enhance this based on your data structure
    if (selectedCategory === 'colleges') return true; // All results are colleges for now
    return true;
  });

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-blue-500" size={24} />
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  AI-Powered Search
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything... e.g., 'top colleges in Delhi', 'MBBS courses', 'cutoff trends'"
                className={`w-full pl-12 pr-4 py-4 text-lg bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-2 border-transparent focus:border-blue-500 rounded-xl transition-colors`}
              />
            </div>
          </div>

          {/* Category Filter */}
          {results.length > 0 && (
            <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="flex gap-2">
                {['all', 'colleges', 'courses', 'cutoffs'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? isDarkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {getCategoryIcon(category)}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center gap-3">
                  <BrainCircuit className="animate-pulse" size={24} />
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="p-6 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900">
                <div className="flex items-center gap-3">
                  <X className="text-red-500" size={20} />
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            {/* AI Insight */}
            {aiInsight && !isLoading && !error && (
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-900">
                <div className="flex items-start gap-3">
                  <BrainCircuit className="text-blue-500 mt-1" size={20} />
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-blue-200' : 'text-blue-800'
                  }`}>
                    {aiInsight}
                  </p>
                </div>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && !error && filteredResults.length > 0 && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Search Results
                  </h3>
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {filteredResults.length} results found
                  </span>
                </div>
                
                <div className="space-y-3">
                  {filteredResults.map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold text-lg mb-2 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {result.name}
                          </h4>
                          
                          <div className="flex items-center gap-4 text-sm mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                {result.city}, {result.state}
                              </span>
                            </div>
                            
                            {result.management_type && (
                              <div className="flex items-center gap-1">
                                <Building className="w-4 h-4 text-gray-500" />
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  result.management_type === 'GOVERNMENT' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                }`}>
                                  {result.management_type}
                                </span>
                              </div>
                            )}
                            
                            {result.establishment_year && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                  Est. {result.establishment_year}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResultClick(result, 'colleges')}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isDarkMode
                                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                            >
                              <Building className="w-4 h-4" />
                              View College
                            </button>
                            
                            <button
                              onClick={() => handleResultClick(result, 'courses')}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isDarkMode
                                  ? 'bg-green-600 hover:bg-green-500 text-white'
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              <BookOpen className="w-4 h-4" />
                              View Courses
                            </button>
                            
                            <button
                              onClick={() => handleResultClick(result, 'cutoffs')}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isDarkMode
                                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                  : 'bg-purple-500 hover:bg-purple-600 text-white'
                              }`}
                            >
                              <TrendingUp className="w-4 h-4" />
                              View Cutoffs
                            </button>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode 
                              ? 'bg-blue-500/20 text-blue-300' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {Math.round(result.score * 100)}% match
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && debouncedQuery.length > 2 && filteredResults.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <BrainCircuit size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium mb-2">No results found</p>
                <p className="text-sm">Try a different query or use the regular search</p>
              </div>
            )}

            {/* Initial State */}
            {!isLoading && !error && debouncedQuery.length <= 2 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <BrainCircuit size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium mb-2">AI-Powered Search</p>
                <p className="text-sm mb-4">Ask me anything about colleges, courses, or cutoffs in natural language</p>
                <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
                  <p>Examples:</p>
                  <p>• "Top colleges in Maharashtra"</p>
                  <p>• "MBBS courses in Delhi"</p>
                  <p>• "Government medical colleges"</p>
                  <p>• "Cutoff trends for AIIMS"</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-3 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600`}>
            <div className="flex items-center justify-between">
              <span>Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Esc</kbd> to close</span>
              <span>Powered by AI • Semantic Search</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AISearchModal;
