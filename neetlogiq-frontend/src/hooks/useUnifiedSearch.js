/**
 * 🚀 Unified Search Hook
 * React hook for using the unified search engine
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import UnifiedSearchEngine from '../services/unifiedSearchEngine';

export const useUnifiedSearch = (collegesData = [], options = {}) => {
  const [searchEngine, setSearchEngine] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMetadata, setSearchMetadata] = useState({});
  const [error, setError] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  
  const initializationTimeoutRef = useRef(null);
  const currentTimeoutRef = useRef(null);

  // Initialize search engine
  useEffect(() => {
    // Only initialize if we haven't already initialized
    if (isInitialized) {
      return;
    }
    
    // Initialize even with empty data (for cutoffs page)
    // The search engine can handle empty data gracefully

    const initializeSearchEngine = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🚀 Initializing Unified Search Engine...');
        console.log('📊 Colleges data length:', collegesData?.length || 0);
        
        const engine = new UnifiedSearchEngine();
        const success = await engine.initialize(collegesData);
        
        if (success) {
          setSearchEngine(engine);
          setIsInitialized(true);
          setPerformanceMetrics(engine.getPerformanceMetrics());
          console.log('✅ Unified Search Engine initialized successfully');
        } else {
          throw new Error('Failed to initialize search engine');
        }
      } catch (err) {
        console.error('❌ Failed to initialize Unified Search Engine:', err);
        setError(err.message);
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Only initialize if we have colleges data or if we haven't initialized yet
    if (collegesData && collegesData.length > 0) {
      // Clear any existing timeout
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }

      // Initialize with a small delay to prevent rapid re-initialization
      initializationTimeoutRef.current = setTimeout(initializeSearchEngine, 100);
    } else if (!isInitialized && collegesData && collegesData.length === 0) {
      // Only initialize with empty data if we explicitly have empty colleges data
      console.log('⚠️ No colleges data available, initializing with empty data...');
      initializeSearchEngine();
    }

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, [collegesData, isInitialized]);

  // Perform unified search
  const performSearch = useCallback(async (query, searchOptions = {}) => {
    if (!searchEngine || !isInitialized) {
      console.warn('⚠️ Unified Search Engine not initialized');
      return [];
    }

    if (!query || query.trim() === '') {
      setSearchResults([]);
      setSearchMetadata({});
      setError(null);
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Performing unified search for:', query);
      
      const results = await searchEngine.search(query, {
        ...options,
        ...searchOptions
      });
      
      setSearchResults(results.results || []);
      setSearchMetadata(results.metadata || {});
      setPerformanceMetrics(searchEngine.getPerformanceMetrics());
      
      console.log(`✅ Unified search completed: ${results.results?.length || 0} results found`);
      console.log(`📊 Search type: ${results.searchType}, Time: ${results.searchTime?.toFixed(2)}ms`);
      
      return results.results || [];
    } catch (err) {
      console.error('❌ Unified search failed:', err);
      setError(err.message);
      setSearchResults([]);
      setSearchMetadata({});
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [searchEngine, isInitialized, options]);

  // Debounced search function
  const performDebouncedSearch = useCallback((query, searchOptions = {}, delay = 300) => {
    return new Promise((resolve) => {
      // Clear existing timeout
      if (currentTimeoutRef.current) {
        clearTimeout(currentTimeoutRef.current);
      }

      // Set new timeout
      currentTimeoutRef.current = setTimeout(async () => {
        const results = await performSearch(query, searchOptions);
        resolve(results);
      }, delay);
    });
  }, [performSearch]);

  // Get search suggestions
  const getSuggestions = useCallback(async (query, limit = 5) => {
    if (!searchEngine || !isInitialized || !query) return [];
    
    try {
      // Use a lightweight, fast search for suggestions
      const suggestions = await searchEngine.search(query, {
        contentType: options.contentType || 'colleges',
        strategy: {
          name: 'suggestions-fast',
          engines: ['advanced', 'simple'], // Use only fast, client-side engines
          description: 'Fast suggestions for dropdown'
        }
      });
      
      // Return only the names, limited to the specified count
      return suggestions.results
        .map(item => item.name)
        .slice(0, limit);
    } catch (err) {
      console.error('❌ Failed to get suggestions:', err);
      return [];
    }
  }, [searchEngine, isInitialized, options.contentType]);

  // Update colleges data
  const updateCollegesData = useCallback(async (newCollegesData) => {
    if (!searchEngine) return;
    
    try {
      console.log('🔄 Updating colleges data in unified search engine...');
      await searchEngine.initialize(newCollegesData);
      setPerformanceMetrics(searchEngine.getPerformanceMetrics());
      console.log('✅ Colleges data updated successfully');
    } catch (err) {
      console.error('❌ Failed to update colleges data:', err);
      setError(err.message);
    }
  }, [searchEngine]);

  // Clear search cache
  const clearCache = useCallback(() => {
    if (searchEngine) {
      searchEngine.clearCache();
      setPerformanceMetrics(searchEngine.getPerformanceMetrics());
    }
  }, [searchEngine]);

  // Get search engine status
  const getSearchStatus = useCallback(() => {
    return {
      isInitialized,
      isLoading,
      hasError: !!error,
      error,
      performanceMetrics,
      searchEngine: searchEngine ? 'unified' : null
    };
  }, [isInitialized, isLoading, error, performanceMetrics, searchEngine]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentTimeoutRef.current) {
        clearTimeout(currentTimeoutRef.current);
      }
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Search functions
    performSearch,
    performDebouncedSearch,
    getSuggestions,
    
    // Data management
    updateCollegesData,
    clearCache,
    
    // State
    searchResults,
    searchMetadata,
    isInitialized,
    isLoading,
    error,
    performanceMetrics,
    
    // Utilities
    getSearchStatus,
    
    // Direct access to search engine (for advanced usage)
    searchEngine
  };
};

export default useUnifiedSearch;
