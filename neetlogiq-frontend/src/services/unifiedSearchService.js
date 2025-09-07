/**
 * Unified Search Service
 * Intelligently combines AI search and regular search for the best user experience
 * Now with advanced caching and request deduplication
 * 
 * UPDATED: Now integrates with the new UnifiedSearchEngine for optimal results
 */

import cacheManager from '../utils/cache.js';
import requestDeduplication from '../utils/requestDeduplication.js';
import UnifiedSearchEngine from './unifiedSearchEngine.js';

class UnifiedSearchService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'https://neetlogiq-backend.neetlogiq.workers.dev';
    this.searchCache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
    this.requestTimeout = 10000; // 10 seconds
    
    // Initialize the new unified search engine
    this.unifiedEngine = new UnifiedSearchEngine();
    this.isEngineInitialized = false;
  }

  /**
   * Initialize the unified search engine
   * @param {Array} collegesData - College data for client-side search
   */
  async initialize(collegesData = []) {
    try {
      console.log('🚀 Initializing UnifiedSearchService with new engine...');
      this.isEngineInitialized = await this.unifiedEngine.initialize(collegesData);
      console.log('✅ UnifiedSearchService initialized:', this.isEngineInitialized);
      return this.isEngineInitialized;
    } catch (error) {
      console.error('❌ Failed to initialize UnifiedSearchService:', error);
      this.isEngineInitialized = false;
      return false;
    }
  }

  /**
   * Perform unified search across all content types
   * @param {string} query - Search query
   * @param {string} contentType - 'colleges', 'courses', 'cutoffs', or 'all'
   * @param {Object} options - Additional search options
   * @returns {Promise<Object>} Search results with AI insights
   */
  async search(query, contentType = 'all', options = {}) {
    if (!query || query.trim().length < 2) {
      return {
        results: [],
        aiInsight: '',
        searchType: 'none',
        totalResults: 0
      };
    }

    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = cacheManager.generateKey(normalizedQuery, contentType, options);
    
    // Check advanced cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      console.log('🚀 Advanced cache hit for:', normalizedQuery);
      return cached;
    }

    console.log(`🔍 Unified search for "${normalizedQuery}" (${contentType})`);
    
    // Use the new unified search engine if available
    if (this.isEngineInitialized && this.unifiedEngine) {
      try {
        console.log('🚀 Using new UnifiedSearchEngine...');
        const unifiedResult = await this.unifiedEngine.search(normalizedQuery, {
          contentType,
          ...options
        });
        
        // Transform result to match expected format
        const transformedResult = {
          results: unifiedResult.results || [],
          aiInsight: this.generateAIInsight(unifiedResult, normalizedQuery),
          searchType: unifiedResult.searchType || 'unified',
          totalResults: unifiedResult.total || 0,
          metadata: unifiedResult.metadata || {},
          searchTime: unifiedResult.searchTime || 0
        };
        
        cacheManager.set(cacheKey, transformedResult, this.cacheTimeout);
        return transformedResult;
      } catch (unifiedError) {
        console.warn('⚠️ UnifiedSearchEngine failed, falling back to legacy search:', unifiedError.message);
      }
    }
    
    // Fallback to legacy search methods
    console.log('🔄 Using legacy search methods...');
    
    if (contentType === 'courses') {
      console.log(' unifiedSearchService.js: Bypassing AI, performing regular search for courses');
      return await this.performRegularSearch(query, 'courses');
    }

    try {
      // Try AI search first with deduplication for other content types
      const aiResult = await this.performAISearch(normalizedQuery, contentType);
      if (aiResult.success) {
        console.log('🤖 AI search successful');
        cacheManager.set(cacheKey, aiResult.data, this.cacheTimeout);
        return aiResult.data;
      }
    } catch (error) {
      console.log('🤖 AI search failed, falling back to regular search:', error.message);
    }

    // Fallback to regular search with deduplication
    console.log('🔍 Using regular search fallback');
    const regularResult = await this.performRegularSearch(normalizedQuery, contentType, options);
    cacheManager.set(cacheKey, regularResult, this.cacheTimeout);
    return regularResult;
  }

  /**
   * Generate AI insight from search results
   * @param {Object} result - Search result
   * @param {string} query - Original query
   * @returns {string} AI insight
   */
  generateAIInsight(result, query) {
    if (!result || !result.results || result.results.length === 0) {
      return `No results found for "${query}". Try different keywords or check spelling.`;
    }
    
    const resultCount = result.results.length;
    const searchType = result.searchType || 'search';
    const engines = result.metadata?.engines || [];
    
    if (engines.length > 1) {
      return `Found ${resultCount} results using ${engines.join(', ')} search engines. Results are ranked by relevance across multiple algorithms.`;
    } else if (searchType === 'unified') {
      return `Found ${resultCount} results using unified search. Results are optimized for accuracy and relevance.`;
    } else {
      return `Found ${resultCount} results for "${query}". Results are ranked by relevance.`;
    }
  }

  /**
   * Perform AI-powered search with deduplication
   */
  async performAISearch(query, contentType) {
    try {
      const url = `${this.baseUrl}/api/ai-search?q=${encodeURIComponent(query)}&type=${contentType}`;
      const data = await requestDeduplication.execute(url, { 
        method: 'GET',
        timeout: 5000 
      });
      
      return {
        success: true,
        data: {
          results: data.results || [],
          aiInsight: data.aiInsight || this.generateFallbackInsight(query, data.results?.length || 0),
          searchType: 'ai',
          totalResults: data.results?.length || 0,
          contentType: contentType
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Perform regular search as fallback
   */
  async performRegularSearch(query, contentType, options) {
    try {
      let results = [];
      let aiInsight = '';

      if (contentType === 'all' || contentType === 'colleges') {
        const collegesResult = await this.searchColleges(query, options);
        results = [...results, ...collegesResult.map(r => ({ ...r, category: 'colleges' }))];
      }

      if (contentType === 'all' || contentType === 'courses') {
        const coursesResult = await this.searchCourses(query, options);
        results = [...results, ...coursesResult.map(r => ({ ...r, category: 'courses' }))];
      }

      if (contentType === 'all' || contentType === 'cutoffs') {
        const cutoffsResult = await this.searchCutoffs(query, options);
        results = [...results, ...cutoffsResult.map(r => ({ ...r, category: 'cutoffs' }))];
      }

      aiInsight = this.generateFallbackInsight(query, results.length);

      return {
        results,
        aiInsight,
        searchType: 'regular',
        totalResults: results.length,
        contentType: contentType
      };
    } catch (error) {
      console.error('Regular search failed:', error);
      return {
        results: [],
        aiInsight: 'Sorry, search is temporarily unavailable. Please try again.',
        searchType: 'error',
        totalResults: 0,
        contentType: contentType
      };
    }
  }

  /**
   * Search colleges using regular API with deduplication
   */
  async searchColleges(query, options = {}) {
    try {
      const params = new URLSearchParams({
        search: query,
        limit: options.limit || 10,
        page: options.page || 1
      });

      const url = `${this.baseUrl}/api/colleges?${params}`;
      const data = await requestDeduplication.execute(url, { 
        method: 'GET',
        timeout: this.requestTimeout 
      });
      
      return data.data || [];
    } catch (error) {
      console.error('College search failed:', error);
      return [];
    }
  }

  /**
   * Search courses using regular API with deduplication
   */
  async searchCourses(query, options = {}) {
    try {
      const params = new URLSearchParams({
        search: query,
        limit: options.limit || 10,
        page: options.page || 1
      });

      const url = `${this.baseUrl}/api/courses?${params}`;
      const data = await requestDeduplication.execute(url, { 
        method: 'GET',
        timeout: this.requestTimeout 
      });
      
      return data.data || [];
    } catch (error) {
      console.error('Course search failed:', error);
      return [];
    }
  }

  /**
   * Search cutoffs (mock implementation for now)
   */
  async searchCutoffs(query, options = {}) {
    // Mock cutoffs data - replace with real API when available
    const mockCutoffs = [
      {
        id: 'cutoff-1',
        college: 'AIIMS Delhi',
        course: 'MBBS',
        category: 'General',
        cutoff_rank: 1,
        year: 2024
      },
      {
        id: 'cutoff-2',
        college: 'AIIMS Delhi',
        course: 'MBBS',
        category: 'OBC',
        cutoff_rank: 5,
        year: 2024
      }
    ];

    return mockCutoffs.filter(cutoff => 
      cutoff.college.toLowerCase().includes(query.toLowerCase()) ||
      cutoff.course.toLowerCase().includes(query.toLowerCase()) ||
      cutoff.category.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Generate fallback insight when AI is not available
   */
  generateFallbackInsight(query, resultCount) {
    if (resultCount === 0) {
      return `No results found for "${query}". Try a different search term.`;
    } else if (resultCount === 1) {
      return `Found 1 result for "${query}". Here's the best match!`;
    } else {
      return `Found ${resultCount} results for "${query}". Here are the best matches!`;
    }
  }

  /**
   * Cache management - now using advanced cache manager
   */
  getCachedResult(key) {
    return cacheManager.get(key);
  }

  cacheResult(key, data) {
    cacheManager.set(key, data, this.cacheTimeout);
  }

  /**
   * Clear search cache
   */
  clearCache() {
    cacheManager.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheManager.getStats();
  }

  /**
   * Cleanup expired cache items
   */
  cleanupCache() {
    cacheManager.cleanup();
  }

  /**
   * Get search suggestions based on query
   */
  async getSuggestions(query, contentType = 'all') {
    if (query.length < 2) return [];

    try {
      // Use a quick search to get suggestions
      const result = await this.search(query, contentType, { limit: 5 });
      return result.results.slice(0, 5);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }
}

// Create and export a singleton instance
const unifiedSearchService = new UnifiedSearchService();
export default unifiedSearchService;
