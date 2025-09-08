// Smart Cache Invalidation Service for NeetLogIQ
// Implements intelligent cache invalidation strategies

import cacheService from './cacheService';

class CacheInvalidationService {
  constructor() {
    this.invalidationRules = {
      // Data type dependencies
      dependencies: {
        colleges: ['searchIndex', 'filters'],
        courses: ['searchIndex'],
        filters: ['colleges'],
        searchIndex: ['colleges', 'courses']
      },
      
      // Time-based invalidation rules
      timeRules: {
        colleges: 60 * 60 * 1000, // 1 hour
        courses: 30 * 60 * 1000,  // 30 minutes
        filters: 30 * 60 * 1000,  // 30 minutes
        searchIndex: 2 * 60 * 60 * 1000, // 2 hours
        cutoffs: 24 * 60 * 60 * 1000, // 24 hours
        static: 24 * 60 * 60 * 1000 // 24 hours
      },
      
      // Event-based invalidation triggers
      eventTriggers: {
        dataUpdate: ['colleges', 'courses', 'filters', 'searchIndex'],
        filterChange: ['colleges', 'courses'],
        searchQuery: ['searchIndex'],
        userAction: ['static']
      }
    };
    
    this.invalidationHistory = [];
    this.maxHistorySize = 100;
  }

  // Invalidate cache based on data type
  invalidateByType(dataType, reason = 'manual') {
    try {
      console.log(`🗑️ Invalidating cache for type: ${dataType} (${reason})`);
      
      // Clear the main data type
      cacheService.clearType(dataType);
      
      // Clear dependent data types
      const dependencies = this.invalidationRules.dependencies[dataType] || [];
      dependencies.forEach(depType => {
        console.log(`🗑️ Invalidating dependent cache: ${depType}`);
        cacheService.clearType(depType);
      });
      
      // Record invalidation
      this.recordInvalidation(dataType, reason, dependencies);
      
      console.log(`✅ Cache invalidation completed for ${dataType}`);
      return true;
    } catch (error) {
      console.error('❌ Cache invalidation failed:', error);
      return false;
    }
  }

