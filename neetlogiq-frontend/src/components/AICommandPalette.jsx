import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, BrainCircuit, X, MapPin, Calendar, Building } from 'lucide-react';
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

const AICommandPalette = ({ isVisible, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [aiInsight, setAiInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const inputRef = useRef(null);
  
  // Lock body scroll when modal is open
  useScrollLock(isVisible);

  useEffect(() => {
    if (isVisible) {
      // Focus input when the palette becomes visible
      inputRef.current?.focus();
    } else {
      // Reset state when closed
      setQuery('');
      setResults([]);
      setAiInsight('');
      setError('');
    }
  }, [isVisible]);

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
      const response = await fetch(`http://localhost:8787/api/ai-search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      const data = await response.json();
      setAiInsight(data.aiInsight || '');
      setResults(data.results || []);
    } catch (error) {
      console.error('AI search error:', error);
      setError('AI search is not available. Please try the regular search.');
      setResults([]);
      setAiInsight('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="relative border-b border-gray-200 dark:border-gray-700">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... e.g., 'top colleges in Delhi with good ranks'"
            className="w-full pl-12 pr-4 py-4 text-lg bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <BrainCircuit className="animate-pulse" size={20} />
                <span>AI is thinking...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900">
              <div className="flex items-center gap-3">
                <X className="text-red-500" size={20} />
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* AI Insight */}
          {aiInsight && !isLoading && !error && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-blue-500" size={20} />
                <p className="text-blue-800 dark:text-blue-200 font-medium">{aiInsight}</p>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && !error && results.length > 0 && (
            <ul>
              {results.map((result) => (
                <li 
                  key={result.id} 
                  className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 dark:text-gray-100 mb-1">
                        {result.name}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{result.city}, {result.state}</span>
                        </div>
                        {result.management_type && (
                          <div className="flex items-center gap-1">
                            <Building size={14} />
                            <span>{result.management_type}</span>
                          </div>
                        )}
                        {result.establishment_year && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Est. {result.establishment_year}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Match: {Math.round(result.score * 100)}%
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* No Results */}
          {!isLoading && !error && debouncedQuery.length > 2 && results.length === 0 && (
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
              <p className="text-sm">Ask me anything about colleges in natural language</p>
              <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                <p>Examples:</p>
                <p>• "Top colleges in Maharashtra"</p>
                <p>• "Government medical colleges in Delhi"</p>
                <p>• "Private colleges established after 2010"</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <span>Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Esc</kbd> to close</span>
            <span>Powered by AI • Semantic Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICommandPalette;
