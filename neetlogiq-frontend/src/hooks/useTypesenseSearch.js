// Custom hook for Typesense natural language search
import { useState, useEffect, useCallback, useRef } from 'react';
import typesenseService from '../services/typesenseService';

export const useTypesenseSearch = (options = {}) => {
  const {
    type = 'all', // 'colleges', 'courses', or 'all'
    enabled = true,
    debounceMs = 300
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [facets, setFacets] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 0
  });

  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery, searchType = type, page = 1) => {
    if (!searchQuery.trim() || !enabled) {
      setResults([]);
      setTotal(0);
      setSuggestions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      let searchResult;
      
      if (searchType === 'colleges') {
        searchResult = await typesenseService.searchColleges(searchQuery, {
          page,
          limit: pagination.limit
        });
      } else if (searchType === 'courses') {
        searchResult = await typesenseService.searchCourses(searchQuery, {
          page,
          limit: pagination.limit
        });
      } else {
        searchResult = await typesenseService.universalSearch(searchQuery, {
          page,
          limit: pagination.limit
        });
      }

      if (!abortControllerRef.current.signal.aborted) {
        setResults(searchResult.data || searchResult.results || []);
        setTotal(searchResult.total || 0);
        setFacets(searchResult.facets || {});
        setSearchTime(searchResult.search_time_ms || 0);
        
        if (searchResult.pagination) {
          setPagination(prev => ({
            ...prev,
            page: searchResult.pagination.page || page,
            totalPages: searchResult.pagination.totalPages || 0
          }));
        }
      }
    } catch (error) {
      if (!abortControllerRef.current.signal.aborted) {
        console.error('Typesense search error:', error);
        setError(error.message);
        setResults([]);
        setTotal(0);
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [type, enabled, pagination.limit]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query, type, pagination.page);
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, type, performSearch, debounceMs, pagination.page]);

  // Get suggestions
  const getSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestionResults = await typesenseService.getSuggestions(searchQuery, type);
      setSuggestions(suggestionResults);
    } catch (error) {
      console.error('Typesense suggestions error:', error);
      setSuggestions([]);
    }
  }, [type]);

  // Advanced search with natural language
  const advancedSearch = useCallback(async (searchQuery, searchOptions = {}) => {
    if (!searchQuery.trim() || !enabled) {
      setResults([]);
      setTotal(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const searchResult = await typesenseService.advancedSearch(searchQuery, {
        type,
        ...searchOptions
      });

      setResults(searchResult.results || []);
      setTotal(searchResult.total || 0);
      setFacets(searchResult.facets || {});
      setSearchTime(searchResult.search_time_ms || 0);
    } catch (error) {
      console.error('Typesense advanced search error:', error);
      setError(error.message);
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [type, enabled]);

  // Search with filters
  const searchWithFilters = useCallback(async (searchQuery, filters = {}) => {
    if (!searchQuery.trim() || !enabled) {
      setResults([]);
      setTotal(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const searchResult = await typesenseService.advancedSearch(searchQuery, {
        type,
        filters,
        page: pagination.page,
        limit: pagination.limit
      });

      setResults(searchResult.results || []);
      setTotal(searchResult.total || 0);
      setFacets(searchResult.facets || {});
      setSearchTime(searchResult.search_time_ms || 0);
    } catch (error) {
      console.error('Typesense filtered search error:', error);
      setError(error.message);
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [type, enabled, pagination.page, pagination.limit]);

  // Pagination
  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
    performSearch(query, type, page);
  }, [query, type, performSearch]);

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      goToPage(pagination.page + 1);
    }
  }, [pagination.page, pagination.totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  }, [pagination.page, goToPage]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setTotal(0);
    setSuggestions([]);
    setError(null);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Health check
  const checkHealth = useCallback(async () => {
    try {
      const health = await typesenseService.healthCheck();
      return health;
    } catch (error) {
      console.error('Typesense health check error:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    query,
    results,
    isLoading,
    error,
    facets,
    suggestions,
    total,
    searchTime,
    pagination,
    
    // Actions
    setQuery,
    performSearch,
    getSuggestions,
    advancedSearch,
    searchWithFilters,
    goToPage,
    nextPage,
    prevPage,
    clearSearch,
    checkHealth,
    
    // Utilities
    hasResults: results.length > 0,
    hasError: !!error,
    isSearching: isLoading,
    canGoNext: pagination.page < pagination.totalPages,
    canGoPrev: pagination.page > 1
  };
};

export default useTypesenseSearch;
