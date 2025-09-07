/**
 * 🚀 Unified Search Engine
 * Combines all search methods for optimal results with minimal false positives
 * 
 * Architecture:
 * 1. Backend API Search (Primary) - Fast, server-side filtering
 * 2. AI/Vector Search (Secondary) - Semantic understanding
 * 3. Advanced Search Service (Tertiary) - Client-side fuzzy matching
 * 4. Simple Search Service (Fallback) - Basic text matching
 * 5. Regex Search (Specialized) - Pattern matching
 */

import apiService from './apiService';
import AdvancedSearchService from './advancedSearchService';
import simpleSearchService from './simpleSearchService';

class UnifiedSearchEngine {
  constructor() {
    this.apiService = apiService;
    this.advancedSearchService = new AdvancedSearchService();
    this.simpleSearchService = simpleSearchService; // Use singleton instance
    
    this.isInitialized = false;
    this.searchCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Search engine priorities and weights
    this.searchEngines = {
      backend: { weight: 0.4, priority: 1, name: 'Backend API' },
      ai: { weight: 0.3, priority: 2, name: 'AI/Vector Search' },
      advanced: { weight: 0.2, priority: 3, name: 'Advanced Client Search' },
      simple: { weight: 0.1, priority: 4, name: 'Simple Fallback' }
    };
    
    // Performance tracking
    this.performanceMetrics = {
      totalSearches: 0,
      averageResponseTime: 0,
      successRate: 0,
      cacheHitRate: 0
    };
  }

  /**
   * Initialize all search engines
   */
  async initialize(collegesData = null) {
    try {
      console.log('🚀 Initializing Unified Search Engine...');
      
      // Initialize client-side search engines
      await Promise.allSettled([
        this.advancedSearchService.initialize(collegesData),
        this.simpleSearchService.initialize(collegesData) // Singleton method
      ]);
      
      this.isInitialized = true;
      console.log('✅ Unified Search Engine initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Unified Search Engine:', error);
      return false;
    }
  }

