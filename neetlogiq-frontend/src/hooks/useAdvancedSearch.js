import { useState, useEffect, useCallback, useRef } from 'react';
import simpleSearchService from '../services/simpleSearchService';

export const useAdvancedSearch = (collegesData = []) => {
  const [searchService, setSearchService] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMetadata, setSearchMetadata] = useState({});
  const [initializationProgress, setInitializationProgress] = useState({ stage: 'waiting', message: 'Waiting for data...', progress: 0 });
  
  const serviceRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Initialize the search service
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Only initialize if we haven't already initialized
    if (isInitialized) {
      return;
    }
    
    // Only initialize if we have data
    if (!collegesData || collegesData.length === 0) {
      return;
    }

    const initializeService = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setInitializationProgress({ stage: 'initializing', message: 'Initializing Simple Search...', progress: 50 });
        
        console.log('🚀 Initializing Simple Search Service...');
        
        setInitializationProgress({ stage: 'initializing', message: 'Loading college data...', progress: 75 });
        await simpleSearchService.initialize();
        
        serviceRef.current = simpleSearchService;
        setSearchService(simpleSearchService);
        setIsInitialized(true);
        setInitializationProgress({ stage: 'ready', message: 'Simple search ready!', progress: 100 });
        
        console.log('✅ Simple Search Service ready!');
      } catch (err) {
        console.error('❌ Failed to initialize search service:', err);
        setError(err.message);
        setIsInitialized(false);
        setInitializationProgress({ stage: 'error', message: `Initialization failed: ${err.message}`, progress: 0 });
        
        // Simple search doesn't need retry logic
      } finally {
        setIsLoading(false);
      }
    };

    initializeService();
    
    // Cleanup function - capture timeout ref at effect time
    const currentTimeoutRef = retryTimeoutRef;
    return () => {
      if (currentTimeoutRef.current) {
        clearTimeout(currentTimeoutRef.current);
      }
    };
  }, [collegesData, isInitialized]);

  // Perform advanced search
  const performSearch = useCallback(async (query, options = {}) => {
    if (!searchService || !isInitialized) {
      console.warn('⚠️ Search service not initialized');
      return [];
    }

    if (!query || query.trim() === '') {
      setSearchResults([]);
      setSearchMetadata({});
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Performing advanced search for:', query);
      
      const results = await searchService.search(query, options);
      
      setSearchResults(results.results || []);
      setSearchMetadata(results.metadata || {});
      
      console.log(`✅ Search completed: ${results.results?.length || 0} results found`);
      
      return results.results || [];
    } catch (err) {
      console.error('❌ Search failed:', err);
      setError(err.message);
      setSearchResults([]);
      setSearchMetadata({});
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [searchService, isInitialized]);

  // Get search suggestions
  const getSuggestions = useCallback((query, limit = 5) => {
    if (!searchService || !isInitialized) return [];
    
    try {
      return searchService.getSuggestions(query, limit);
    } catch (err) {
      console.error('❌ Failed to get suggestions:', err);
      return [];
    }
  }, [searchService, isInitialized]);

  // Update colleges data
  const updateCollegesData = useCallback(async (newCollegesData) => {
    if (!searchService) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Updating colleges data...');
      
      await searchService.updateCollegesData(newCollegesData);
      setIsInitialized(true);
      
      console.log('✅ Colleges data updated successfully!');
    } catch (err) {
      console.error('❌ Failed to update colleges data:', err);
      setError(err.message);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  }, [searchService]);

  // Get service status
  const getServiceStatus = useCallback(() => {
    if (!searchService) return null;
    return searchService.getStatus();
  }, [searchService]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchMetadata({});
    setError(null);
  }, []);

  // Get search statistics
  const getSearchStats = useCallback(() => {
    if (!searchResults || searchResults.length === 0) {
      return {
        totalResults: 0,
        lunrResults: 0,
        aiResults: 0,
        averageSearchTime: 0
      };
    }

    const lunrResults = searchResults.filter(r => r.matchType === 'lunr').length;
    const aiResults = searchResults.filter(r => r.matchType === 'ai').length;
    const hybridResults = searchResults.filter(r => r.matchType !== 'lunr' && r.matchType !== 'ai').length;

    return {
      totalResults: searchResults.length,
      lunrResults,
      aiResults,
      hybridResults,
      averageSearchTime: searchMetadata.searchTime || 0
    };
  }, [searchResults, searchMetadata]);

  return {
    // State
    searchService,
    isInitialized,
    isLoading,
    error,
    searchResults,
    searchMetadata,
    initializationProgress,
    
    // Actions
    performSearch,
    getSuggestions,
    updateCollegesData,
    clearSearch,
    
    // Utilities
    getServiceStatus,
    getSearchStats
  };
};