  // Invalidate cache based on event
  invalidateByEvent(eventType, data = {}) {
    try {
      console.log(`🎯 Event-based cache invalidation: ${eventType}`);
      
      const affectedTypes = this.invalidationRules.eventTriggers[eventType] || [];
      
      affectedTypes.forEach(dataType => {
        this.invalidateByType(dataType, `event:${eventType}`);
      });
      
      // Special handling for specific events
      switch (eventType) {
        case 'dataUpdate':
          this.handleDataUpdateEvent(data);
          break;
        case 'filterChange':
          this.handleFilterChangeEvent(data);
          break;
        case 'searchQuery':
          this.handleSearchQueryEvent(data);
          break;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Event-based invalidation failed:', error);
      return false;
    }
  }

  // Smart invalidation based on data changes
  smartInvalidate(oldData, newData, dataType) {
    try {
      console.log(`🧠 Smart cache invalidation for ${dataType}`);
      
      // Check if data has actually changed
      if (this.isDataEqual(oldData, newData)) {
        console.log('📊 No data changes detected, skipping invalidation');
        return false;
      }
      
      // Determine what changed
      const changes = this.detectChanges(oldData, newData);
      
      // Invalidate based on changes
      if (changes.structure) {
        // Major structural changes - invalidate everything
        this.invalidateByType(dataType, 'structural_change');
        this.invalidateByType('searchIndex', 'structural_change');
      } else if (changes.content) {
        // Content changes - invalidate related caches
        this.invalidateByType(dataType, 'content_change');
        if (dataType === 'colleges') {
          this.invalidateByType('searchIndex', 'content_change');
        }
      } else if (changes.metadata) {
        // Metadata changes - minimal invalidation
        this.invalidateByType(dataType, 'metadata_change');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Smart invalidation failed:', error);
      return false;
    }
  }

  // Time-based cache cleanup
  cleanupExpiredCache() {
    try {
      console.log('🧹 Cleaning up expired cache entries...');
      
      const stats = cacheService.getStats();
      if (!stats) return;
      
      console.log(`📊 Cache stats before cleanup:`, stats);
      
      // Clear expired entries
      cacheService.clearOldEntries();
      
      const newStats = cacheService.getStats();
      console.log(`📊 Cache stats after cleanup:`, newStats);
      
      return newStats;
    } catch (error) {
      console.error('❌ Cache cleanup failed:', error);
      return null;
    }
  }

  // Invalidate cache for specific filters
  invalidateFilterCache(filters) {
    try {
      console.log('🔍 Invalidating filter-specific cache...');
      
      // Get all cache keys
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('neetlogiq_'));
      
      // Find keys that match the filter criteria
      const keysToInvalidate = cacheKeys.filter(key => {
        try {
          const entry = JSON.parse(localStorage.getItem(key));
          if (!entry || !entry.params) return false;
          
          // Check if any filter parameter matches
          return Object.keys(filters).some(filterKey => 
            entry.params[filterKey] === filters[filterKey]
          );
        } catch (error) {
          return false;
        }
      });
      
      // Remove matching keys
      keysToInvalidate.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed filter cache: ${key}`);
      });
      
      console.log(`✅ Invalidated ${keysToInvalidate.length} filter cache entries`);
      return keysToInvalidate.length;
    } catch (error) {
      console.error('❌ Filter cache invalidation failed:', error);
      return 0;
    }
  }

  // Helper methods
  isDataEqual(oldData, newData) {
    if (!oldData || !newData) return false;
    if (oldData.length !== newData.length) return false;
    
    // Simple comparison - can be enhanced
    return JSON.stringify(oldData) === JSON.stringify(newData);
  }

  detectChanges(oldData, newData) {
    const changes = {
      structure: false,
      content: false,
      metadata: false
    };
    
    if (!oldData || !newData) {
      changes.structure = true;
      return changes;
    }
    
    // Check structure changes
    if (oldData.length !== newData.length) {
      changes.structure = true;
    }
    
    // Check content changes
    if (oldData.some((item, index) => {
      const newItem = newData[index];
      return !newItem || item.id !== newItem.id || item.name !== newItem.name;
    })) {
      changes.content = true;
    }
    
    // Check metadata changes
    if (oldData.some((item, index) => {
      const newItem = newData[index];
      return newItem && (
        item.updated_at !== newItem.updated_at ||
        item.status !== newItem.status
      );
    })) {
      changes.metadata = true;
    }
    
    return changes;
  }

  recordInvalidation(dataType, reason, dependencies = []) {
    const record = {
      timestamp: Date.now(),
      dataType,
      reason,
      dependencies,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.invalidationHistory.unshift(record);
    
    // Keep only recent history
    if (this.invalidationHistory.length > this.maxHistorySize) {
      this.invalidationHistory = this.invalidationHistory.slice(0, this.maxHistorySize);
    }
  }

  // Event handlers
  handleDataUpdateEvent(data) {
    console.log('📊 Handling data update event:', data);
    // Additional logic for data updates
  }

  handleFilterChangeEvent(data) {
    console.log('🔍 Handling filter change event:', data);
    // Invalidate filter-specific cache
    this.invalidateFilterCache(data.filters || {});
  }

  handleSearchQueryEvent(data) {
    console.log('🔍 Handling search query event:', data);
    // Invalidate search-related cache
    this.invalidateByType('searchIndex', 'search_query');
  }

  // Get invalidation statistics
  getInvalidationStats() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    
    const recentInvalidations = this.invalidationHistory.filter(
      record => record.timestamp > last24h
    );
    
    const stats = {
      totalInvalidations: this.invalidationHistory.length,
      recentInvalidations: recentInvalidations.length,
      byType: {},
      byReason: {},
      lastInvalidation: this.invalidationHistory[0]?.timestamp || null
    };
    
    // Count by type and reason
    recentInvalidations.forEach(record => {
      stats.byType[record.dataType] = (stats.byType[record.dataType] || 0) + 1;
      stats.byReason[record.reason] = (stats.byReason[record.reason] || 0) + 1;
    });
    
    return stats;
  }

  // Clear all cache
  clearAllCache() {
    try {
      console.log('🧹 Clearing all cache...');
      cacheService.clear();
      this.invalidationHistory = [];
      console.log('✅ All cache cleared');
      return true;
    } catch (error) {
      console.error('❌ Clear all cache failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const cacheInvalidationService = new CacheInvalidationService();

export default cacheInvalidationService;
