/**
 * Simple, Precise Search Service
 * Replaces the complex parallel search system with a single, accurate search function
 */

class SimpleSearchService {
  constructor() {
    this.collegesData = [];
    this.isInitialized = false;
    // Minimal logging for better performance
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Simple Search Service initialized');
    }
  }

  // Initialize with college data
  async initialize(collegesData = null) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Initializing Simple Search Service...');
      }
      
      if (collegesData && Array.isArray(collegesData)) {
        // Use provided data
        this.collegesData = collegesData;
        this.isInitialized = true;
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Simple Search Service initialized with ${this.collegesData.length} colleges (provided data)`);
        }
        return true;
      } else {
        // Load college data from Cloudflare Worker with high limit
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://neetlogiq-backend.neetlogiq.workers.dev'}/api/colleges?limit=1000`);
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          this.collegesData = data.data;
          this.isInitialized = true;
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Simple Search Service initialized with ${this.collegesData.length} colleges`);
          }
          return true;
        } else {
          throw new Error('Failed to load college data');
        }
      }
    } catch (error) {
      console.error('❌ Simple Search Service initialization failed:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // Main search function - simple and precise
  async search(query, options = {}) {
    if (!this.isInitialized) {
      console.log('⚠️ Search service not initialized, initializing now...');
      await this.initialize();
    }

    if (!query || query.trim().length < 1) {
      return this.createSearchResult([], 'empty-query', 0);
    }

    const startTime = performance.now();
    const normalizedQuery = this.normalizeQuery(query.trim());
    
    // Reduced logging for better performance - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Searching for: "${query}" (normalized: "${normalizedQuery}")`);
    }

    // Enhanced debug logging for abbreviation search
    if (process.env.NODE_ENV === 'development' && (query === 'test' || query === 'debug' || query.length <= 3)) {
      console.log(`🧪 Testing abbreviation detection for "${query}":`);
      console.log(`  Original query: "${query}"`);
      console.log(`  Normalized query: "${normalizedQuery}"`);
      console.log(`  isLikelyAbbreviation: ${this.isLikelyAbbreviation(query)}`);
      console.log(`  Generated patterns: [${this.generateAbbreviationPatterns(normalizedQuery).join(', ')}]`);
    }

    // Get search results
    const results = this.performSearch(normalizedQuery, query);
    
    const searchTime = performance.now() - startTime;
    
    // Reduced logging for better performance - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Search completed in ${searchTime.toFixed(2)}ms with ${results.length} results`);
      
      // Log top results for debugging only in development
      if (results.length > 0) {
        console.log(`📊 Top 3 results:`);
        results.slice(0, 3).forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.name} (Score: ${result.relevanceScore}, Type: ${result.matchType})`);
        });
      } else {
        console.log(`❌ No results found for query: "${query}"`);
      }
    }

    return this.createSearchResult(results, 'simple-search', searchTime);
  }

  // Normalize search query - ENHANCED DOT REMOVAL
  normalizeQuery(query) {
    return query
      .toUpperCase()
      .replace(/\./g, ' ')  // Replace dots with spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim();
  }

  // Normalize college name for search - ENHANCED DOT REMOVAL
  normalizeCollegeName(collegeName) {
    return collegeName
      .toUpperCase()
      .replace(/\./g, ' ')  // Replace dots with spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim();
  }

  // Perform the actual search
  performSearch(normalizedQuery, originalQuery) {
    const results = [];
    const queryLength = normalizedQuery.length;

    // Skip very short queries to avoid too many results
    if (queryLength < 2) {
      return results;
    }

    this.collegesData.forEach((college, index) => {
      const collegeName = college.name || '';
      const normalizedName = this.normalizeCollegeName(collegeName);
      
      let score = 0;
      let matchType = 'none';

      // 1. EXACT MATCH (highest priority) - exact string match
      if (normalizedName === normalizedQuery) {
        score = 100;
        matchType = 'exact';
      }
      // 2. EXACT PREFIX MATCH (highest priority for abbreviations) - starts with query
      else if (normalizedName.startsWith(normalizedQuery + ' ')) {
        score = 95;
        matchType = 'prefix';
      }
      // 3. ABBREVIATION MATCH (for patterns like "M S", "A J", etc.) - MOST IMPORTANT
      else if (this.isAbbreviationMatch(normalizedQuery, normalizedName)) {
        score = 85;
        matchType = 'abbreviation';
      }
      // 4. SMART CONTAINS MATCH (very restrictive)
      else if (this.isSmartContainsMatch(normalizedQuery, normalizedName)) {
        score = 70;
        matchType = 'contains';
      }
      // 5. WORD BOUNDARY MATCH (very restrictive for multi-word queries)
      else if (this.isWordBoundaryMatch(normalizedQuery, normalizedName)) {
        score = 60;
        matchType = 'word-boundary';
      }

      // Apply STRICT filtering to eliminate false positives
      if (score >= 60 && this.isValidMatch(normalizedQuery, normalizedName, matchType)) {
        results.push({
          ...college,
          relevanceScore: score,
          matchType: matchType,
          searchIndex: index,
          matchedQuery: originalQuery,
          normalizedQuery: normalizedQuery,
          collegeName: collegeName,
          normalizedName: normalizedName
        });
      }
    });

    // Sort by relevance score (highest first) and limit results
    const sortedResults = results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Limit results to prevent too many false positives
    const maxResults = this.getMaxResultsForQuery(normalizedQuery);
    return sortedResults.slice(0, maxResults);
  }

  // Get maximum results allowed for a query (removed restrictions for better results)
  getMaxResultsForQuery(query) {
    // Return a high limit to show all relevant results
    return 1000;
  }

  // Check if query is an abbreviation match - MUCH MORE RESTRICTIVE
  isAbbreviationMatch(query, collegeName) {
    // Only allow abbreviation matching for very specific patterns
    if (!this.isLikelyAbbreviation(query)) {
      return false;
    }
    
    // Use normalized query for pattern generation
    const normalizedQuery = this.normalizeQuery(query);
    const patterns = this.generateAbbreviationPatterns(normalizedQuery);
    
    // Enhanced debug logging for abbreviation search
    if (process.env.NODE_ENV === 'development' && (query === 'test' || query === 'debug' || query.length <= 3)) {
      console.log(`🔍 Abbreviation match debug for "${query}":`);
      console.log(`  Original College: "${collegeName}"`);
      console.log(`  Normalized College: "${this.normalizeCollegeName(collegeName)}"`);
      console.log(`  Query Patterns: [${patterns.join(', ')}]`);
      console.log(`  College Patterns: [${this.generateCollegeAbbreviationPatterns(collegeName).join(', ')}]`);
    }
    
    for (const pattern of patterns) {
      // Use strict pattern matching instead of simple includes
      if (this.isStrictPatternMatch(pattern, collegeName)) {
        // Enhanced debug logging for abbreviation search
        if (process.env.NODE_ENV === 'development' && (query === 'test' || query === 'debug' || query.length <= 3)) {
          console.log(`  ✅ Pattern "${pattern}" found in "${collegeName}"`);
        }
        
        // STRICT validation for abbreviation matches
        if (this.isValidAbbreviationPattern(query, pattern, collegeName)) {
          if (process.env.NODE_ENV === 'development' && (query === 'test' || query === 'debug' || query.length <= 3)) {
            console.log(`  ✅ Pattern "${pattern}" is VALID for "${collegeName}"`);
          }
          return true;
        } else {
          if (process.env.NODE_ENV === 'development' && (query === 'test' || query === 'debug' || query.length <= 3)) {
            console.log(`  ❌ Pattern "${pattern}" is INVALID for "${collegeName}"`);
          }
        }
      }
    }
    
    return false;
  }

  // Smart pattern matching for abbreviations - handles both strict and concatenated patterns
  isStrictPatternMatch(pattern, collegeName) {
    const words = collegeName.split(' ');
    
    // For patterns like "A B", "A.B.", "A. B.", "A.B"
    if (pattern.includes(' ') || pattern.includes('.')) {
      // Check if pattern appears as standalone words at the beginning
      const patternWords = pattern.split(/[\s.]+/).filter(w => w.length > 0);
      
      // Must match at least the first 2 words of the college name
      if (words.length >= patternWords.length) {
        for (let i = 0; i < patternWords.length; i++) {
          if (i < words.length && words[i].toUpperCase() === patternWords[i].toUpperCase()) {
            continue;
          } else {
            return false;
          }
        }
        return true;
      }
    }
    
    // For patterns like "AB", "MSRMC" (no spaces/dots) - handle concatenated abbreviations
    else {
      // First check if it appears as a standalone word at the beginning
      if (words.length > 0 && words[0].toUpperCase() === pattern.toUpperCase()) {
        return true;
      }
      
      // Then check if it's a concatenated abbreviation (like "MSRMC" -> "M S RAMAIAH MEDICAL COLLEGE")
      if (this.isConcatenatedAbbreviationMatch(pattern, collegeName)) {
        return true;
      }
    }
    
    return false;
  }

  // Check if a concatenated abbreviation matches a college name
  isConcatenatedAbbreviationMatch(abbreviation, collegeName) {
    const abbreviationUpper = abbreviation.toUpperCase();
    
    // For abbreviations like "MSRMC", "AJIMS", "AJIMSRC", check if it matches any generated patterns
    if (abbreviationUpper.length >= 2 && abbreviationUpper.length <= 10) {
      // Generate all possible abbreviation patterns from the college name
      const collegePatterns = this.generateCollegeAbbreviationPatterns(collegeName);
      
      // Check if the abbreviation matches any of the generated patterns
      if (collegePatterns.includes(abbreviationUpper)) {
        return true;
      }
      
      // Also check if abbreviation appears as a substring in college name (for cases like "AJ" in "AJAY")
      if (this.isAbbreviationInWord(abbreviationUpper, collegeName)) {
        return true;
      }
    }
    
    return false;
  }

  // Check if abbreviation appears as a meaningful substring in college name
  isAbbreviationInWord(abbreviation, collegeName) {
    const collegeUpper = collegeName.toUpperCase();
    
    // Only allow very short abbreviations (2-3 chars) to match word prefixes
    // This prevents false matches like "RRMCH" matching "RAJARAJESWARI MEDICAL COLLEGE & HOSPITAL"
    if (abbreviation.length >= 2 && abbreviation.length <= 3) {
      // Check if abbreviation appears at the beginning of a word
      const words = collegeUpper.split(' ');
      for (const word of words) {
        if (word.startsWith(abbreviation) && word.length > abbreviation.length) {
          // Make sure it's not just a random substring (e.g., "AJ" in "RAJAY")
          // Only allow if it's at the start of a meaningful word
          return true;
        }
      }
    }
    
    // For longer abbreviations (4+ chars), be much more strict
    // They should only match if they're exact abbreviation patterns, not random substrings
    return false;
  }

  // Check if query is likely an abbreviation (not just random letters)
  isLikelyAbbreviation(query) {
    // First normalize the query to handle dots
    const normalizedQuery = this.normalizeQuery(query);
    const queryWords = normalizedQuery.split(' ');
    
    // Single word abbreviations (like "KVG", "MS", "MSRMC") - but not if it contains dots
    if (queryWords.length === 1) {
      const word = queryWords[0];
      // Must be 2-8 characters and all uppercase letters, and no dots in original
      return word.length >= 2 && word.length <= 8 && 
             /^[A-Z]+$/.test(word) && !query.includes('.');
    }
    
    // Multi-word abbreviations (like "M S", "A J", "A.B") - ACCEPT BOTH UPPERCASE AND LOWERCASE
    if (queryWords.length === 2) {
      const [first, second] = queryWords;
      // Each word must be 1-2 characters and letters (uppercase or lowercase)
      return first.length >= 1 && first.length <= 2 && 
             second.length >= 1 && second.length <= 2 &&
             /^[A-Za-z]+$/.test(first) && /^[A-Za-z]+$/.test(second);
    }
    
    // Three-word abbreviations (like "S K S")
    if (queryWords.length === 3) {
      return queryWords.every(word => 
        word.length >= 1 && word.length <= 2 && /^[A-Za-z]+$/.test(word)
      );
    }
    
    return false;
  }

  // Validate if an abbreviation pattern is legitimate - VERY STRICT
  isValidAbbreviationPattern(query, pattern, collegeName) {
    const words = collegeName.split(' ');
    
    // Special case: If the pattern is the exact beginning of the college name, it's always valid
    if (collegeName.startsWith(pattern + ' ')) {
      return true;
    }
    
    // For very short patterns (1-2 chars), be extremely restrictive
    if (pattern.length <= 2) {
      // Only allow if it appears as a standalone word at the beginning
      return words.some((word, index) => {
        // Must be standalone word and at the beginning (first 2 words)
        if (word === pattern && index < 2) return true;
        // Must be at start of first word
        if (index === 0 && word.startsWith(pattern) && word.length > pattern.length) return true;
        return false;
      });
    }
    
    // For medium patterns (3-4 chars), be restrictive but allow exact abbreviation matches
    if (pattern.length <= 4) {
      // First check if it's an exact abbreviation pattern match
      const collegePatterns = this.generateCollegeAbbreviationPatterns(collegeName);
      if (collegePatterns.includes(pattern)) {
        return true;
      }
      
      // Then check if it appears as standalone words or at beginning of words
      return words.some((word, index) => {
        if (word === pattern) return true;
        if (index < 3 && word.startsWith(pattern)) return true;
        return false;
      });
    }
    
    // For longer patterns (5+ chars), be VERY strict - only allow exact abbreviation matches
    // This prevents false matches like "RRMCH" matching "RAJARAJESWARI MEDICAL COLLEGE & HOSPITAL"
    if (pattern.length >= 5) {
      // Generate the actual abbreviation patterns from the college name
      const collegePatterns = this.generateCollegeAbbreviationPatterns(collegeName);
      
      // Only allow if the pattern exactly matches one of the generated college patterns
      return collegePatterns.includes(pattern);
    }
    
    return false;
  }

  // Generate abbreviation patterns
  generateAbbreviationPatterns(query) {
    const patterns = [];
    // Convert to uppercase for consistent pattern generation
    const upperQuery = query.toUpperCase();
    const parts = upperQuery.split(' ');

    if (parts.length === 2) {
      // "A J" -> ["A J", "AJ", "A.J.", "A. J.", "A.B"]
      const [first, second] = parts;
      patterns.push(`${first} ${second}`);
      patterns.push(`${first}${second}`);
      patterns.push(`${first}.${second}.`);
      patterns.push(`${first}. ${second}.`);
      patterns.push(`${first}.${second}`); // "A.B" format
    } else if (parts.length === 3) {
      // "S K S" -> ["S K S", "SKS", "S.K.S.", "S. K. S."]
      const [first, second, third] = parts;
      patterns.push(`${first} ${second} ${third}`);
      patterns.push(`${first}${second}${third}`);
      patterns.push(`${first}.${second}.${third}.`);
      patterns.push(`${first}. ${second}. ${third}.`);
    } else if (parts.length === 1 && parts[0].length >= 2 && parts[0].length <= 5) {
      // "KVG" -> ["K V G", "KVG", "K.V.G.", "K. V. G."]
      const single = parts[0];
      const spaced = single.split('').join(' ');
      patterns.push(spaced);
      patterns.push(single);
      patterns.push(single.split('').join('.') + '.');
      patterns.push(single.split('').join('. ') + '.');
      
      // For longer abbreviations like "AJIMS", also try common patterns
      if (single.length >= 4) {
        // "AJIMS" -> try "A J" (first two letters)
        patterns.push(`${single[0]} ${single[1]}`);
        patterns.push(`${single[0]}${single[1]}`);
        // "AJIMS" -> try "AJ" (first two letters)
        patterns.push(single.substring(0, 2));
        // "AJIMS" -> try "A J I" (first three letters)
        if (single.length >= 5) {
          patterns.push(`${single[0]} ${single[1]} ${single[2]}`);
          patterns.push(`${single[0]}${single[1]}${single[2]}`);
        }
      }
    }

    return patterns;
  }

  // Generate abbreviation patterns from college name (for matching)
  generateCollegeAbbreviationPatterns(collegeName) {
    // Common words to skip in abbreviations (only the most common ones)
    const skipWords = new Set([
      'OF', 'THE', 'AND', '&', 'FOR', 'IN', 'AT', 'TO', 'BY', 'WITH', 'FROM', 
      'ON', 'AS', 'IS', 'ARE', 'WAS', 'WERE', 'BE', 'BEEN', 'BEING', 'HAVE', 
      'HAS', 'HAD', 'DO', 'DOES', 'DID', 'WILL', 'WOULD', 'COULD', 'SHOULD',
      'OR', 'BUT', 'SO', 'YET', 'NOR'
      // Note: Not filtering 'A' and 'AN' as they can be meaningful in abbreviations
    ]);
    
    // Filter out common words and get meaningful words
    const words = collegeName.split(' ')
      .filter(word => word.length > 0)
      .map(word => word.replace(/[.,&]/g, '').toUpperCase()) // Remove punctuation
      .filter(word => !skipWords.has(word)); // Skip common words
    
    const patterns = [];
    
    // Generate patterns of different lengths (2 to all meaningful words)
    for (let i = 2; i <= words.length; i++) {
      const firstLetters = words.slice(0, i).map(word => word.charAt(0).toUpperCase()).join('');
      patterns.push(firstLetters);
    }
    
    return patterns;
  }

  // Check for word boundary matches - VERY RESTRICTIVE
  isWordBoundaryMatch(query, collegeName) {
    const queryWords = query.split(' ');
    const collegeWords = collegeName.split(' ');

    // Only allow word boundary matching for longer queries (3+ chars per word)
    if (queryWords.some(word => word.length < 3)) {
      return false;
    }

    // Check if all query words appear in college name at word boundaries
    return queryWords.every(queryWord => 
      collegeWords.some(collegeWord => 
        collegeWord.startsWith(queryWord) || collegeWord === queryWord
      )
    );
  }

  // Smart contains match with better filtering - Made less restrictive
  isSmartContainsMatch(query, collegeName) {
    // Allow contains match for queries of 2+ characters (was 3+)
    if (query.length < 2) return false;
    
    // Check if query appears in college name
    if (!collegeName.includes(query)) return false;
    
    // Less restrictive filtering to allow more results
    const queryWords = query.split(' ');
    const collegeWords = collegeName.split(' ');
    
    // For multi-word queries, be less restrictive
    if (queryWords.length > 1) {
      return queryWords.some(queryWord => 
        collegeWords.some(collegeWord => 
          collegeWord.includes(queryWord) && queryWord.length >= 2
        )
      );
    }
    
    // For single word queries, be less restrictive
    return this.isSignificantMatch(query, collegeName);
  }

  // Check if a match is significant (not just a common substring) - Made less restrictive
  isSignificantMatch(query, collegeName) {
    // Allow matches for queries of 2+ characters (was 3+)
    if (query.length < 2) return false;
    
    // Check if query appears at word boundaries or as a significant part
    const words = collegeName.split(' ');
    return words.some(word => {
      // Exact word match
      if (word === query) return true;
      // Word starts with query (for queries of 3+ characters)
      if (query.length >= 3 && word.startsWith(query)) return true;
      // Word contains query (less restrictive)
      if (word.includes(query) && query.length >= 2) return true;
      return false;
    });
  }

  // Validate if a match is legitimate (additional filtering) - Made less restrictive
  isValidMatch(query, collegeName, matchType) {
    // For abbreviation matches, be more strict
    if (matchType === 'abbreviation') {
      return this.isValidAbbreviationMatch(query, collegeName);
    }
    
    // For contains matches, be less restrictive - allow more results
    if (matchType === 'contains') {
      return this.isValidContainsMatch(query, collegeName);
    }
    
    // For other match types, they're generally valid
    return true;
  }

  // Validate abbreviation matches more strictly
  isValidAbbreviationMatch(query, collegeName) {
    // For very short queries (2 chars), be more restrictive
    if (query.length <= 2) {
      // Only allow if it's a clear abbreviation pattern
      const patterns = this.generateAbbreviationPatterns(query);
      return patterns.some(pattern => collegeName.includes(pattern));
    }
    
    return true;
  }

  // Validate contains matches to avoid false positives - Made less restrictive
  isValidContainsMatch(query, collegeName) {
    // Only filter out very obvious false positives
    const commonSubstrings = ['HOSPITAL', 'COLLEGE', 'INSTITUTE', 'MEDICAL', 'DENTAL', 'DNB'];
    
    // If query is a common substring, be less restrictive
    if (commonSubstrings.some(sub => query.includes(sub))) {
      const words = collegeName.split(' ');
      // Allow matches if query appears in any word, even if it's short
      return words.some(word => word.includes(query));
    }
    
    return true;
  }

  // Create standardized search result
  createSearchResult(results, searchType, searchTime) {
    return {
      success: true,
      results: results,
      metadata: {
        searchType: searchType,
        totalResults: results.length,
        searchTime: searchTime,
        timestamp: new Date().toISOString(),
        query: results[0]?.matchedQuery || '',
        normalizedQuery: results[0]?.normalizedQuery || ''
      }
    };
  }

  // Get search suggestions (simple implementation)
  getSuggestions(query, limit = 5) {
    if (!this.isInitialized || !query || query.length < 2) {
      return [];
    }

    const normalizedQuery = this.normalizeQuery(query);
    const suggestions = new Set();

    this.collegesData.forEach(college => {
      const collegeName = college.name || '';
      const normalizedName = this.normalizeQuery(collegeName);

      if (normalizedName.includes(normalizedQuery)) {
        // Add the college name as a suggestion
        suggestions.add(collegeName);
        
        // Add word-based suggestions
        const words = collegeName.split(' ');
        words.forEach(word => {
          if (word.toUpperCase().startsWith(normalizedQuery)) {
            suggestions.add(word);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  // Health check
  getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      collegeCount: this.collegesData.length,
      serviceType: 'simple-search',
      status: this.isInitialized ? 'healthy' : 'not-initialized'
    };
  }
}

// Create and export singleton instance
const simpleSearchService = new SimpleSearchService();
export default simpleSearchService;
