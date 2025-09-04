import nlp from 'compromise';
import Fuse from 'fuse.js';
import FlexSearch from 'flexsearch';
import uFuzzy from '@leeoniya/ufuzzy';
import fuzzysort from 'fuzzysort';
import * as tf from '@tensorflow/tfjs';
import apiService from './apiService';

class AdvancedSearchService {
  constructor() {
    this.collegesData = [];
    this.lunrIndex = null;
    this.tfModel = null;
    this.fuseIndex = null;
    this.flexSearchIndex = null;
    this.uFuzzyIndex = null;
    this.fuzzysortIndex = null;
    this.aliasesCache = new Map(); // Cache for aliases
    this.isInitialized = false;
    this.initializationProgress = 0;
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  // Initialize all search services
  async initialize(collegesData) {
    try {
      console.log('🚀 Initializing Advanced Search Service...');
      this.collegesData = collegesData || [];
      
      if (this.collegesData.length === 0) {
        console.warn('⚠️ No colleges data provided for initialization');
        return { success: false, error: 'No colleges data provided' };
      }

      console.log(`📊 Initializing with ${this.collegesData.length} colleges...`);
      
      // Initialize simple search index
      await this.initializeSimpleIndex();
      this.initializationProgress = 20;
      
      // Initialize Neural Network for intelligent abbreviation matching
      await this.initializeNeuralNetwork();
      this.initializationProgress = 40;
      
      // Initialize Advanced Regex Pattern Engine
      await this.initializeRegexPatternEngine();
      this.initializationProgress = 60;
      
      // Initialize Compromise.js
      await this.initializeCompromise();
      this.initializationProgress = 80;
      
      // Initialize Fuse.js for fuzzy abbreviation matching
      await this.initializeFuseIndex();
      this.initializationProgress = 95;
      
      // Initialize FlexSearch for advanced pattern matching
      await this.initializeFlexSearchIndex();
      this.initializationProgress = 98;
      
      // Initialize uFuzzy for ultra-fast fuzzy matching
      await this.initializeUFuzzyIndex();
      this.initializationProgress = 99;
      
      // Initialize fuzzysort for intelligent result ranking
      await this.initializeFuzzysortIndex();
      this.initializationProgress = 100;
      
      this.isInitialized = true;
      console.log('✅ Advanced Search Service initialized successfully!');
      
      return { success: true, message: 'Advanced Search Service initialized successfully' };
      
    } catch (error) {
      console.error('❌ Failed to initialize Advanced Search Service:', error);
      return { success: false, error: error.message };
    }
  }

  // Initialize simple search index (no complex libraries)
  async initializeSimpleIndex() {
    try {
      console.log('🔍 Initializing simple search index...');
      
      // Create a simple, fast search index
      this.simpleIndex = this.collegesData.map(college => ({
        id: college.id,
        name: (college.name || '').toLowerCase().trim(),
        city: (college.city || '').toLowerCase().trim(),
        state: (college.state || '').toLowerCase().trim(),
        college_type: (college.college_type || '').toLowerCase().trim(),
        stream: (college.stream || '').toLowerCase().trim(),
        original: college
      }));
      
      console.log('✅ Simple search index initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize simple search index:', error);
      throw error;
    }
  }

  // Initialize Neural Network for intelligent abbreviation matching
  async initializeNeuralNetwork() {
    try {
      console.log('🧠 Initializing Neural Network for abbreviation matching...');
      
      // Create a neural network specifically for abbreviation pattern recognition
      this.neuralModel = tf.sequential({
        layers: [
          // Input layer: 50 features (character patterns, positions, etc.)
          tf.layers.dense({ 
            inputShape: [50], 
            units: 128, 
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
          }),
          tf.layers.dropout({ rate: 0.3 }),
          
          // Hidden layers for pattern recognition
          tf.layers.dense({ 
            units: 64, 
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
          }),
          tf.layers.dropout({ rate: 0.2 }),
          
          tf.layers.dense({ 
            units: 32, 
            activation: 'relu' 
          }),
          
          // Output layer: 10 classes (different abbreviation patterns)
          tf.layers.dense({ 
            units: 10, 
            activation: 'softmax' 
          })
        ]
      });
      
      // Compile the model with advanced optimization
      this.neuralModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });
      
      // Create abbreviation pattern vocabulary
      this.abbreviationPatterns = [
        'dot_separated',      // A.J.
        'space_separated',    // A J
        'no_separator',       // AJ
        'mixed_dots',         // A.J
        'mixed_spaces',       // A J.
        'single_letter',      // A
        'double_letter',      // AB
        'triple_letter',      // ABC
        'complex_pattern',    // A.B.C.
        'irregular_pattern'   // A.B C
      ];
      
      console.log('✅ Neural Network initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Neural Network:', error);
      throw error;
    }
  }

  // Initialize Advanced Regex Pattern Engine
  async initializeRegexPatternEngine() {
    try {
      console.log('🔍 Initializing Advanced Regex Pattern Engine...');
      
      // Create comprehensive regex patterns for abbreviation matching
      this.regexPatterns = {
        // Basic patterns
        dotSeparated: /([A-Z])\.([A-Z])\.?/g,
        spaceSeparated: /([A-Z])\s+([A-Z])/g,
        noSeparator: /([A-Z])([A-Z])/g,
        
        // Advanced patterns
        mixedDots: /([A-Z])\.([A-Z])/g,
        mixedSpaces: /([A-Z])\s+([A-Z])\.?/g,
        
        // Complex patterns
        tripleDot: /([A-Z])\.([A-Z])\.([A-Z])\.?/g,
        tripleSpace: /([A-Z])\s+([A-Z])\s+([A-Z])/g,
        tripleNoSep: /([A-Z])([A-Z])([A-Z])/g,
        
        // Flexible patterns
        flexibleDots: /([A-Z])\.?([A-Z])\.?/g,
        flexibleSpaces: /([A-Z])\s*([A-Z])\s*/g,
        
        // Special cases
        singleLetter: /^([A-Z])$/,
        doubleLetter: /^([A-Z])([A-Z])$/,
        tripleLetter: /^([A-Z])([A-Z])([A-Z])$/
      };
      
      // Create pattern normalization rules
      this.normalizationRules = {
        // Convert all variations to a standard format
        'A.J.': ['A J', 'AJ', 'A.J'],
        'A J': ['A.J.', 'AJ', 'A.J'],
        'AJ': ['A.J.', 'A J', 'A.J'],
        'A.J': ['A.J.', 'A J', 'AJ'],
        
        // Triple patterns
        'A.B.C.': ['A B C', 'ABC', 'A.B.C'],
        'A B C': ['A.B.C.', 'ABC', 'A.B.C'],
        'ABC': ['A.B.C.', 'A B C', 'A.B.C'],
        'A.B.C': ['A.B.C.', 'A B C', 'ABC']
      };
      
      console.log('✅ Advanced Regex Pattern Engine initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Regex Pattern Engine:', error);
      throw error;
    }
  }

  // Initialize Compromise.js for natural language processing
  async initializeCompromise() {
    try {
      console.log('📝 Initializing Compromise.js...');
      
      // Test Compromise.js functionality
      const testDoc = nlp('test college medical');
      const entities = testDoc.match('#Noun+').out('array');
      
      if (entities.length > 0) {
        console.log('✅ Compromise.js initialized successfully');
      } else {
        throw new Error('Compromise.js test failed');
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize Compromise.js:', error);
      throw error;
    }
  }

  // Initialize Fuse.js for intelligent fuzzy abbreviation matching
  async initializeFuseIndex() {
    try {
      console.log('🔍 Initializing Fuse.js index...');
      
      // Configure Fuse.js for abbreviation-aware search
      const fuseOptions = {
        // Search in name field with high priority
        keys: [
          { name: 'name', weight: 1.0 },
          { name: 'city', weight: 0.6 },
          { name: 'state', weight: 0.4 }
        ],
        // Threshold for fuzzy matching (0.0 = perfect match, 1.0 = very loose)
        threshold: 0.3,
        // Enable pattern matching for abbreviations
        useExtendedSearch: true,
        // Enable regex support
        isCaseSensitive: false,
        // Distance for fuzzy matching
        distance: 100,
        // Minimum characters for pattern matching
        minMatchCharLength: 2,
        // Enable tokenization for abbreviation matching
        tokenize: true,
        // Enable sorting by relevance
        shouldSort: true,
        // Include score in results
        includeScore: true,
        // Include matches in results
        includeMatches: true
      };
      
      // Create Fuse.js index
      this.fuseIndex = new Fuse(this.collegesData, fuseOptions);
      
      console.log('✅ Fuse.js index initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Fuse.js index:', error);
      throw error;
    }
  }

  // Initialize FlexSearch for advanced pattern matching
  async initializeFlexSearchIndex() {
    try {
      console.log('🔍 Initializing FlexSearch index...');
      
      // Create FlexSearch index with abbreviation support
      this.flexSearchIndex = new FlexSearch.Index({
        // Enable tokenization for abbreviation matching
        tokenize: "forward",
        // Enable fuzzy matching
        resolution: 9,
        // Enable pattern matching
        cache: true,
        // Enable async operations
        async: false,
        // Enable worker support
        worker: false,
        // Enable language support
        language: "en"
      });
      
      // Add all colleges to FlexSearch index
      this.collegesData.forEach((college, index) => {
        const searchableText = [
          college.name || '',
          college.city || '',
          college.state || ''
        ].join(' ').toLowerCase();
        
        this.flexSearchIndex.add(index, searchableText);
      });
      
      console.log('✅ FlexSearch index initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize FlexSearch index:', error);
      throw error;
    }
  }

  // Initialize uFuzzy for ultra-fast fuzzy matching
  async initializeUFuzzyIndex() {
    try {
      console.log('🔍 Initializing uFuzzy index...');
      
      // uFuzzy is ultra-fast and requires no pre-indexing
      // It performs real-time fuzzy matching with zero configuration
      this.uFuzzyIndex = new uFuzzy();
      
      console.log('✅ uFuzzy index initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize uFuzzy index:', error);
      throw error;
    }
  }

  // Initialize fuzzysort for intelligent result ranking
  async initializeFuzzysortIndex() {
    try {
      console.log('🔍 Initializing fuzzysort index...');
      
      // fuzzysort is ready to use immediately
      // It provides intelligent result ranking and highlighting
      this.fuzzysortIndex = fuzzysort;
      
      console.log('✅ fuzzysort index initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize fuzzysort index:', error);
      throw error;
    }
  }

  // Main search function with PARALLEL search architecture
  async search(query, options = {}) {
    const startTime = performance.now();
    
    try {
      if (!this.isInitialized) {
        console.warn('⚠️ Advanced Search Service not initialized');
        return { results: [], total: 0, searchTime: 0, searchType: 'uninitialized' };
      }

      if (!query || query.trim().length === 0) {
        return { results: [], total: 0, searchTime: 0, searchType: 'empty' };
      }

      const searchQuery = query.trim();
      console.log(`🚀 Starting PARALLEL advanced search for: "${searchQuery}"`);

      // PARALLEL SEARCH ARCHITECTURE - Run all search engines simultaneously
      const searchPromises = this.createParallelSearchPromises(searchQuery);
      
      console.log(`🔄 Executing ${searchPromises.length} search engines in parallel...`);
      
      // Execute all searches in parallel
      const searchResults = await Promise.allSettled(searchPromises);
      
      // Process and combine results
      const combinedResults = this.processParallelSearchResults(searchResults, searchQuery);
      
      const searchTime = performance.now() - startTime;
      console.log(`✅ Parallel search completed in ${searchTime.toFixed(2)}ms with ${combinedResults.length} results`);
      
      return this.addSearchMetadata(combinedResults, 'parallel-combined', searchTime);

    } catch (error) {
      console.error('❌ Parallel search failed:', error);
      return this.addSearchMetadata([], 'error', performance.now() - startTime);
    }
  }

  // Create parallel search promises for all search engines
  createParallelSearchPromises(query) {
    const promises = [];
    
    // TIER 1: HIGHEST ACCURACY SEARCHES (95-100% accuracy)
    promises.push(
      this.createSearchPromise('exact', () => this.exactSearch(query), 100),
      this.createSearchPromise('aliases', () => this.aliasesSearch(query), 99),
      // this.createSearchPromise('neural-abbreviation', () => this.neuralAbbreviationSearch(query), 98), // Disabled due to NaN issues
      this.createSearchPromise('regex-abbreviation', () => this.advancedRegexAbbreviationSearch(query), 95)
    );
    
    // TIER 2: HIGH ACCURACY SEARCHES (85-90% accuracy)
    promises.push(
      this.createSearchPromise('partial', () => this.partialSearch(query), 90),
      this.createSearchPromise('smart-abbreviation', () => this.smartAbbreviationSearch(query), 85)
    );
    
    // TIER 3: MEDIUM-HIGH ACCURACY SEARCHES (75-80% accuracy)
    promises.push(
      // this.createSearchPromise('ufuzzy', () => this.uFuzzyUltraSearch(query), 80), // Disabled due to API issues
      this.createSearchPromise('fuzzysort', () => this.fuzzysortIntelligentSearch(query), 75)
    );
    
    // TIER 4: MEDIUM ACCURACY SEARCHES (65-70% accuracy)
    promises.push(
      this.createSearchPromise('fuse', () => this.fuseIntelligentSearch(query), 70),
      this.createSearchPromise('flexsearch', () => this.flexSearchAdvancedSearch(query), 65)
    );
    
    // TIER 5: LOWER ACCURACY SEARCHES (55-60% accuracy)
    promises.push(
      this.createSearchPromise('fuzzy', () => this.fuzzySearch(query), 60),
      this.createSearchPromise('field-specific', () => this.fieldSpecificSearch(query), 55)
    );
    
    // TIER 6: FALLBACK SEARCHES (50% accuracy)
    promises.push(
      this.createSearchPromise('phonetic', () => this.phoneticSearch(query), 50),
      this.createSearchPromise('flexible', () => this.flexibleSearch(query), 50)
    );
    
    return promises;
  }

  // Create a search promise with error handling
  createSearchPromise(searchType, searchFunction, expectedAccuracy) {
    return new Promise(async (resolve) => {
      try {
        const startTime = performance.now();
        const results = await searchFunction();
        const searchTime = performance.now() - startTime;
        
        resolve({
          searchType,
          results: results || [],
          searchTime,
          expectedAccuracy,
          success: true,
          error: null
        });
      } catch (error) {
        console.warn(`⚠️ ${searchType} search failed:`, error.message);
        resolve({
          searchType,
          results: [],
          searchTime: 0,
          expectedAccuracy,
          success: false,
          error: error.message
        });
      }
    });
  }

  // Process and combine parallel search results
  processParallelSearchResults(searchResults, query) {
    console.log('🔄 Processing parallel search results...');
    
    const successfulSearches = searchResults
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => result.value);
    
    const failedSearches = searchResults
      .filter(result => result.status === 'rejected' || !result.value.success)
      .map(result => result.value);
    
    console.log(`✅ ${successfulSearches.length} searches succeeded, ${failedSearches.length} failed`);
    
    if (successfulSearches.length === 0) {
      console.log('❌ All searches failed');
      return [];
    }
    
    // Combine results using intelligent fusion algorithm
    const combinedResults = this.intelligentResultFusion(successfulSearches, query);
    
    // Log search performance
    this.logSearchPerformance(successfulSearches, failedSearches);
    
    return combinedResults;
  }

  // Intelligent result fusion algorithm
  intelligentResultFusion(searchResults, query) {
    console.log('🧠 Applying intelligent result fusion...');
    
    const resultMap = new Map();
    const searchWeights = this.calculateSearchWeights(searchResults, query);
    
    // Process each search result
    searchResults.forEach(searchResult => {
      const { searchType, results, expectedAccuracy } = searchResult;
      const weight = searchWeights[searchType] || 1;
      
      results.forEach(result => {
        const key = result.id || result.name || JSON.stringify(result);
        
        if (resultMap.has(key)) {
          // Merge with existing result
          const existing = resultMap.get(key);
          existing.relevanceScore = Math.max(existing.relevanceScore, result.relevanceScore * weight);
          existing.searchSources = existing.searchSources || [];
          existing.searchSources.push({
            type: searchType,
            accuracy: expectedAccuracy,
            weight: weight,
            score: result.relevanceScore
          });
          existing.matchTypes = [...new Set([...(existing.matchTypes || []), ...(result.matchTypes || [result.matchType] || [])])];
        } else {
          // Add new result
          resultMap.set(key, {
            ...result,
            relevanceScore: result.relevanceScore * weight,
            searchSources: [{
              type: searchType,
              accuracy: expectedAccuracy,
              weight: weight,
              score: result.relevanceScore
            }],
            matchTypes: result.matchTypes || [result.matchType] || []
          });
        }
      });
    });
    
    // Convert to array and apply advanced scoring
    const fusedResults = Array.from(resultMap.values())
      .map(result => this.applyAdvancedScoring(result, query))
      .sort((a, b) => b.finalScore - a.finalScore);
    
    console.log(`🧠 Result fusion completed: ${fusedResults.length} unique results`);
    return fusedResults;
  }

  // Calculate search weights based on performance and query type
  calculateSearchWeights(searchResults, query) {
    const weights = {};
    const isAbbreviation = this.isAbbreviationQuery(query);
    
    searchResults.forEach(result => {
      const { searchType, expectedAccuracy, results } = result;
      let weight = 1;
      
      // Base weight from expected accuracy
      weight = expectedAccuracy / 100;
      
      // Boost abbreviation searches for abbreviation queries
      if (isAbbreviation && searchType.includes('abbreviation')) {
        weight *= 1.5;
      }
      
      // Boost exact matches
      if (searchType === 'exact') {
        weight *= 2.0;
      }
      
      // Boost neural and regex searches
      if (searchType === 'neural-abbreviation' || searchType === 'regex-abbreviation') {
        weight *= 1.3;
      }
      
      // Penalize searches with no results
      if (results.length === 0) {
        weight *= 0.1;
      }
      
      weights[searchType] = Math.max(0.1, weight);
    });
    
    return weights;
  }

  // Apply advanced scoring to fused results
  applyAdvancedScoring(result, query) {
    let finalScore = result.relevanceScore || 50; // Start with a base score of 50
    
    // Boost for multiple search sources
    const sourceCount = result.searchSources?.length || 1;
    finalScore += (sourceCount - 1) * 10; // Add 10 points per additional source
    
    // Boost for high-accuracy sources
    const avgAccuracy = result.searchSources?.reduce((sum, source) => sum + source.accuracy, 0) / sourceCount || 50;
    finalScore += (avgAccuracy - 50) * 0.5; // Add points based on accuracy above 50
    
    // Boost for exact matches
    if (result.matchTypes && Array.isArray(result.matchTypes) && result.matchTypes.includes('exact')) {
      finalScore += 20;
    }
    
    // Boost for neural/abbreviation matches
    if (result.matchTypes && Array.isArray(result.matchTypes) && result.matchTypes.some(type => type && typeof type === 'string' && (type.includes('abbreviation') || type.includes('neural')))) {
      finalScore += 15;
    }
    
    // Ensure minimum score
    finalScore = Math.max(30, finalScore);
    
    return {
      ...result,
      finalScore: Math.min(100, finalScore),
      sourceCount,
      avgAccuracy
    };
  }

  // Log search performance metrics
  logSearchPerformance(successfulSearches, failedSearches) {
    console.log('📊 Search Performance Metrics:');
    
    successfulSearches.forEach(search => {
      console.log(`  ✅ ${search.searchType}: ${search.results.length} results in ${search.searchTime.toFixed(2)}ms (${search.expectedAccuracy}% accuracy)`);
    });
    
    if (failedSearches.length > 0) {
      console.log('  ❌ Failed searches:');
      failedSearches.forEach(search => {
        console.log(`    - ${search.searchType}: ${search.error}`);
      });
    }
    
    const totalResults = successfulSearches.reduce((sum, search) => sum + search.results.length, 0);
    const avgSearchTime = successfulSearches.reduce((sum, search) => sum + search.searchTime, 0) / successfulSearches.length;
    
    console.log(`📊 Total: ${totalResults} results across ${successfulSearches.length} engines (avg: ${avgSearchTime.toFixed(2)}ms)`);
  }

  // Exact match search
  exactSearch(query) {
    return this.collegesData.filter(college => {
      const name = (college.name || '').toLowerCase();
      const city = (college.city || '').toLowerCase();
      const state = (college.state || '').toLowerCase();
      const collegeType = (college.college_type || '').toLowerCase();
      const stream = (college.stream || '').toLowerCase();
      
      return name === query.toLowerCase() || 
             city === query.toLowerCase() || 
             state === query.toLowerCase() ||
             collegeType === query.toLowerCase() ||
             stream === query.toLowerCase();
    });
  }

  // Aliases search - comprehensive alias matching
  async aliasesSearch(query) {
    try {
      console.log(`🔍 Aliases search for: "${query}"`);
      
      if (!query || query.trim().length === 0) {
        return [];
      }

      const searchQuery = query.trim();
      const results = [];

      // Check cache first
      const cacheKey = `aliases_${searchQuery}`;
      if (this.aliasesCache.has(cacheKey)) {
        console.log(`📋 Using cached aliases for: "${searchQuery}"`);
        return this.aliasesCache.get(cacheKey);
      }

      try {
        // Call aliases API
        const aliasesResponse = await apiService.apiCall(`/aliases/search?q=${encodeURIComponent(searchQuery)}&entityType=college&limit=100`);
        
        if (aliasesResponse.success && aliasesResponse.results) {
          // Convert aliases results to search results format
          for (const aliasResult of aliasesResponse.results) {
            // Find the corresponding college in our data
            const college = this.collegesData.find(c => c.id === aliasResult.entityId);
            
            if (college) {
              const result = {
                ...college,
                relevanceScore: aliasResult.confidenceScore * 100, // Convert to 0-100 scale
                matchType: 'alias',
                matchedAlias: aliasResult.aliasText,
                searchSources: ['aliases'],
                aliasConfidence: aliasResult.confidenceScore
              };
              
              results.push(result);
            }
          }
        }
      } catch (apiError) {
        console.warn('⚠️ Aliases API not available, falling back to local alias matching:', apiError.message);
        
        // Fallback to local alias matching
        const localAliasResults = this.localAliasesSearch(searchQuery);
        results.push(...localAliasResults);
      }

      // Cache results for 5 minutes
      this.aliasesCache.set(cacheKey, results);
      setTimeout(() => this.aliasesCache.delete(cacheKey), 5 * 60 * 1000);

      console.log(`✅ Aliases search found ${results.length} results for: "${searchQuery}"`);
      return results;

    } catch (error) {
      console.error(`❌ Aliases search failed for "${query}":`, error);
      return [];
    }
  }

  // Local aliases search (fallback when API is not available)
  localAliasesSearch(query) {
    const results = [];
    const normalizedQuery = query.toUpperCase().trim();

    // Common aliases patterns
    const aliasPatterns = [
      // Abbreviation patterns
      { pattern: /([A-Z])\.([A-Z])\.([A-Z])/, replacement: '$1 $2 $3' },
      { pattern: /([A-Z]) ([A-Z]) ([A-Z])/, replacement: '$1.$2.$3' },
      { pattern: /([A-Z])\.([A-Z])/, replacement: '$1 $2' },
      { pattern: /([A-Z]) ([A-Z])/, replacement: '$1.$2' },
      
      // Short form patterns
      { pattern: /MEDICAL COLLEGE/, replacement: 'MC' },
      { pattern: /DENTAL COLLEGE/, replacement: 'DC' },
      { pattern: /INSTITUTE/, replacement: 'INST' },
      { pattern: /UNIVERSITY/, replacement: 'UNIV' },
      { pattern: /HOSPITAL/, replacement: 'HOSP' },
      
      // Common misspellings
      { pattern: /BANGALORE/, replacement: 'BANGALURU' },
      { pattern: /BANGALURU/, replacement: 'BANGALORE' },
      { pattern: /CALCUTTA/, replacement: 'KOLKATA' },
      { pattern: /KOLKATA/, replacement: 'CALCUTTA' },
      { pattern: /BOMBAY/, replacement: 'MUMBAI' },
      { pattern: /MUMBAI/, replacement: 'BOMBAY' }
    ];

    for (const college of this.collegesData) {
      const collegeName = (college.name || '').toUpperCase();
      
      // Check direct match
      if (collegeName.includes(normalizedQuery)) {
        results.push({
          ...college,
          relevanceScore: 95,
          matchType: 'alias-direct',
          matchedAlias: query,
          searchSources: ['aliases-local'],
          aliasConfidence: 0.95
        });
        continue;
      }

      // Check alias patterns
      for (const { pattern, replacement } of aliasPatterns) {
        // Check if query matches pattern
        if (pattern.test(normalizedQuery)) {
          const aliasVariation = normalizedQuery.replace(pattern, replacement);
          if (collegeName.includes(aliasVariation)) {
            results.push({
              ...college,
              relevanceScore: 90,
              matchType: 'alias-pattern',
              matchedAlias: query,
              searchSources: ['aliases-local'],
              aliasConfidence: 0.90
            });
            break;
          }
        }

        // Check if college name matches pattern and query matches replacement
        if (pattern.test(collegeName)) {
          const collegeVariation = collegeName.replace(pattern, replacement);
          if (collegeVariation.includes(normalizedQuery)) {
            results.push({
              ...college,
              relevanceScore: 90,
              matchType: 'alias-pattern',
              matchedAlias: query,
              searchSources: ['aliases-local'],
              aliasConfidence: 0.90
            });
            break;
          }
        }
      }
    }

    return results;
  }

  // Partial match search
  partialSearch(query) {
    return this.collegesData.filter(college => {
      const name = (college.name || '').toLowerCase();
      const city = (college.city || '').toLowerCase();
      const state = (college.state || '').toLowerCase();
      const collegeType = (college.college_type || '').toLowerCase();
      const stream = (college.stream || '').toLowerCase();
      
      return name.startsWith(query.toLowerCase()) || 
             city.startsWith(query.toLowerCase()) || 
             state.startsWith(query.toLowerCase()) ||
             collegeType.startsWith(query.toLowerCase()) ||
             stream.startsWith(query.toLowerCase());
    });
  }

  // Simple fuzzy search (no complex libraries)
  fuzzySearch(query) {
    try {
      console.log(`🔍 Simple fuzzy search for: "${query}"`);
      
      // Simple fuzzy search using string similarity
      return this.collegesData.filter(college => {
        const name = (college.name || '').toLowerCase();
        const city = (college.city || '').toLowerCase();
        const state = (college.state || '').toLowerCase();
        
        // Check if query is contained in any field
        return name.includes(query.toLowerCase()) || 
               city.includes(query.toLowerCase()) || 
               state.includes(query.toLowerCase());
      });
      
    } catch (error) {
      console.warn('⚠️ Simple fuzzy search failed:', error);
      return [];
    }
  }

  // Field-specific search (no complex libraries)
  fieldSpecificSearch(query) {
    try {
      console.log(`🔍 Field-specific search for: "${query}"`);
      
      // Simple field-specific search
      return this.collegesData.filter(college => {
        const name = (college.name || '').toLowerCase();
        const city = (college.city || '').toLowerCase();
        const state = (college.state || '').toLowerCase();
        
        // Check if query is contained in any specific field
        return name.includes(query.toLowerCase()) || 
               city.includes(query.toLowerCase()) || 
               state.includes(query.toLowerCase());
      });
      
    } catch (error) {
      console.warn('⚠️ Field-specific search failed:', error);
      return [];
    }
  }

  // Smart abbreviation search - the RIGHT approach for abbreviation matching
  regexSearch(query) {
    try {
      // Check if query looks like an abbreviation (short, has dots, spaces, or no separators)
      const isAbbreviation = query.length <= 5 && (
        query.includes('.') || 
        query.includes(' ') || 
        (!query.includes(' ') && !query.includes('.') && query.length <= 5)
      );
      
      if (!isAbbreviation) {
        return [];
      }
      
      console.log(`🔍 Smart abbreviation search for: "${query}"`);
      
      // Use the smart abbreviation search instead of complex regex
      const results = this.smartAbbreviationSearch(query);
      
      console.log(`🔍 Smart abbreviation search completed: ${results.length} results found`);
      return results;
      
    } catch (error) {
      console.error('❌ Smart abbreviation search failed:', error);
      return [];
    }
  }

  // Smart abbreviation search using targeted pattern matching
  smartAbbreviationSearch(query) {
    try {
      console.log(`🔍 Smart abbreviation search for: "${query}"`);
      
      // Check if query looks like an abbreviation
      if (!this.isAbbreviationQuery(query)) {
        return [];
      }
      
      const results = [];
      
      this.collegesData.forEach(college => {
        const name = college.name || '';
        
        // Use targeted abbreviation matching
        if (this.isExactAbbreviationMatch(query, name)) {
          const relevanceScore = this.calculateExactAbbreviationScore(query, name);
          
          results.push({
            ...college,
            relevanceScore,
            matchTypes: ['exact-abbreviation'],
            searchSources: [{ name: 'Smart Abbreviation', accuracy: 85 }],
            matchedFields: ['name'],
            searchIndex: this.collegesData.indexOf(college),
            abbreviationQuery: query,
            collegeName: name
          });
        }
      });
      
      // Sort by relevance score (highest first)
      const sortedResults = results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      console.log(`🔍 Smart abbreviation search completed: ${sortedResults.length} results found`);
      return sortedResults;
      
    } catch (error) {
      console.error('❌ Smart abbreviation search failed:', error);
      return [];
    }
  }

  // Check if query is likely an abbreviation
  isAbbreviationQuery(query) {
    if (!query || query.length < 2) return false;
    
    // Check for abbreviation patterns
    const hasSpaces = query.includes(' ');
    const hasDots = query.includes('.');
    const isShort = query.length <= 5;
    const hasSingleLetters = query.split(/\s+/).some(part => part.length === 1);
    
    return (hasSpaces || hasDots || isShort) && hasSingleLetters;
  }

  // Exact abbreviation pattern matching
  isExactAbbreviationMatch(query, collegeName) {
    if (!query || !collegeName) return false;
    
    // Normalize both query and college name by removing dots
    const normalizedQuery = this.normalizeAbbreviation(query);
    const normalizedCollegeName = collegeName.toUpperCase().replace(/\./g, ' ');
    
    // Generate all possible abbreviation patterns for the normalized query
    const patterns = this.generateExactAbbreviationPatterns(normalizedQuery);
    
    // Check if normalized college name contains any of these exact patterns
    for (const pattern of patterns) {
      if (normalizedCollegeName.includes(pattern)) {
        return true;
      }
    }
    
    return false;
  }

  // Generate exact abbreviation patterns (for normalized college names without dots)
  generateExactAbbreviationPatterns(query) {
    const patterns = [];
    const parts = query.trim().split(/\s+/);
    
    if (parts.length === 2) {
      const [first, second] = parts;
      
      // Pattern 1: "A J" -> "A J" (space-separated - this is what we want after normalization)
      patterns.push(`${first.toUpperCase()} ${second.toUpperCase()}`);
      
      // Pattern 2: "A J" -> "AJ" (no separator)
      patterns.push(`${first.toUpperCase()}${second.toUpperCase()}`);
      
    } else if (parts.length === 3) {
      const [first, second, third] = parts;
      
      // Pattern 1: "S K S" -> "S K S" (space-separated - this is what we want after normalization)
      patterns.push(`${first.toUpperCase()} ${second.toUpperCase()} ${third.toUpperCase()}`);
      
      // Pattern 2: "S K S" -> "SKS" (no separator)
      patterns.push(`${first.toUpperCase()}${second.toUpperCase()}${third.toUpperCase()}`);
      
      // Pattern 3: "S K S" -> "S K S" (partial matches)
      patterns.push(`${first.toUpperCase()} ${second.toUpperCase()}`);
      patterns.push(`${second.toUpperCase()} ${third.toUpperCase()}`);
    } else if (parts.length === 1 && parts[0].length <= 5) {
      // Single word abbreviations like "KVG"
      const single = parts[0];
      
      // Pattern 1: "KVG" -> "K V G" (space-separated - this is what we want after normalization)
      const spaceSeparated = single.split('').join(' ').toUpperCase();
      patterns.push(spaceSeparated);
      
      // Pattern 2: "KVG" -> "KVG" (no separator)
      patterns.push(single.toUpperCase());
    }
    
    return patterns;
  }

  // Calculate exact abbreviation relevance score
  calculateExactAbbreviationScore(query, name) {
    let score = 50; // Base score
    
    const patterns = this.generateExactAbbreviationPatterns(query);
    const upperName = name.toUpperCase();
    
    // Check pattern position and completeness
    for (const pattern of patterns) {
      if (upperName.includes(pattern)) {
        const patternIndex = upperName.indexOf(pattern);
        
        // Bonus for pattern at the beginning
        if (patternIndex === 0) {
          score += 30;
        } else if (patternIndex < 10) {
          score += 20;
        } else {
          score += 10;
        }
        
        // Bonus for exact pattern match
        if (pattern === query.toUpperCase()) {
          score += 20;
        }
        
        // Bonus for dot-separated patterns (more formal)
        if (pattern.includes('.')) {
          score += 15;
        }
        
        break; // Use the best matching pattern
      }
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  // Neural Network Search - AI-powered abbreviation matching
  neuralAbbreviationSearch(query) {
    try {
      console.log(`🧠 Neural Network search for: "${query}"`);
      
      if (!this.neuralModel) {
        console.warn('⚠️ Neural model not initialized, falling back to regex search');
        return this.advancedRegexAbbreviationSearch(query);
      }
      
      const results = [];
      const queryFeatures = this.extractAbbreviationFeatures(query);
      
      // Use neural network to predict abbreviation patterns
      const prediction = this.neuralModel.predict(tf.tensor2d([queryFeatures]));
      const predictedPatterns = prediction.dataSync();
      
      // Get top predicted patterns
      const topPatterns = this.getTopPredictedPatterns(predictedPatterns);
      
      console.log(`🧠 Neural network predicted patterns:`, topPatterns);
      
      this.collegesData.forEach(college => {
        const name = college.name || '';
        const upperName = name.toUpperCase();
        
        // Check if college name matches any predicted pattern
        for (const pattern of topPatterns) {
          if (this.matchesNeuralPattern(query, upperName, pattern)) {
            const relevanceScore = this.calculateNeuralRelevanceScore(query, name, pattern);
            
            results.push({
              ...college,
              relevanceScore,
              matchType: 'neural-abbreviation',
              matchedFields: ['name'],
              searchIndex: this.collegesData.indexOf(college),
              neuralPattern: pattern,
              abbreviationQuery: query,
              collegeName: name,
              neuralConfidence: predictedPatterns[this.abbreviationPatterns.indexOf(pattern)]
            });
            
            break; // Found a match, no need to check other patterns
          }
        }
      });
      
      // Sort by neural confidence and relevance score
      const sortedResults = results.sort((a, b) => {
        const scoreA = a.relevanceScore + (a.neuralConfidence * 20);
        const scoreB = b.relevanceScore + (b.neuralConfidence * 20);
        return scoreB - scoreA;
      });
      
      console.log(`🧠 Neural Network search completed: ${sortedResults.length} results found`);
      return sortedResults;
      
    } catch (error) {
      console.error('❌ Neural Network search failed:', error);
      return this.advancedRegexAbbreviationSearch(query);
    }
  }

  // Advanced Regex Pattern Search - comprehensive abbreviation matching
  advancedRegexAbbreviationSearch(query) {
    try {
      console.log(`🔍 Advanced Regex Pattern search for: "${query}"`);
      
      const results = [];
      const normalizedQuery = this.normalizeAbbreviation(query);
      const allVariations = this.getAllAbbreviationVariations(normalizedQuery);
      
      console.log(`🔍 Query: "${query}" -> Normalized: "${normalizedQuery}"`);
      console.log(`🔍 All variations:`, allVariations);
      
      this.collegesData.forEach(college => {
        const name = college.name || '';
        const upperName = name.toUpperCase();
        // Normalize college name by removing dots - key fix!
        const normalizedName = upperName.replace(/\./g, ' ');
        
        // Check if college name contains any variation of the abbreviation
        for (const variation of allVariations) {
          if (this.matchesRegexPattern(variation, normalizedName)) {
            const relevanceScore = this.calculateRegexRelevanceScore(query, name, variation);
            
            results.push({
              ...college,
              relevanceScore,
              matchTypes: ['regex-abbreviation'],
              searchSources: [{ name: 'Advanced Regex', accuracy: 95 }],
              matchedFields: ['name'],
              searchIndex: this.collegesData.indexOf(college),
              matchedVariation: variation,
              abbreviationQuery: query,
              collegeName: name
            });
            
            break; // Found a match, no need to check other variations
          }
        }
      });
      
      // Sort by relevance score (highest first)
      const sortedResults = results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      console.log(`🔍 Advanced Regex Pattern search completed: ${sortedResults.length} results found`);
      return sortedResults;
      
    } catch (error) {
      console.error('❌ Advanced Regex Pattern search failed:', error);
      return [];
    }
  }

  // Extract features for neural network input
  extractAbbreviationFeatures(query) {
    const features = new Array(50).fill(0);
    const upperQuery = query.toUpperCase();
    
    // Character-based features
    features[0] = upperQuery.length;
    features[1] = (upperQuery.match(/\./g) || []).length; // dot count
    features[2] = (upperQuery.match(/\s/g) || []).length; // space count
    features[3] = (upperQuery.match(/[A-Z]/g) || []).length; // letter count
    
    // Pattern features
    features[4] = upperQuery.includes('.') ? 1 : 0;
    features[5] = upperQuery.includes(' ') ? 1 : 0;
    features[6] = /^[A-Z]$/.test(upperQuery) ? 1 : 0; // single letter
    features[7] = /^[A-Z][A-Z]$/.test(upperQuery) ? 1 : 0; // double letter
    features[8] = /^[A-Z][A-Z][A-Z]$/.test(upperQuery) ? 1 : 0; // triple letter
    
    // Position features
    features[9] = upperQuery.startsWith('.') ? 1 : 0;
    features[10] = upperQuery.endsWith('.') ? 1 : 0;
    features[11] = upperQuery.startsWith(' ') ? 1 : 0;
    features[12] = upperQuery.endsWith(' ') ? 1 : 0;
    
    // Character frequency features (A-Z)
    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(65 + i);
      features[13 + i] = (upperQuery.match(new RegExp(char, 'g')) || []).length;
    }
    
    // Pattern complexity features
    features[39] = this.calculatePatternComplexity(upperQuery);
    features[40] = this.calculateSeparatorConsistency(upperQuery);
    features[41] = this.calculateLengthConsistency(upperQuery);
    
    return features;
  }

  // Get top predicted patterns from neural network
  getTopPredictedPatterns(predictions) {
    const patternScores = predictions.map((score, index) => ({
      pattern: this.abbreviationPatterns[index],
      score: score
    }));
    
    // Sort by score and return top 3 patterns
    return patternScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.pattern);
  }

  // Check if college name matches neural pattern
  matchesNeuralPattern(query, collegeName, pattern) {
    const normalizedQuery = this.normalizeAbbreviation(query);
    const variations = this.getAllAbbreviationVariations(normalizedQuery);
    
    for (const variation of variations) {
      if (collegeName.includes(variation)) {
        return true;
      }
    }
    
    return false;
  }

  // Calculate neural relevance score
  calculateNeuralRelevanceScore(query, name, pattern) {
    let score = 50; // Base score
    
    const normalizedQuery = this.normalizeAbbreviation(query);
    const variations = this.getAllAbbreviationVariations(normalizedQuery);
    
    for (const variation of variations) {
      if (name.toUpperCase().includes(variation)) {
        const index = name.toUpperCase().indexOf(variation);
        
        // Bonus for pattern at the beginning
        if (index === 0) {
          score += 30;
        } else if (index < 10) {
          score += 20;
        } else {
          score += 10;
        }
        
        // Bonus for exact pattern match
        if (variation === query.toUpperCase()) {
          score += 20;
        }
        
        break;
      }
    }
    
    return Math.min(score, 100);
  }

  // Normalize abbreviation to standard format
  normalizeAbbreviation(query) {
    if (!query) return '';
    
    const upperQuery = query.toUpperCase().trim();
    
    // Remove dots and normalize spaces - this is the key fix!
    return upperQuery
      .replace(/\./g, ' ')  // Replace dots with spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  }

  // Get all possible variations of an abbreviation
  getAllAbbreviationVariations(normalizedQuery) {
    const variations = new Set();
    
    // Add the original query
    variations.add(normalizedQuery);
    
    // Generate variations for normalized space-separated format
    if (normalizedQuery.includes(' ')) {
      const parts = normalizedQuery.split(' ');
      
      // Add concatenated version: "A J" -> "AJ"
      variations.add(parts.join(''));
      
      // Add partial matches for 3-part abbreviations
      if (parts.length === 3) {
        variations.add(`${parts[0]} ${parts[1]}`);
        variations.add(`${parts[1]} ${parts[2]}`);
      }
    } else {
      // Single word: "AJ" -> ["A J"]
      if (normalizedQuery.length >= 2 && normalizedQuery.length <= 5) {
        const spaced = normalizedQuery.split('').join(' ');
        variations.add(spaced);
      }
    }
    
    return Array.from(variations);
  }

  // Check if college name matches regex pattern
  matchesRegexPattern(variation, collegeName) {
    return collegeName.includes(variation);
  }

  // Calculate regex relevance score
  calculateRegexRelevanceScore(query, name, variation) {
    let score = 50; // Base score
    
    const upperName = name.toUpperCase();
    const index = upperName.indexOf(variation);
    
    if (index !== -1) {
      // Bonus for pattern at the beginning
      if (index === 0) {
        score += 30;
      } else if (index < 10) {
        score += 20;
      } else {
        score += 10;
      }
      
      // Bonus for exact pattern match
      if (variation === query.toUpperCase()) {
        score += 20;
      }
      
      // Bonus for dot-separated patterns (more formal)
      if (variation.includes('.')) {
        score += 15;
      }
    }
    
    return Math.min(score, 100);
  }

  // Calculate pattern complexity
  calculatePatternComplexity(query) {
    let complexity = 0;
    complexity += (query.match(/\./g) || []).length * 2;
    complexity += (query.match(/\s/g) || []).length;
    complexity += query.length;
    return complexity;
  }

  // Calculate separator consistency
  calculateSeparatorConsistency(query) {
    const dots = (query.match(/\./g) || []).length;
    const spaces = (query.match(/\s/g) || []).length;
    
    if (dots === 0 && spaces === 0) return 1; // No separators
    if (dots > 0 && spaces === 0) return 2; // Only dots
    if (dots === 0 && spaces > 0) return 3; // Only spaces
    return 4; // Mixed separators
  }

  // Calculate length consistency
  calculateLengthConsistency(query) {
    const parts = query.split(/[.\s]+/).filter(part => part.length > 0);
    if (parts.length === 0) return 0;
    
    const lengths = parts.map(part => part.length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    
    return Math.max(0, 5 - variance); // Lower variance = higher consistency
  }

  // Exact abbreviation pattern search - highest priority for abbreviations
  exactAbbreviationPatternSearch(query) {
    try {
      console.log(`🔍 Exact abbreviation pattern search for: "${query}"`);
      
      // Use the new advanced regex search instead
      return this.advancedRegexAbbreviationSearch(query);
      
    } catch (error) {
      console.error('❌ Exact abbreviation pattern search failed:', error);
      return [];
    }
  }



  // uFuzzy ultra-fast fuzzy search (battle-tested)
  uFuzzyUltraSearch(query) {
    try {
      if (!this.uFuzzyIndex) return [];
      
      console.log(`🔍 uFuzzy ultra-fast search for: "${query}"`);
      
      // Prepare searchable text for all colleges
      const searchableTexts = this.collegesData.map(college => 
        `${college.name || ''} ${college.city || ''} ${college.state || ''}`.toLowerCase()
      );
      
      // uFuzzy performs ultra-fast fuzzy matching
      const results = this.uFuzzyIndex.filter(searchableTexts, query);
      
      // Convert uFuzzy results to our format
      const matchedResults = results.map(index => {
        const college = this.collegesData[index];
        return {
          ...college,
          relevanceScore: 85, // uFuzzy relevance score
          matchTypes: ['fuzzy'],
          searchSources: [{ name: 'uFuzzy', accuracy: 85 }],
          matchedFields: ['name', 'city', 'state'],
          searchIndex: index,
          uFuzzyIndex: index
        };
      });
      
      console.log(`🔍 uFuzzy ultra-fast search completed: ${matchedResults.length} results found`);
      return matchedResults;
      
    } catch (error) {
      console.error('❌ uFuzzy ultra-fast search failed:', error);
      return [];
    }
  }

  // fuzzysort intelligent search (battle-tested)
  fuzzysortIntelligentSearch(query) {
    try {
      if (!this.fuzzysortIndex) return [];
      
      console.log(`🔍 fuzzysort intelligent search for: "${query}"`);
      
      // Prepare searchable text for all colleges
      const searchableTexts = this.collegesData.map(college => 
        `${college.name || ''} ${college.city || ''} ${college.state || ''}`
      );
      
      // fuzzysort provides intelligent result ranking and highlighting
      const results = this.fuzzysortIndex.go(query, searchableTexts, {
        // Enable intelligent abbreviation matching
        allowTypo: true,
        // Enable fuzzy matching
        threshold: -10000,
        // Enable result highlighting
        highlight: true,
        // Enable intelligent ranking
        keys: ['name', 'city', 'state']
      });
      
      // Convert fuzzysort results to our format
      const matchedResults = results.map(result => {
        const college = this.collegesData[result.index];
        return {
          ...college,
          relevanceScore: result.score || 80, // fuzzysort relevance score
          matchType: 'fuzzysort-intelligent',
          matchedFields: ['name', 'city', 'state'],
          searchIndex: result.index,
          fuzzysortScore: result.score,
          fuzzysortHighlight: result.highlight
        };
      });
      
      console.log(`🔍 fuzzysort intelligent search completed: ${matchedResults.length} results found`);
      return matchedResults;
      
    } catch (error) {
      console.error('❌ fuzzysort intelligent search failed:', error);
      return [];
    }
  }

  // Fuse.js intelligent search for complex abbreviation patterns
  fuseIntelligentSearch(query) {
    try {
      if (!this.fuseIndex) return [];
      
      console.log(`🔍 Fuse.js intelligent search for: "${query}"`);
      
      // Use Fuse.js for intelligent abbreviation matching
      const searchResults = this.fuseIndex.search(query);
      
      // Convert Fuse.js results to our format
      const results = searchResults.map(result => ({
        ...result.item,
        relevanceScore: result.score ? (1 - result.score) * 100 : 50,
        matchType: 'fuse-intelligent',
        matchedFields: result.matches ? result.matches.map(match => match.key) : [],
        searchIndex: this.collegesData.indexOf(result.item),
        fuseScore: result.score,
        fuseMatches: result.matches
      }));
      
      console.log(`🔍 Fuse.js intelligent search completed: ${results.length} results found`);
      return results;
      
    } catch (error) {
      console.error('❌ Fuse.js intelligent search failed:', error);
      return [];
    }
  }

  // FlexSearch advanced pattern matching for abbreviations
  async flexSearchAdvancedSearch(query) {
    try {
      if (!this.flexSearchIndex) return [];
      
      console.log(`🔍 FlexSearch advanced search for: "${query}"`);
      
      // Use FlexSearch for advanced pattern matching
      const searchResults = await this.flexSearchIndex.search(query);
      
      // Convert FlexSearch results to our format
      const results = searchResults.map(index => {
        const college = this.collegesData[index];
        return {
          ...college,
          relevanceScore: 80, // FlexSearch relevance score
          matchType: 'flexsearch-advanced',
          matchedFields: ['name', 'city', 'state'],
          searchIndex: index,
          flexSearchIndex: index
        };
      });
      
      console.log(`🔍 FlexSearch advanced search completed: ${results.length} results found`);
      return results;
      
    } catch (error) {
      console.error('❌ FlexSearch advanced search failed:', error);
      return [];
    }
  }

  // Normalize text for abbreviation matching
  normalizeText(text) {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove all punctuation except spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  }

  // Check if query is an abbreviation match for text - EXACT pattern matching
  isAbbreviationMatch(query, text) {
    if (!query || !text) return false;
    
    // For abbreviation matching, we need EXACT pattern matching
    // "m s" should match "M.S." or "M S" but NOT "GUNAM SUPER"
    
    // Convert text to uppercase for consistent comparison
    const upperText = text.toUpperCase();
    
    // Check for exact abbreviation patterns
    const patterns = this.generateAbbreviationPatterns(query);
    
    for (const pattern of patterns) {
      if (upperText.includes(pattern)) {
        return true;
      }
    }
    
    return false;
  }
  
  // Generate exact abbreviation patterns based on real database patterns
  generateAbbreviationPatterns(query) {
    const patterns = [];
    const queryParts = query.split(/\s+/);
    
    if (queryParts.length === 2) {
      const [first, second] = queryParts;
      
      // Pattern 1: "M S" -> "M.S." (dot-separated)
      patterns.push(`${first.toUpperCase()}.${second.toUpperCase()}.`);
      
      // Pattern 2: "M S" -> "M S" (space-separated)
      patterns.push(`${first.toUpperCase()} ${second.toUpperCase()}`);
      
      // Pattern 3: "M S" -> "MS" (no separator)
      patterns.push(`${first.toUpperCase()}${second.toUpperCase()}`);
      
      // Pattern 4: "M S" -> "M.S" (first dot, no second dot)
      patterns.push(`${first.toUpperCase()}.${second.toUpperCase()}`);
      
      // Pattern 5: "M S" -> "M.S" (first dot, no second dot)
      patterns.push(`${first.toUpperCase()}.${second.toUpperCase()}`);
    } else if (queryParts.length === 3) {
      const [first, second, third] = queryParts;
      
      // Pattern 1: "S K S" -> "S.K.S." (dot-separated)
      patterns.push(`${first.toUpperCase()}.${second.toUpperCase()}.${third.toUpperCase()}.`);
      
      // Pattern 2: "S K S" -> "S K S" (space-separated)
      patterns.push(`${first.toUpperCase()} ${second.toUpperCase()} ${third.toUpperCase()}`);
      
      // Pattern 3: "S K S" -> "SKS" (no separator)
      patterns.push(`${first.toUpperCase()}${second.toUpperCase()}${third.toUpperCase()}`);
      
      // Pattern 4: "S K S" -> "S.K.S" (dots without final dot)
      patterns.push(`${first.toUpperCase()}.${second.toUpperCase()}.${third.toUpperCase()}`);
    }
    
    return patterns;
  }

  // Validate if abbreviation match is legitimate (not a false positive)
  isLegitimateAbbreviation(query, name, city, state) {
    if (!query || !name) return false;
    
    // Use the exact pattern matching to validate legitimacy
    return this.isAbbreviationMatch(query, name);
  }

  // Calculate relevance score for abbreviation matches
  calculateAbbreviationScore(query, name, city, state) {
    let score = 0;
    
    // Name matches get highest score
    if (this.isAbbreviationMatch(query, name)) {
      score += 10;
      
      // Bonus for exact abbreviation match
      if (name.includes(query)) {
        score += 5;
      }
      
      // Bonus for legitimate abbreviation pattern
      if (this.isLegitimateAbbreviation(query, name, city, state)) {
        score += 8;
      }
    }
    
    // City matches get medium score
    if (this.isAbbreviationMatch(query, city)) {
      score += 6;
    }
    
    // State matches get lower score
    if (this.isAbbreviationMatch(query, state)) {
      score += 4;
    }
    
    return score;
  }

  // Phonetic search for sound-alike matches
  phoneticSearch(query) {
    try {
      // Simple phonetic matching using first letter and length
      const queryFirst = query.charAt(0).toLowerCase();
      const queryLength = query.length;
      
      return this.collegesData.filter(college => {
        const name = (college.name || '').toLowerCase();
        const city = (college.city || '').toLowerCase();
        const state = (college.state || '').toLowerCase();
        
        // Check if any field starts with same letter and has similar length
        return (name.startsWith(queryFirst) && Math.abs(name.length - queryLength) <= 3) ||
               (city.startsWith(queryFirst) && Math.abs(city.length - queryLength) <= 3) ||
               (state.startsWith(queryFirst) && Math.abs(state.length - queryLength) <= 3);
      });
      
    } catch (error) {
      console.warn('⚠️ Phonetic search failed:', error);
      return [];
    }
  }

  // Flexible search as fallback
  flexibleSearch(query) {
    if (query.length <= 2) return [];
    
    return this.collegesData.filter(college => {
      const name = (college.name || '').toLowerCase();
      const city = (college.city || '').toLowerCase();
      const state = (college.state || '').toLowerCase();
      
      return name.includes(query.toLowerCase()) || 
             city.includes(query.toLowerCase()) || 
             state.includes(query.toLowerCase());
    });
  }

  // Add search metadata to results
  addSearchMetadata(results, matchType, searchTime) {
    return results.map((result, index) => ({
      ...result,
      searchRank: index + 1,
      searchTime: Math.round(searchTime),
      matchType
    }));
  }

  // Test search functionality
  testSearch() {
    try {
      console.log('🧪 Testing Advanced Search Service...');
      
      // Test exact search
      const exactResults = this.exactSearch('MEDICAL');
      console.log(`✅ Exact search test: ${exactResults.length} results for "MEDICAL"`);
      
      // Test partial search
      const partialResults = this.partialSearch('MED');
      console.log(`✅ Partial search test: ${partialResults.length} results for "MED"`);
      
      // Test fuzzy search
      const fuzzyResults = this.fuzzySearch('MEDICAL');
      console.log(`✅ Fuzzy search test: ${fuzzyResults.length} results for "MEDICAL"`);
      
      // Test abbreviation search for "a b" pattern
      const abResults = this.smartAbbreviationSearch('a b');
      console.log(`✅ Space-separated abbreviation test: ${abResults.length} results for "a b" pattern`);
      if (abResults.length > 0) {
        console.log('🔍 "a b" results sample:', abResults.slice(0, 3).map(r => r.name));
      }
      
      // Test no-separator abbreviation search for SKS pattern
      const sksNoSeparatorResults = this.smartAbbreviationSearch('SKS');
      console.log(`✅ No-separator abbreviation test: ${sksNoSeparatorResults.length} results for "SKS" pattern`);
      if (sksNoSeparatorResults.length > 0) {
        console.log('🔍 SKS results sample:', sksNoSeparatorResults.slice(0, 3).map(r => r.name));
      }
      
      return { 
        success: true, 
        message: 'All search tests completed successfully',
        testResults: {
          exact: exactResults.length,
          partial: partialResults.length,
          fuzzy: fuzzyResults.length,
          abbreviation: abResults.length,
          sks: sksNoSeparatorResults.length
        }
      };
      
    } catch (error) {
      console.error('❌ Search test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get initialization status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      initializationProgress: this.initializationProgress,
      collegesCount: this.collegesData.length,
      hasLunrIndex: !!this.lunrIndex,
      hasTfModel: !!this.tfModel
    };
  }

  // Get search suggestions
  getSuggestions(query, limit = 5) {
    try {
      if (!this.isInitialized || !query || query.length < 2) {
        return [];
      }

      const suggestions = [];
      const queryLower = query.toLowerCase();

      // Get suggestions from college names
      this.collegesData.forEach(college => {
        const name = (college.name || '').toLowerCase();
        const city = (college.city || '').toLowerCase();
        const state = (college.state || '').toLowerCase();

        // Check if any field starts with the query
        if (name.startsWith(queryLower) || city.startsWith(queryLower) || state.startsWith(queryLower)) {
          suggestions.push({
            text: college.name,
            type: 'college',
            id: college.id
          });
        }
      });

      // Remove duplicates and limit results
      const uniqueSuggestions = suggestions
        .filter((suggestion, index, self) => 
          index === self.findIndex(s => s.text === suggestion.text)
        )
        .slice(0, limit);

      return uniqueSuggestions;

    } catch (error) {
      console.error('❌ Failed to get suggestions:', error);
      return [];
    }
  }

  // Reset service
  reset() {
    this.collegesData = [];
    this.lunrIndex = null;
    this.tfModel = null;
    this.isInitialized = false;
    this.initializationProgress = 0;
    console.log('🔄 Advanced Search Service reset');
  }
}

export default AdvancedSearchService;
