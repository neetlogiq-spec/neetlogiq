// Performance Optimization Service for NeetLogIQ
// Implements various performance optimizations for faster loading

class PerformanceOptimizer {
  constructor() {
    this.isInitialized = false;
    this.preloadQueue = [];
    this.criticalResources = [];
    this.lazyLoadQueue = [];
  }

  // Initialize performance optimizations
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing performance optimizations...');
    
    // Preload critical resources
    await this.preloadCriticalResources();
    
    // Setup lazy loading
    this.setupLazyLoading();
    
    // Optimize images
    this.optimizeImages();
    
    // Setup service worker for caching
    this.setupServiceWorker();
    
    this.isInitialized = true;
    console.log('✅ Performance optimizations initialized');
  }

  // Preload critical resources
  async preloadCriticalResources() {
    const criticalResources = [
      // Critical CSS
      '/static/css/main.css',
      
      // Critical fonts
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      
      // Critical API endpoints
      '/api/colleges?limit=10',
      '/api/colleges/filters'
    ];

    for (const resource of criticalResources) {
      try {
        if (resource.endsWith('.css')) {
          this.preloadStylesheet(resource);
        } else if (resource.includes('fonts.googleapis.com')) {
          this.preloadStylesheet(resource);
        } else if (resource.startsWith('/api/')) {
          this.preloadAPI(resource);
        }
      } catch (error) {
        console.warn('Failed to preload resource:', resource, error);
      }
    }
  }

  // Preload stylesheet
  preloadStylesheet(href) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }

  // Preload API endpoint
  async preloadAPI(endpoint) {
    try {
      const response = await fetch(`https://neetlogiq-backend.neetlogiq.workers.dev${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        // Store in sessionStorage for immediate access
        sessionStorage.setItem(`preload_${endpoint}`, JSON.stringify(data));
        console.log(`✅ Preloaded API: ${endpoint}`);
      }
    } catch (error) {
      console.warn(`Failed to preload API: ${endpoint}`, error);
    }
  }

  // Setup lazy loading for non-critical components
  setupLazyLoading() {
    // Lazy load heavy components after initial render
    setTimeout(() => {
      this.lazyLoadHeavyComponents();
    }, 1000);
  }

  // Lazy load heavy components
  async lazyLoadHeavyComponents() {
    const heavyComponents = [
      // Search components
      'advancedSearchService',
      'unifiedSearchEngine',
      'typesenseService',
      
      // AI components
      'bmadAI',
      'aiSearchModal',
      
      // Complex UI components
      'vortex',
      'lightVortex'
    ];

    for (const component of heavyComponents) {
      try {
        // Dynamic import for code splitting
        switch (component) {
          case 'advancedSearchService':
            await import('../services/advancedSearchService');
            break;
          case 'unifiedSearchEngine':
            await import('../services/unifiedSearchEngine');
            break;
          case 'typesenseService':
            await import('../services/typesenseService');
            break;
          case 'bmadAI':
            await import('../services/bmadAI');
            break;
          case 'aiSearchModal':
            await import('../components/AISearchModal');
            break;
        }
        console.log(`✅ Lazy loaded: ${component}`);
      } catch (error) {
        console.warn(`Failed to lazy load: ${component}`, error);
      }
    }
  }

  // Optimize images
  optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading="lazy" for images below the fold
      if (img.getBoundingClientRect().top > window.innerHeight) {
        img.loading = 'lazy';
      }
      
      // Add decoding="async" for better performance
      img.decoding = 'async';
    });
  }

  // Setup service worker for aggressive caching
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch(error => {
          console.warn('Service Worker registration failed:', error);
        });
    }
  }

  // Optimize bundle loading
  optimizeBundleLoading() {
    // Preload next route chunks
    const routes = ['/colleges', '/courses', '/cutoffs', '/about'];
    
    routes.forEach(route => {
      // Preload route chunks after initial load
      setTimeout(() => {
        this.preloadRoute(route);
      }, 2000);
    });
  }

  // Preload route
  async preloadRoute(route) {
    try {
      // This would preload the route's JavaScript chunk
      // Implementation depends on your routing setup
      console.log(`🔄 Preloading route: ${route}`);
    } catch (error) {
      console.warn(`Failed to preload route: ${route}`, error);
    }
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    return {
      // Page load metrics
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      
      // Paint metrics
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      
      // Resource metrics
      totalResources: performance.getEntriesByType('resource').length,
      totalSize: performance.getEntriesByType('resource').reduce((sum, r) => sum + (r.transferSize || 0), 0)
    };
  }

  // Optimize for mobile
  optimizeForMobile() {
    // Reduce animations on mobile
    if (window.innerWidth < 768) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }
    
    // Reduce particle count on mobile
    if (window.innerWidth < 768) {
      const vortexElements = document.querySelectorAll('[data-particle-count]');
      vortexElements.forEach(el => {
        const currentCount = parseInt(el.dataset.particleCount);
        el.dataset.particleCount = Math.floor(currentCount * 0.3);
      });
    }
  }

  // Cleanup
  cleanup() {
    this.preloadQueue = [];
    this.criticalResources = [];
    this.lazyLoadQueue = [];
    this.isInitialized = false;
  }
}

// Create singleton instance
const performanceOptimizer = new PerformanceOptimizer();

export default performanceOptimizer;
