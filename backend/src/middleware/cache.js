// Backend Caching Middleware for Performance Optimization
// Implements Redis-like in-memory caching with TTL support

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time-to-live tracking
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  // Generate cache key from request parameters
  generateKey(req) {
    const { method, url, query, body } = req;
    const queryStr = JSON.stringify(query || {});
    const bodyStr = JSON.stringify(body || {});
    return `${method}:${url}:${queryStr}:${bodyStr}`;
  }

  // Get cached response
  get(req) {
    const key = this.generateKey(req);
    
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      
      // Check if entry has expired
      if (this.ttl.has(key) && Date.now() > this.ttl.get(key)) {
        this.delete(key);
        this.stats.misses++;
        return null;
      }
      
      this.stats.hits++;
      return entry;
    }
    
    this.stats.misses++;
    return null;
  }

  // Set cache entry with TTL
  set(req, data, ttlSeconds = 300) { // Default 5 minutes
    const key = this.generateKey(req);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
    
    this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
    this.stats.sets++;
  }

  // Delete cache entry
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
    this.stats.deletes++;
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  // Get cache statistics
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : 0;
    
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: `${hitRate}%`,
      sets: this.stats.sets,
      deletes: this.stats.deletes
    };
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.ttl) {
      if (now > expiry) {
        this.delete(key);
      }
    }
  }

  // Cache middleware function
  middleware(ttlSeconds = 300) {
    return (req, res, next) => {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Skip caching for admin routes
      if (req.path.includes('/admin/')) {
        return next();
      }

      const cachedResponse = this.get(req);
      if (cachedResponse) {
        console.log('🚀 Cache hit for:', req.path);
        return res.json(cachedResponse.data);
      }

      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to cache the response
      const self = this;
      res.json = function(data) {
        // Cache the response
        self.set(req, data, ttlSeconds);
        
        // Call original method
        return originalJson.call(this, data);
      };

      next();
    };
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;
module.exports.CacheManager = CacheManager;