  /**
   * Main unified search function
   */
  async search(query, options = {}) {
    const startTime = performance.now();
    this.performanceMetrics.totalSearches++;
    
    try {
      if (!query || query.trim().length === 0) {
        return this.createSearchResult([], 'empty-query', 0);
      }

      const normalizedQuery = query.trim();
      const cacheKey = this.generateCacheKey(normalizedQuery, options);
      
      // Check cache first
      if (this.searchCache.has(cacheKey)) {
        const cached = this.searchCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          this.performanceMetrics.cacheHitRate++;
          console.log('🎯 Cache hit for query:', normalizedQuery);
          return cached.result;
        }
      }

      console.log(`🔍 Unified search for: "${normalizedQuery}"`);
      
      // Determine search strategy based on query characteristics
      const searchStrategy = this.determineSearchStrategy(normalizedQuery, options);
      console.log(`📋 Search strategy: ${searchStrategy.name}`);
      
      // Execute parallel searches based on strategy
      const searchResults = await this.executeParallelSearches(normalizedQuery, searchStrategy, options);
      
      // Combine and rank results
      const unifiedResults = this.combineSearchResults(searchResults, normalizedQuery);
      
      // Cache results
      this.cacheResult(cacheKey, unifiedResults);
      
      const searchTime = performance.now() - startTime;
      this.updatePerformanceMetrics(searchTime, true);
      
      console.log(`✅ Unified search completed in ${searchTime.toFixed(2)}ms with ${unifiedResults.results.length} results`);
      
      return unifiedResults;
      
    } catch (error) {
      console.error('❌ Unified search failed:', error);
      const searchTime = performance.now() - startTime;
      this.updatePerformanceMetrics(searchTime, false);
      
      return this.createSearchResult([], 'error', searchTime, error.message);
    }
  }

  /**
   * Determine the best search strategy based on query characteristics
   */
  determineSearchStrategy(query, options) {
    const contentType = options.contentType || 'colleges';
    const queryLength = query.length;
    const hasSpaces = query.includes(' ');
    const isLikelyAbbreviation = this.isLikelyAbbreviation(query);
    const isRegexPattern = this.isRegexPattern(query);
    
    // Strategy selection logic
    if (isRegexPattern) {
      return {
        name: 'regex-focused',
        engines: ['backend', 'regex'],
        description: 'Regex pattern detected'
      };
    }
    
    if (isLikelyAbbreviation && queryLength <= 8) {
      return {
        name: 'abbreviation-focused',
        engines: ['backend', 'ai', 'advanced'],
        description: 'Abbreviation search detected'
      };
    }
    
    if (hasSpaces && queryLength > 10) {
      return {
        name: 'natural-language',
        engines: ['ai', 'backend', 'advanced'],
        description: 'Natural language query detected'
      };
    }
    
    if (contentType === 'courses') {
      return {
        name: 'course-specific',
        engines: ['backend'],
        description: 'Course search - backend only for aggregated results'
      };
    }
    
    // Default comprehensive strategy
    return {
      name: 'comprehensive',
      engines: ['backend', 'ai', 'advanced', 'simple'],
      description: 'Comprehensive search across all engines'
    };
  }

  /**
   * Execute searches in parallel based on strategy
   */
  async executeParallelSearches(query, strategy, options) {
    const searchPromises = [];
    
    // Backend API Search (Primary)
    if (strategy.engines.includes('backend')) {
      searchPromises.push(
        this.executeBackendSearch(query, options)
          .then(result => ({ engine: 'backend', result, weight: this.searchEngines.backend.weight }))
          .catch(error => ({ engine: 'backend', result: null, error, weight: this.searchEngines.backend.weight }))
      );
    }
    
    // AI/Vector Search (Secondary)
    if (strategy.engines.includes('ai')) {
      searchPromises.push(
        this.executeAISearch(query, options)
          .then(result => ({ engine: 'ai', result, weight: this.searchEngines.ai.weight }))
          .catch(error => ({ engine: 'ai', result: null, error, weight: this.searchEngines.ai.weight }))
      );
    }
    
    // Advanced Search Service (Tertiary)
    if (strategy.engines.includes('advanced') && this.advancedSearchService.isInitialized) {
      searchPromises.push(
        this.executeAdvancedSearch(query, options)
          .then(result => ({ engine: 'advanced', result, weight: this.searchEngines.advanced.weight }))
          .catch(error => ({ engine: 'advanced', result: null, error, weight: this.searchEngines.advanced.weight }))
      );
    }
    
    // Simple Search Service (Fallback)
    if (strategy.engines.includes('simple') && this.simpleSearchService.isInitialized) {
      searchPromises.push(
        this.executeSimpleSearch(query, options)
          .then(result => ({ engine: 'simple', result, weight: this.searchEngines.simple.weight }))
          .catch(error => ({ engine: 'simple', result: null, error, weight: this.searchEngines.simple.weight }))
      );
    }
    
    // Regex Search (Specialized)
    if (strategy.engines.includes('regex')) {
      searchPromises.push(
        this.executeRegexSearch(query, options)
          .then(result => ({ engine: 'regex', result, weight: 0.2 }))
          .catch(error => ({ engine: 'regex', result: null, error, weight: 0.2 }))
      );
    }
    
    console.log(`🔄 Executing ${searchPromises.length} search engines in parallel...`);
    
    // Execute all searches in parallel
    const results = await Promise.allSettled(searchPromises);
    
    // Process results
    const processedResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .filter(result => result.result !== null);
    
    console.log(`📊 ${processedResults.length}/${searchPromises.length} search engines completed successfully`);
    
    return processedResults;
  }

  /**
   * Execute backend API search
   */
  async executeBackendSearch(query, options) {
    const contentType = options.contentType || 'colleges';
    const limit = options.limit || 100; // Use higher limit for comprehensive search
    const page = options.page || 1;
    
    let apiResponse;
    if (contentType === 'colleges') {
      apiResponse = await this.apiService.searchColleges(query, page, limit);
    } else if (contentType === 'courses') {
      apiResponse = await this.apiService.searchCourses(query, page, limit);
    } else if (contentType === 'cutoffs') {
      apiResponse = await this.apiService.searchCutoffs(query, page, limit);
    } else {
      throw new Error(`Unsupported content type: ${contentType}`);
    }
    
    // Transform API response to match expected format
    return {
      results: apiResponse.data || [],
      searchType: 'backend-api',
      total: apiResponse.pagination?.totalItems || (apiResponse.data?.length || 0),
      pagination: apiResponse.pagination || {}
    };
  }

  /**
   * Execute AI/Vector search
   */
  async executeAISearch(query, options) {
    const contentType = options.contentType || 'colleges';
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8787'}/api/ai-search?q=${encodeURIComponent(query)}&type=${contentType}`);
      if (response.ok) {
        const data = await response.json();
        return {
          results: data.results || [],
          total: data.total || 0,
          searchType: 'ai-search',
          metadata: data.metadata || {}
        };
      }
      throw new Error(`AI search failed: ${response.status}`);
    } catch (error) {
      console.warn('⚠️ AI search failed, falling back to regular search:', error.message);
      throw error;
    }
  }

  /**
   * Execute advanced search service
   */
  async executeAdvancedSearch(query, options) {
    if (!this.advancedSearchService.isInitialized) {
      throw new Error('Advanced search service not initialized');
    }
    
    const result = await this.advancedSearchService.search(query, options);
    return {
      results: result.results || [],
      total: result.total || 0,
      searchType: 'advanced-search',
      metadata: result.metadata || {}
    };
  }

  /**
   * Execute simple search service
   */
  async executeSimpleSearch(query, options) {
    if (!this.simpleSearchService.isInitialized) {
      throw new Error('Simple search service not initialized');
    }
    
    const result = await this.simpleSearchService.search(query, options);
    return {
      results: result.results || [],
      total: result.total || 0,
      searchType: 'simple-search',
      metadata: result.metadata || {}
    };
  }

  /**
   * Execute regex search
   */
  async executeRegexSearch(query, options) {
    // const contentType = options.contentType || 'colleges'; // Available for future use
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8787'}/api/colleges/regex-search?pattern=${encodeURIComponent(query)}&limit=${options.limit || 50}`);
      if (response.ok) {
        const data = await response.json();
        return {
          results: data.data || [],
          total: data.totalMatches || 0,
          searchType: 'regex-search',
          metadata: { pattern: query, totalMatches: data.totalMatches }
        };
      }
      throw new Error(`Regex search failed: ${response.status}`);
    } catch (error) {
      console.warn('⚠️ Regex search failed:', error.message);
      throw error;
    }
  }

  /**
   * Combine and rank search results from multiple engines
   */
  combineSearchResults(searchResults, query) {
    if (searchResults.length === 0) {
      return this.createSearchResult([], 'no-results', 0);
    }
    
    // If only one engine succeeded, return its results
    if (searchResults.length === 1) {
      const result = searchResults[0];
      return this.createSearchResult(
        result.result.results || [],
        result.result.searchType || 'single-engine',
        0,
        null,
        { engine: result.engine, weight: result.weight }
      );
    }
    
    // Combine results from multiple engines
    const combinedResults = new Map();
    const engineWeights = {};
    
    // Process results from each engine
    searchResults.forEach(({ engine, result, weight }) => {
      engineWeights[engine] = weight;
      
      if (result && result.results) {
        result.results.forEach(item => {
          const key = this.generateItemKey(item);
          
          if (combinedResults.has(key)) {
            // Merge with existing result
            const existing = combinedResults.get(key);
            existing.relevanceScore = Math.max(existing.relevanceScore, item.relevanceScore || 0);
            existing.matchTypes = [...new Set([...(existing.matchTypes || []), ...(item.matchTypes || [])])];
            existing.searchEngines = [...new Set([...(existing.searchEngines || []), engine])];
            existing.engineScores = existing.engineScores || {};
            existing.engineScores[engine] = item.relevanceScore || 0;
          } else {
            // Add new result
            combinedResults.set(key, {
              ...item,
              searchEngines: [engine],
              engineScores: { [engine]: item.relevanceScore || 0 },
              matchTypes: item.matchTypes || []
            });
          }
        });
      }
    });
    
    // Convert to array and calculate unified scores
    const unifiedResults = Array.from(combinedResults.values()).map(item => {
      // Calculate weighted score based on engine weights
      const weightedScore = Object.entries(item.engineScores || {}).reduce((sum, [engine, score]) => {
        return sum + (score * (engineWeights[engine] || 0));
      }, 0);
      
      // Boost score for results found by multiple engines
      const engineCount = item.searchEngines.length;
      const multiEngineBoost = engineCount > 1 ? 1 + (engineCount - 1) * 0.1 : 1;
      
      return {
        ...item,
        relevanceScore: weightedScore * multiEngineBoost,
        unifiedScore: weightedScore * multiEngineBoost
      };
    });
    
    // Sort by unified score
    unifiedResults.sort((a, b) => b.unifiedScore - a.unifiedScore);
    
    // Remove duplicates and limit results
    const finalResults = this.deduplicateResults(unifiedResults);
    
    return this.createSearchResult(
      finalResults,
      'unified-search',
      0,
      null,
      {
        engines: Object.keys(engineWeights),
        engineWeights,
        totalEngines: searchResults.length,
        combinedResults: combinedResults.size
      }
    );
  }

  /**
   * Helper methods
   */
  isLikelyAbbreviation(query) {
    return query.length <= 8 && 
           !query.includes(' ') && 
           /^[A-Za-z]+$/.test(query) &&
           query.length >= 2;
  }

  isRegexPattern(query) {
    const regexPatterns = [
      /^[.*+?^${}()|[\]\\]/,  // Starts with regex special chars
      /.*[.*+?^${}()|[\]\\].*/,  // Contains regex special chars
      /^\/.*\/$/,  // Wrapped in slashes
      /^\\[dws]/,  // Starts with regex escapes
    ];
    
    return regexPatterns.some(pattern => pattern.test(query));
  }

  generateItemKey(item) {
    // Generate unique key for deduplication
    if (item.id) return `id:${item.id}`;
    if (item.college_id) return `college:${item.college_id}`;
    if (item.course_id) return `course:${item.course_id}`;
    if (item.name) return `name:${item.name.toLowerCase()}`;
    return `fallback:${JSON.stringify(item).slice(0, 50)}`;
  }

  generateCacheKey(query, options) {
    return `${query.toLowerCase()}:${JSON.stringify(options)}`;
  }

  cacheResult(key, result) {
    this.searchCache.set(key, {
      result,
      timestamp: Date.now()
    });
    
    // Clean old cache entries
    if (this.searchCache.size > 100) {
      const entries = Array.from(this.searchCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, 20);
      toDelete.forEach(([key]) => this.searchCache.delete(key));
    }
  }

  deduplicateResults(results) {
    const seen = new Set();
    return results.filter(item => {
      const key = this.generateItemKey(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  updatePerformanceMetrics(searchTime, success) {
    const total = this.performanceMetrics.totalSearches;
    const currentAvg = this.performanceMetrics.averageResponseTime;
    this.performanceMetrics.averageResponseTime = (currentAvg * (total - 1) + searchTime) / total;
    
    const currentSuccessRate = this.performanceMetrics.successRate;
    this.performanceMetrics.successRate = (currentSuccessRate * (total - 1) + (success ? 1 : 0)) / total;
  }

  createSearchResult(results, searchType, searchTime, error = null, metadata = {}) {
    return {
      results: results || [],
      total: results ? results.length : 0,
      searchType,
      searchTime,
      error,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        unifiedEngine: true
      }
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheSize: this.searchCache.size,
      isInitialized: this.isInitialized,
      engines: Object.keys(this.searchEngines)
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.searchCache.clear();
    console.log('🧹 Search cache cleared');
  }
}

export default UnifiedSearchEngine;
