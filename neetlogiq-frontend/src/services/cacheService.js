// Cache Service for NeetLogIQ Performance Optimization
class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    this.maxSize = 100; // Maximum number of cached items
  }

  // Generate cache key from parameters
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${prefix}:${sortedParams}`;
  }

  // Get cached data
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // Set cached data
  set(key, data, ttl = this.defaultTTL) {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
  }

  // Clear specific cache entry
  delete(key) {
    this.cache.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const items = Array.from(this.cache.values());
    
    return {
      totalItems: this.cache.size,
      expiredItems: items.filter(item => now > item.expiresAt).length,
      validItems: items.filter(item => now <= item.expiresAt).length,
      oldestItem: Math.min(...items.map(item => item.createdAt)),
      newestItem: Math.max(...items.map(item => item.createdAt))
    };
  }

  // Cache API responses with automatic key generation
  async cacheApiCall(apiCall, prefix, params = {}, ttl = this.defaultTTL) {
    const key = this.generateKey(prefix, params);
    
    // Try to get from cache first
    const cached = this.get(key);
    if (cached) {
      console.log(`📦 Cache HIT for ${key}`);
      return cached;
    }

    console.log(`📦 Cache MISS for ${key}, making API call`);
    
    try {
      const data = await apiCall();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`API call failed for ${key}:`, error);
      throw error;
    }
  }

  // Preload data for better performance
  async preloadData(apiCalls, ttl = this.defaultTTL) {
    const promises = apiCalls.map(({ apiCall, prefix, params }) => 
      this.cacheApiCall(apiCall, prefix, params, ttl)
    );

    try {
      const results = await Promise.all(promises);
      console.log(`🚀 Preloaded ${results.length} data sets`);
      return results;
    } catch (error) {
      console.error('Preload failed:', error);
      throw error;
    }
  }

  // Warm up cache with common queries
  async warmUpCache(apiService) {
    const commonQueries = [
      { query: 'MBBS', type: 'courses' },
      { query: 'BDS', type: 'courses' },
      { query: 'Karnataka', type: 'colleges' },
      { query: 'Maharashtra', type: 'colleges' },
      { query: 'Delhi', type: 'colleges' }
    ];

    const preloadCalls = commonQueries.map(({ query, type }) => ({
      apiCall: () => apiService.advancedSearch(query, { type, limit: 20 }),
      prefix: 'advanced-search',
      params: { query, type, limit: 20 }
    }));

    try {
      await this.preloadData(preloadCalls, 10 * 60 * 1000); // 10 minutes TTL for warm-up
      console.log('🔥 Cache warmed up successfully');
    } catch (error) {
      console.error('Cache warm-up failed:', error);
    }
  }
}

// Create and export singleton instance
const cacheService = new CacheService();
export default cacheService;
