const natural = require('natural');
const { distance } = require('fastest-levenshtein');
const logger = require('./logger');

class AdvancedSearchEngine {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.tfidf = new natural.TfIdf();
    
    // Initialize search weights
    this.weights = {
      exactMatch: 100,
      fuzzyMatch: 80,
      semanticMatch: 70,
      locationMatch: 60,
      wildcardMatch: 50,
      regexMatch: 40
    };
  }

  /**
   * Main search function that combines all search methods
   */
  async search(query, data, options = {}) {
    const {
      searchType = 'all', // all, fuzzy, semantic, location, wildcard, regex
      maxResults = 50,
      threshold = 0.3,
      location = null,
      filters = {},
      includeVector = false
    } = options;

    try {
      let results = [];

      // Preprocess query
      const processedQuery = this.preprocessQuery(query);
      
      // Apply different search methods based on searchType
      if (searchType === 'all' || searchType === 'fuzzy') {
        const fuzzyResults = this.fuzzySearch(processedQuery, data, threshold);
        results.push(...fuzzyResults);
      }

      if (searchType === 'all' || searchType === 'semantic') {
        const semanticResults = await this.semanticSearch(processedQuery, data);
        results.push(...semanticResults);
      }

      if (searchType === 'all' || searchType === 'location') {
        const locationResults = this.locationAwareSearch(processedQuery, data, location);
        results.push(...locationResults);
      }

      if (searchType === 'all' || searchType === 'wildcard') {
        const wildcardResults = this.wildcardSearch(processedQuery, data);
        results.push(...wildcardResults);
      }

      if (searchType === 'all' || searchType === 'regex') {
        const regexResults = this.regexSearch(processedQuery, data);
        results.push(...regexResults);
      }

      // Merge and deduplicate results
      results = this.mergeResults(results);
      
      // Apply filters
      results = this.applyFilters(results, filters);
      
      // Sort by relevance score
      results.sort((a, b) => b.score - a.score);
      
      // Limit results
      results = results.slice(0, maxResults);

      // Add vector embeddings if requested
      if (includeVector) {
        results = await this.addVectorEmbeddings(results, processedQuery);
      }

      return {
        success: true,
        results,
        total: results.length,
        query: processedQuery,
        searchType,
        metadata: {
          searchMethods: this.getSearchMethodsUsed(searchType),
          processingTime: Date.now(),
          threshold,
          filters
        }
      };

    } catch (error) {
      logger.error('Advanced search error:', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  /**
   * Preprocess query for better search results
   */
  preprocessQuery(query) {
    if (!query || typeof query !== 'string') return '';

    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .trim();
  }

  /**
   * Fuzzy search using Levenshtein distance and phonetic matching
   */
  fuzzySearch(query, data, threshold = 0.3) {
    const results = [];
    const queryTokens = this.tokenizer.tokenize(query);
    
    data.forEach((item, index) => {
      let maxScore = 0;
      let matchedFields = [];

      // Search across multiple fields
      const searchableFields = this.getSearchableFields(item);
      
      searchableFields.forEach(field => {
        const fieldValue = String(field.value || '');
        const fieldTokens = this.tokenizer.tokenize(fieldValue);
        
        let fieldScore = 0;
        
        // Token-based fuzzy matching
        queryTokens.forEach(queryToken => {
          fieldTokens.forEach(fieldToken => {
            // Levenshtein distance
            const distance = this.calculateDistance(queryToken, fieldToken);
            const maxLength = Math.max(queryToken.length, fieldToken.length);
            const similarity = 1 - (distance / maxLength);
            
            if (similarity >= threshold) {
              fieldScore = Math.max(fieldScore, similarity);
            }
          });
        });

        // Phonetic matching for names
        if (field.type === 'name') {
          const phoneticScore = this.phoneticMatch(query, fieldValue);
          fieldScore = Math.max(fieldScore, phoneticScore);
        }

        if (fieldScore > 0) {
          maxScore = Math.max(maxScore, fieldScore);
          matchedFields.push({
            field: field.name,
            score: fieldScore,
            value: fieldValue
          });
        }
      });

      if (maxScore > 0) {
        results.push({
          item,
          index,
          score: maxScore * this.weights.fuzzyMatch,
          matchedFields,
          searchMethod: 'fuzzy',
          highlights: this.generateHighlights(query, matchedFields)
        });
      }
    });

    return results;
  }

  /**
   * Semantic search using TF-IDF and word embeddings
   */
  async semanticSearch(query, data) {
    const results = [];
    const queryTokens = this.tokenizer.tokenize(query);
    
    // Build TF-IDF corpus
    this.tfidf.resetDocument();
    data.forEach((item, index) => {
      const text = this.extractSearchableText(item);
      this.tfidf.addDocument(text);
    });

    // Calculate query TF-IDF
    this.tfidf.addDocument(query);
    const queryTfidf = this.tfidf.listTerms(0);

    data.forEach((item, index) => {
      const itemTfidf = this.tfidf.listTerms(index + 1);
      const similarity = this.calculateCosineSimilarity(queryTfidf, itemTfidf);
      
      if (similarity > 0.1) { // Threshold for semantic relevance
        results.push({
          item,
          index,
          score: similarity * this.weights.semanticMatch,
          searchMethod: 'semantic',
          similarity,
          highlights: this.generateSemanticHighlights(query, item)
        });
      }
    });

    return results;
  }

  /**
   * Location-aware search with geographic proximity
   */
  locationAwareSearch(query, data, userLocation = null) {
    const results = [];
    const queryTokens = this.tokenizer.tokenize(query);
    
    data.forEach((item, index) => {
      let score = 0;
      let locationBonus = 0;

      // Check if item has location data
      if (item.latitude && item.longitude && userLocation) {
        const distance = this.calculateGeographicDistance(
          userLocation.lat, userLocation.lng,
          item.latitude, item.longitude
        );
        
        // Location bonus based on proximity (closer = higher bonus)
        if (distance < 10) locationBonus = 0.3; // Within 10km
        else if (distance < 50) locationBonus = 0.2; // Within 50km
        else if (distance < 100) locationBonus = 0.1; // Within 100km
      }

      // Text matching with location context
      const searchableFields = this.getSearchableFields(item);
      searchableFields.forEach(field => {
        if (field.type === 'location') {
          const locationScore = this.locationTextMatch(queryTokens, field.value);
          score = Math.max(score, locationScore);
        } else {
          const textScore = this.textMatch(queryTokens, field.value);
          score = Math.max(score, textScore);
        }
      });

      if (score > 0) {
        results.push({
          item,
          index,
          score: (score + locationBonus) * this.weights.locationMatch,
          searchMethod: 'location',
          locationBonus,
          highlights: this.generateLocationHighlights(query, item)
        });
      }
    });

    return results;
  }

  /**
   * Wildcard search with pattern matching
   */
  wildcardSearch(query, data) {
    const results = [];
    
    // Convert wildcard pattern to regex
    const wildcardPattern = query
      .replace(/\*/g, '.*') // * becomes .*
      .replace(/\?/g, '.')  // ? becomes .
      .replace(/\./g, '\\.'); // Escape literal dots
    
    const regex = new RegExp(wildcardPattern, 'i');
    
    data.forEach((item, index) => {
      let maxScore = 0;
      let matchedFields = [];

      const searchableFields = this.getSearchableFields(item);
      searchableFields.forEach(field => {
        const fieldValue = String(field.value || '');
        
        if (regex.test(fieldValue)) {
          const score = this.calculateWildcardScore(query, fieldValue);
          maxScore = Math.max(maxScore, score);
          matchedFields.push({
            field: field.name,
            score,
            value: fieldValue
          });
        }
      });

      if (maxScore > 0) {
        results.push({
          item,
          index,
          score: maxScore * this.weights.wildcardMatch,
          matchedFields,
          searchMethod: 'wildcard',
          pattern: wildcardPattern,
          highlights: this.generateWildcardHighlights(query, matchedFields)
        });
      }
    });

    return results;
  }

  /**
   * Regex pattern search
   */
  regexSearch(query, data) {
    const results = [];
    
    try {
      const regex = new RegExp(query, 'i');
      
      data.forEach((item, index) => {
        let maxScore = 0;
        let matchedFields = [];

        const searchableFields = this.getSearchableFields(item);
        searchableFields.forEach(field => {
          const fieldValue = String(field.value || '');
          
          if (regex.test(fieldValue)) {
            const score = this.calculateRegexScore(query, fieldValue);
            maxScore = Math.max(maxScore, score);
            matchedFields.push({
              field: field.name,
              score,
              value: fieldValue,
              matches: fieldValue.match(regex)
            });
          }
        });

        if (maxScore > 0) {
          results.push({
            item,
            index,
            score: maxScore * this.weights.regexMatch,
            matchedFields,
            searchMethod: 'regex',
            pattern: query,
            highlights: this.generateRegexHighlights(query, matchedFields)
          });
        }
      });
    } catch (error) {
      logger.error('Invalid regex pattern:', error);
    }

    return results;
  }

  /**
   * Vector search using embeddings (placeholder for future implementation)
   */
  async vectorSearch(query, data) {
    // This would integrate with a vector database like Pinecone or Weaviate
    // For now, return empty results
    return [];
  }

  /**
   * Merge results from different search methods
   */
  mergeResults(results) {
    const merged = new Map();
    
    results.forEach(result => {
      const key = result.index;
      
      if (merged.has(key)) {
        // Combine scores and matched fields
        const existing = merged.get(key);
        existing.score = Math.max(existing.score, result.score);
        existing.searchMethods.push(result.searchMethod);
        existing.matchedFields.push(...result.matchedFields);
        existing.highlights.push(...result.highlights);
      } else {
        result.searchMethods = [result.searchMethod];
        result.highlights = [result.highlights].flat();
        merged.set(key, result);
      }
    });

    return Array.from(merged.values());
  }

  /**
   * Apply filters to search results
   */
  applyFilters(results, filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return results;
    }

    return results.filter(result => {
      const item = result.item;
      
      for (const [key, value] of Object.entries(filters)) {
        if (value === null || value === undefined) continue;
        
        if (Array.isArray(value)) {
          if (!value.includes(item[key])) return false;
        } else if (typeof value === 'object') {
          // Handle range filters
          if (value.min !== undefined && item[key] < value.min) return false;
          if (value.max !== undefined && item[key] > value.max) return false;
        } else {
          if (item[key] !== value) return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Generate highlights for search results
   */
  generateHighlights(query, matchedFields) {
    const highlights = [];
    const queryTokens = this.tokenizer.tokenize(query.toLowerCase());
    
    matchedFields.forEach(field => {
      const fieldValue = String(field.value);
      let highlightedValue = fieldValue;
      
      queryTokens.forEach(token => {
        const regex = new RegExp(`(${token})`, 'gi');
        highlightedValue = highlightedValue.replace(regex, '<mark>$1</mark>');
      });
      
      highlights.push({
        field: field.field,
        original: fieldValue,
        highlighted: highlightedValue,
        score: field.score
      });
    });
    
    return highlights;
  }

  /**
   * Helper methods
   */
  calculateDistance(str1, str2) {
    return distance(str1.toLowerCase(), str2.toLowerCase());
  }

  phoneticMatch(str1, str2) {
    const phonetic1 = natural.Metaphone.process(str1);
    const phonetic2 = natural.Metaphone.process(str2);
    return phonetic1 === phonetic2 ? 0.8 : 0;
  }

  calculateCosineSimilarity(vec1, vec2) {
    // Simple cosine similarity calculation
    const keys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    keys.forEach(key => {
      const val1 = vec1[key] || 0;
      const val2 = vec2[key] || 0;
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    });
    
    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  calculateGeographicDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  getSearchableFields(item) {
    return [
      { name: 'name', value: item.name || item.college_name, type: 'name' },
      { name: 'city', value: item.city, type: 'location' },
      { name: 'state', value: item.state, type: 'location' },
      { name: 'course', value: item.course_name, type: 'text' },
      { name: 'type', value: item.college_type, type: 'text' },
      { name: 'management', value: item.management_type, type: 'text' }
    ].filter(field => field.value);
  }

  extractSearchableText(item) {
    const fields = this.getSearchableFields(item);
    return fields.map(f => f.value).join(' ');
  }

  textMatch(queryTokens, text) {
    const textTokens = this.tokenizer.tokenize(String(text).toLowerCase());
    let matches = 0;
    
    queryTokens.forEach(queryToken => {
      if (textTokens.includes(queryToken)) {
        matches++;
      }
    });
    
    return matches / queryTokens.length;
  }

  locationTextMatch(queryTokens, location) {
    const locationStr = String(location).toLowerCase();
    let matches = 0;
    
    queryTokens.forEach(token => {
      if (locationStr.includes(token)) {
        matches++;
      }
    });
    
    return matches / queryTokens.length;
  }

  calculateWildcardScore(pattern, text) {
    // Simple scoring based on pattern complexity and match length
    const patternComplexity = (pattern.match(/[.*?]/g) || []).length;
    const matchLength = text.length;
    return Math.min(1, (matchLength / 100) * (1 / (patternComplexity + 1)));
  }

  calculateRegexScore(pattern, text) {
    // Score based on match frequency and complexity
    const matches = text.match(new RegExp(pattern, 'gi')) || [];
    return Math.min(1, matches.length / 10);
  }

  getSearchMethodsUsed(searchType) {
    if (searchType === 'all') {
      return ['fuzzy', 'semantic', 'location', 'wildcard', 'regex'];
    }
    return [searchType];
  }

  async addVectorEmbeddings(results, query) {
    // Placeholder for vector embeddings
    // This would integrate with OpenAI embeddings or similar
    return results;
  }
}

module.exports = AdvancedSearchEngine;
