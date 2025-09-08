// Cache Performance Monitoring Service for NeetLogIQ
// Tracks cache performance, hit rates, and request reduction

class CachePerformanceService {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      batchRequests: 0,
      startTime: Date.now(),
      requestsByType: {},
      performanceByType: {},
      errorCount: 0
    };
    
    this.requestHistory = [];
    this.maxHistorySize = 1000;
    
    // Performance thresholds
    this.thresholds = {
      cacheHitRate: 0.7, // 70% minimum
      responseTime: 1000, // 1 second maximum
      errorRate: 0.05 // 5% maximum
    };
  }

  // Record a cache hit
  recordCacheHit(dataType, responseTime = 0) {
    this.metrics.cacheHits++;
    this.metrics.totalRequests++;
    
    this.updateTypeMetrics(dataType, {
      hits: (this.metrics.requestsByType[dataType]?.hits || 0) + 1,
      responseTime: responseTime,
      timestamp: Date.now()
    });
    
    this.recordRequest({
      type: 'cache_hit',
      dataType,
      responseTime,
      timestamp: Date.now()
    });
    
    console.log(`🎯 Cache HIT for ${dataType} (${responseTime}ms)`);
  }

  // Record a cache miss
  recordCacheMiss(dataType, responseTime = 0) {
    this.metrics.cacheMisses++;
    this.metrics.totalRequests++;
    this.metrics.apiCalls++;
    
    this.updateTypeMetrics(dataType, {
      misses: (this.metrics.requestsByType[dataType]?.misses || 0) + 1,
      responseTime: responseTime,
      timestamp: Date.now()
    });
    
    this.recordRequest({
      type: 'cache_miss',
      dataType,
      responseTime,
      timestamp: Date.now()
    });
    
    console.log(`❌ Cache MISS for ${dataType} (${responseTime}ms)`);
  }

  // Record an API call
  recordApiCall(endpoint, responseTime = 0, success = true) {
    this.metrics.apiCalls++;
    
    if (!success) {
      this.metrics.errorCount++;
    }
    
    this.recordRequest({
      type: 'api_call',
      endpoint,
      responseTime,
      success,
      timestamp: Date.now()
    });
    
    console.log(`🌐 API Call: ${endpoint} (${responseTime}ms, ${success ? 'success' : 'error'})`);
  }

  // Record a batch request
  recordBatchRequest(requestCount, responseTime = 0, success = true) {
    this.metrics.batchRequests++;
    this.metrics.apiCalls += requestCount;
    
    if (!success) {
      this.metrics.errorCount++;
    }
    
    this.recordRequest({
      type: 'batch_request',
      requestCount,
      responseTime,
      success,
      timestamp: Date.now()
    });
    
    console.log(`📦 Batch Request: ${requestCount} requests (${responseTime}ms, ${success ? 'success' : 'error'})`);
  }

  // Update type-specific metrics
  updateTypeMetrics(dataType, metrics) {
    if (!this.metrics.requestsByType[dataType]) {
      this.metrics.requestsByType[dataType] = {
        hits: 0,
        misses: 0,
        totalRequests: 0,
        totalResponseTime: 0,
        averageResponseTime: 0
      };
    }
    
    const typeMetrics = this.metrics.requestsByType[dataType];
    typeMetrics.totalRequests++;
    typeMetrics.totalResponseTime += metrics.responseTime || 0;
    typeMetrics.averageResponseTime = typeMetrics.totalResponseTime / typeMetrics.totalRequests;
    
    if (metrics.hits) typeMetrics.hits = metrics.hits;
    if (metrics.misses) typeMetrics.misses = metrics.misses;
  }

  // Record request in history
  recordRequest(request) {
    this.requestHistory.unshift(request);
    
    // Keep only recent history
    if (this.requestHistory.length > this.maxHistorySize) {
      this.requestHistory = this.requestHistory.slice(0, this.maxHistorySize);
    }
  }

  // Get current performance metrics
  getMetrics() {
    const now = Date.now();
    const uptime = now - this.metrics.startTime;
    
    const cacheHitRate = this.metrics.totalRequests > 0 
      ? this.metrics.cacheHits / this.metrics.totalRequests 
      : 0;
    
    const errorRate = this.metrics.apiCalls > 0 
      ? this.metrics.errorCount / this.metrics.apiCalls 
      : 0;
    
    const averageResponseTime = this.calculateAverageResponseTime();
    
    return {
      ...this.metrics,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime),
      uptime: Math.round(uptime / 1000), // seconds
      requestsPerMinute: this.calculateRequestsPerMinute(),
      cacheEfficiency: this.calculateCacheEfficiency(),
      performanceGrade: this.calculatePerformanceGrade(cacheHitRate, errorRate, averageResponseTime)
    };
  }

  // Calculate average response time
  calculateAverageResponseTime() {
    const recentRequests = this.requestHistory.slice(0, 100); // Last 100 requests
    if (recentRequests.length === 0) return 0;
    
    const totalTime = recentRequests.reduce((sum, req) => sum + (req.responseTime || 0), 0);
    return totalTime / recentRequests.length;
  }

  // Calculate requests per minute
  calculateRequestsPerMinute() {
    const now = Date.now();
    const lastMinute = now - (60 * 1000);
    
    const recentRequests = this.requestHistory.filter(
      req => req.timestamp > lastMinute
    );
    
    return recentRequests.length;
  }

  // Calculate cache efficiency
  calculateCacheEfficiency() {
    if (this.metrics.totalRequests === 0) return 0;
    
    const cacheHits = this.metrics.cacheHits;
    const totalRequests = this.metrics.totalRequests;
    
    // Cache efficiency considers both hit rate and request reduction
    const hitRate = cacheHits / totalRequests;
    const requestReduction = (cacheHits / totalRequests) * 100;
    
    return {
      hitRate: Math.round(hitRate * 100) / 100,
      requestReduction: Math.round(requestReduction),
      efficiency: Math.round((hitRate + (requestReduction / 100)) / 2 * 100) / 100
    };
  }

  // Calculate performance grade
  calculatePerformanceGrade(cacheHitRate, errorRate, averageResponseTime) {
    let score = 0;
    
    // Cache hit rate (40% weight)
    if (cacheHitRate >= 0.8) score += 40;
    else if (cacheHitRate >= 0.7) score += 30;
    else if (cacheHitRate >= 0.5) score += 20;
    else if (cacheHitRate >= 0.3) score += 10;
    
    // Error rate (30% weight)
    if (errorRate <= 0.01) score += 30;
    else if (errorRate <= 0.03) score += 25;
    else if (errorRate <= 0.05) score += 20;
    else if (errorRate <= 0.1) score += 10;
    
    // Response time (30% weight)
    if (averageResponseTime <= 200) score += 30;
    else if (averageResponseTime <= 500) score += 25;
    else if (averageResponseTime <= 1000) score += 20;
    else if (averageResponseTime <= 2000) score += 10;
    
    // Convert to letter grade
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    if (score >= 30) return 'D';
    return 'F';
  }

  // Get performance report
  getPerformanceReport() {
    const metrics = this.getMetrics();
    const now = new Date();
    
    return {
      timestamp: now.toISOString(),
      summary: {
        totalRequests: metrics.totalRequests,
        cacheHits: metrics.cacheHits,
        cacheMisses: metrics.cacheMisses,
        apiCalls: metrics.apiCalls,
        batchRequests: metrics.batchRequests,
        cacheHitRate: `${Math.round(metrics.cacheHitRate * 100)}%`,
        errorRate: `${Math.round(metrics.errorRate * 100)}%`,
        averageResponseTime: `${metrics.averageResponseTime}ms`,
        performanceGrade: metrics.performanceGrade
      },
      efficiency: metrics.cacheEfficiency,
      uptime: `${Math.round(metrics.uptime / 60)} minutes`,
      requestsPerMinute: metrics.requestsPerMinute,
      byType: this.getTypeMetrics(),
      recommendations: this.getRecommendations(metrics)
    };
  }

  // Get metrics by data type
  getTypeMetrics() {
    const typeMetrics = {};
    
    Object.keys(this.metrics.requestsByType).forEach(dataType => {
      const metrics = this.metrics.requestsByType[dataType];
      const hitRate = metrics.totalRequests > 0 
        ? metrics.hits / metrics.totalRequests 
        : 0;
      
      typeMetrics[dataType] = {
        totalRequests: metrics.totalRequests,
        hits: metrics.hits,
        misses: metrics.misses,
        hitRate: Math.round(hitRate * 100) / 100,
        averageResponseTime: Math.round(metrics.averageResponseTime)
      };
    });
    
    return typeMetrics;
  }

  // Get performance recommendations
  getRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.cacheHitRate < this.thresholds.cacheHitRate) {
      recommendations.push({
        type: 'warning',
        message: `Cache hit rate is ${Math.round(metrics.cacheHitRate * 100)}%. Consider increasing cache TTL or improving cache keys.`,
        priority: 'high'
      });
    }
    
    if (metrics.averageResponseTime > this.thresholds.responseTime) {
      recommendations.push({
        type: 'warning',
        message: `Average response time is ${metrics.averageResponseTime}ms. Consider optimizing cache or reducing data size.`,
        priority: 'medium'
      });
    }
    
    if (metrics.errorRate > this.thresholds.errorRate) {
      recommendations.push({
        type: 'error',
        message: `Error rate is ${Math.round(metrics.errorRate * 100)}%. Check API endpoints and error handling.`,
        priority: 'high'
      });
    }
    
    if (metrics.cacheEfficiency.efficiency > 0.8) {
      recommendations.push({
        type: 'success',
        message: `Excellent cache efficiency! Keep up the good work.`,
        priority: 'low'
      });
    }
    
    return recommendations;
  }

  // Reset metrics
  reset() {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      batchRequests: 0,
      startTime: Date.now(),
      requestsByType: {},
      performanceByType: {},
      errorCount: 0
    };
    
    this.requestHistory = [];
    console.log('🔄 Performance metrics reset');
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      metrics: this.metrics,
      requestHistory: this.requestHistory,
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const cachePerformanceService = new CachePerformanceService();

export default cachePerformanceService;
