/**
 * Advanced Caching Utility
 * Provides persistent caching with sessionStorage and memory fallback
 */

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    this.maxMemorySize = 100; // Maximum items in memory cache
    this.storageKey = 'neetlogiq_search_cache';
  }

  /**
   * Generate cache key from parameters
   * @param {string} query - Search query
   * @param {string} contentType - Content type
   * @param {Object} options - Additional options
   * @returns {string} - Cache key
   */
  generateKey(query, contentType = 'all', options = {}) {
    const normalizedQuery = query.toLowerCase().trim();
    const optionsString = JSON.stringify(options, Object.keys(options).sort());
    return `${normalizedQuery}-${contentType}-${optionsString}`;
  }

  /**
   * Get cached result
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null
   */
  get(key) {
    // Try memory cache first (fastest)
    const memoryResult = this.memoryCache.get(key);
    if (memoryResult && this.isValid(memoryResult)) {
      console.log('🚀 Memory cache hit:', key);
      return memoryResult.data;
    }

    // Try sessionStorage (persistent across page reloads)
    try {
      const sessionData = this.getFromSessionStorage(key);
      if (sessionData && this.isValid(sessionData)) {
        console.log('💾 Session cache hit:', key);
        // Store in memory for faster access
        this.setInMemory(key, sessionData.data, sessionData.timestamp);
        return sessionData.data;
      }
    } catch (error) {
      console.warn('SessionStorage access failed:', error);
    }

    return null;
  }

  /**
   * Set cached result
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, data, ttl = this.defaultTTL) {
    const timestamp = Date.now();
    const cacheItem = {
      data,
      timestamp,
      ttl
    };

    // Store in memory
    this.setInMemory(key, data, timestamp, ttl);

    // Store in sessionStorage
    try {
      this.setInSessionStorage(key, cacheItem);
    } catch (error) {
      console.warn('SessionStorage write failed:', error);
    }
  }

  /**
   * Set item in memory cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} timestamp - Timestamp
   * @param {number} ttl - Time to live
   */
  setInMemory(key, data, timestamp, ttl = this.defaultTTL) {
    // Clean up old items if cache is full
    if (this.memoryCache.size >= this.maxMemorySize) {
      this.cleanupMemoryCache();
    }

    this.memoryCache.set(key, {
      data,
      timestamp,
      ttl
    });
  }

  /**
   * Get item from sessionStorage
   * @param {string} key - Cache key
   * @returns {any|null} - Cached item or null
   */
  getFromSessionStorage(key) {
    try {
      const cacheData = sessionStorage.getItem(this.storageKey);
      if (!cacheData) return null;

      const parsedCache = JSON.parse(cacheData);
      return parsedCache[key] || null;
    } catch (error) {
      console.warn('Failed to parse sessionStorage cache:', error);
      return null;
    }
  }

  /**
   * Set item in sessionStorage
   * @param {string} key - Cache key
   * @param {any} item - Item to store
   */
  setInSessionStorage(key, item) {
    try {
      const existingCache = this.getFromSessionStorage(key) ? 
        JSON.parse(sessionStorage.getItem(this.storageKey)) : {};
      
      existingCache[key] = item;
      sessionStorage.setItem(this.storageKey, JSON.stringify(existingCache));
    } catch (error) {
      console.warn('Failed to write to sessionStorage:', error);
    }
  }

  /**
   * Check if cache item is valid
   * @param {Object} item - Cache item
   * @returns {boolean} - Whether item is valid
   */
  isValid(item) {
    if (!item || !item.timestamp || !item.ttl) return false;
    return Date.now() - item.timestamp < item.ttl;
  }

  /**
   * Clean up expired items from memory cache
   */
  cleanupMemoryCache() {
    for (const [key, item] of this.memoryCache.entries()) {
      if (!this.isValid(item)) {
        this.memoryCache.delete(key);
      }
    }

    // If still too many items, remove oldest ones
    if (this.memoryCache.size >= this.maxMemorySize) {
      const sortedEntries = Array.from(this.memoryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const itemsToRemove = sortedEntries.slice(0, Math.floor(this.maxMemorySize / 2));
      itemsToRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  /**
   * Clear all caches
   */
  clear() {
    this.memoryCache.clear();
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  }

  /**
   * Clear expired items from all caches
   */
  cleanup() {
    this.cleanupMemoryCache();
    
    try {
      const cacheData = sessionStorage.getItem(this.storageKey);
      if (cacheData) {
        const parsedCache = JSON.parse(cacheData);
        const cleanedCache = {};
        
        for (const [key, item] of Object.entries(parsedCache)) {
          if (this.isValid(item)) {
            cleanedCache[key] = item;
          }
        }
        
        sessionStorage.setItem(this.storageKey, JSON.stringify(cleanedCache));
      }
    } catch (error) {
      console.warn('Failed to cleanup sessionStorage:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats() {
    const memorySize = this.memoryCache.size;
    let sessionSize = 0;
    
    try {
      const cacheData = sessionStorage.getItem(this.storageKey);
      if (cacheData) {
        sessionSize = Object.keys(JSON.parse(cacheData)).length;
      }
    } catch (error) {
      console.warn('Failed to get sessionStorage stats:', error);
    }

    return {
      memorySize,
      sessionSize,
      totalSize: memorySize + sessionSize
    };
  }
}

// Create and export singleton instance
const cacheManager = new CacheManager();

// Cleanup expired items on page load
if (typeof window !== 'undefined') {
  cacheManager.cleanup();
}

export default cacheManager;
