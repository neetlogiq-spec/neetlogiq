// Service Worker for NeetLogIQ
// Implements aggressive caching for faster loading

const CACHE_NAME = 'neetlogiq-v1';
const STATIC_CACHE = 'neetlogiq-static-v1';
const API_CACHE = 'neetlogiq-api-v1';

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/colleges?limit=10',
  '/api/colleges/filters',
  '/api/health'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static resources...');
        return cache.addAll(STATIC_RESOURCES);
      }),
      caches.open(API_CACHE).then(cache => {
        console.log('🌐 Caching API endpoints...');
        return cache.addAll(API_ENDPOINTS.map(url => 
          new Request(`https://neetlogiq-backend.neetlogiq.workers.dev${url}`)
        ));
      })
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== API_CACHE) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }
  
  // Handle static resources
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Handle images
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Default: network first
  event.respondWith(fetch(request));
});

// Handle API requests with cache-first strategy
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('🎯 API Cache HIT:', request.url);
    
    // Return cached response immediately
    const response = cachedResponse.clone();
    
    // Update cache in background
    fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        console.log('🔄 API Cache updated:', request.url);
      }
    }).catch(error => {
      console.warn('API update failed:', error);
    });
    
    return response;
  }
  
  // Cache miss - fetch from network
  console.log('❌ API Cache MISS:', request.url);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
      console.log('💾 API response cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('API fetch failed:', error);
    throw error;
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('🎯 Static Cache HIT:', request.url);
    return cachedResponse;
  }
  
  // Cache miss - fetch from network
  console.log('❌ Static Cache MISS:', request.url);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('💾 Static resource cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Static fetch failed:', error);
    throw error;
  }
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('🎯 Image Cache HIT:', request.url);
    return cachedResponse;
  }
  
  // Cache miss - fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('💾 Image cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Image fetch failed:', error);
    throw error;
  }
}

// Background sync for offline support
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Background sync implementation
async function doBackgroundSync() {
  try {
    // Sync any pending API requests
    console.log('🔄 Syncing pending requests...');
    // Implementation would depend on your offline queue
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications (if needed)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

console.log('🔧 Service Worker loaded');
