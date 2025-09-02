// Search Cache Utility for Performance Optimization
// Implements LRU (Least Recently Used) caching for search results

class SearchCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.accessOrder = [];
  }

  // Generate cache key from search parameters
  generateKey(query, searchFields, searchOptions) {
    const optionsStr = JSON.stringify(searchOptions);
    return `${query}:${searchFields.join(',')}:${optionsStr}`;
  }

  // Get cached search results
  get(query, searchFields, searchOptions) {
    const key = this.generateKey(query, searchFields, searchOptions);
    
    if (this.cache.has(key)) {
      // Update access order
      this.updateAccessOrder(key);
      return this.cache.get(key);
    }
    
    return null;
  }

  // Set search results in cache
  set(query, searchFields, searchOptions, results) {
    const key = this.generateKey(query, searchFields, searchOptions);
    
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      results,
      timestamp: Date.now(),
      query,
      searchFields,
      searchOptions
    });
    
    this.updateAccessOrder(key);
  }

  // Update access order for LRU
  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  // Evict oldest cache entry
  evictOldest() {
    if (this.accessOrder.length === 0) return;
    
    const oldestKey = this.accessOrder.shift();
    this.cache.delete(oldestKey);
  }

  // Clear cache
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // Calculate cache hit rate (placeholder for future implementation)
  calculateHitRate() {
    // This would require tracking hits/misses over time
    return 'N/A';
  }

  // Estimate memory usage
  estimateMemoryUsage() {
    let totalSize = 0;
    for (const [key, value] of this.cache) {
      totalSize += key.length;
      totalSize += JSON.stringify(value).length;
    }
    return `${(totalSize / 1024).toFixed(2)} KB`;
  }

  // Preload common searches
  preloadCommonSearches(data, searchFields) {
    const commonQueries = [
      'medical', 'dental', 'aiims', 'mumbai', 'delhi', 'bangalore',
      'cardiology', 'orthopedics', 'pediatrics', 'surgery'
    ];

    commonQueries.forEach(query => {
      if (query.length >= 2) {
        // Import and use advanced search for preloading
        import('./advancedSearch.js').then(({ advancedSearch }) => {
          const results = advancedSearch(query, data, searchFields, {
            fuzzy: true,
            phonetic: true,
            location: true
          });
          
          this.set(query, searchFields, {
            fuzzy: true,
            phonetic: true,
            location: true
          }, results);
        });
      }
    });
  }
}

// Create singleton instance
const searchCache = new SearchCache(100);

export default searchCache;
export { SearchCache };
