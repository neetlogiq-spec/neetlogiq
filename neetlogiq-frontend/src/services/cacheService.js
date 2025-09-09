// Client-side caching service for NeetLogIQ
// Implements localStorage and sessionStorage caching with TTL support

class CacheService {
  constructor() {
    this.prefix = 'neetlogiq_';
    this.defaultTTL = {
      colleges: 60 * 60 * 1000, // 1 hour
      courses: 30 * 60 * 1000,  // 30 minutes
      filters: 30 * 60 * 1000,  // 30 minutes
      searchIndex: 2 * 60 * 60 * 1000, // 2 hours
      cutoffs: 24 * 60 * 60 * 1000, // 24 hours
      static: 24 * 60 * 60 * 1000 // 24 hours
    };
  }

  // Generate cache key
  getCacheKey(type, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${this.prefix}${type}_${paramString}`;
  }

  // Check if cache entry is valid
  isValid(entry) {
    if (!entry || !entry.timestamp) return false;
    return Date.now() - entry.timestamp < entry.ttl;
  }

  // Get cached data
  get(type, params = {}) {
    try {
      const key = this.getCacheKey(type, params);
      const cached = localStorage.getItem(key);
      
      if (!cached) return null;
      
      const entry = JSON.parse(cached);
      
      if (this.isValid(entry)) {
        console.log(`🎯 Cache HIT for ${type}:`, params);
        return entry.data;
      } else {
        // Remove expired entry
        localStorage.removeItem(key);
        console.log(`⏰ Cache EXPIRED for ${type}:`, params);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set cached data
  set(type, data, params = {}, customTTL = null) {
    const key = this.getCacheKey(type, params);
    const ttl = customTTL || this.defaultTTL[type] || this.defaultTTL.static;
    
    const entry = {
      data,
      timestamp: Date.now(),
      ttl,
      type,
      params
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(entry));
      console.log(`💾 Cache SET for ${type}:`, params, `TTL: ${ttl}ms`);
    } catch (error) {
      console.error('Cache set error:', error);
      // If localStorage is full, clear old entries
      this.clearOldEntries();
      try {
        localStorage.setItem(key, JSON.stringify(entry));
      } catch (retryError) {
        console.error('Cache set retry failed:', retryError);
      }
    }
  }

  // Clear old cache entries
  clearOldEntries() {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const entry = JSON.parse(localStorage.getItem(key));
            if (entry && entry.timestamp && now - entry.timestamp > entry.ttl) {
              localStorage.removeItem(key);
              console.log(`🗑️ Cleared expired cache: ${key}`);
            }
          } catch (error) {
            // Remove corrupted entries
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Clear old entries error:', error);
    }
  }

  // Clear all cache
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      console.log('🧹 Cleared all cache');
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  }

  // Clear specific type
  clearType(type) {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`${this.prefix}${type}_`)) {
          localStorage.removeItem(key);
        }
      });
      console.log(`🧹 Cleared cache for type: ${type}`);
    } catch (error) {
      console.error('Clear type cache error:', error);
    }
  }

  // Get cache statistics
  getStats() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.prefix));
      
      let validEntries = 0;
      let expiredEntries = 0;
      let totalSize = 0;
      
      cacheKeys.forEach(key => {
        try {
          const entry = JSON.parse(localStorage.getItem(key));
          totalSize += localStorage.getItem(key).length;
          
          if (this.isValid(entry)) {
            validEntries++;
          } else {
            expiredEntries++;
          }
        } catch (error) {
          // Skip corrupted entries
        }
      });
      
      return {
        totalEntries: cacheKeys.length,
        validEntries,
        expiredEntries,
        totalSize: `${Math.round(totalSize / 1024)}KB`,
        types: this.getTypeStats(cacheKeys)
      };
    } catch (error) {
      console.error('Get cache stats error:', error);
      return null;
    }
  }

  // Get statistics by type
  getTypeStats(keys) {
    const stats = {};
    keys.forEach(key => {
      const type = key.split('_')[1];
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;