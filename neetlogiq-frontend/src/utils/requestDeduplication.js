/**
 * Request Deduplication Utility
 * Prevents duplicate API calls for the same request
 */

class RequestDeduplication {
  constructor() {
    this.pendingRequests = new Map();
    this.requestTimeout = 30000; // 30 seconds timeout for pending requests
  }

  /**
   * Generate request key from parameters
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {string} - Request key
   */
  generateKey(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    const headers = options.headers ? JSON.stringify(options.headers) : '';
    return `${method}:${url}:${body}:${headers}`;
  }

  /**
   * Execute request with deduplication
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise<any>} - Request result
   */
  async execute(url, options = {}) {
    const key = this.generateKey(url, options);
    
    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      console.log('🔄 Request deduplication: reusing pending request for', url);
      return this.pendingRequests.get(key);
    }

    // Create new request
    const requestPromise = this.makeRequest(url, options);
    
    // Store the promise
    this.pendingRequests.set(key, requestPromise);

    // Set timeout to clean up the request
    setTimeout(() => {
      this.pendingRequests.delete(key);
    }, this.requestTimeout);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up the request when it completes
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Make the actual request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise<any>} - Request result
   */
  async makeRequest(url, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    };

    const requestOptions = { ...defaultOptions, ...options };

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAll() {
    this.pendingRequests.clear();
  }

  /**
   * Cancel specific request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   */
  cancel(url, options = {}) {
    const key = this.generateKey(url, options);
    this.pendingRequests.delete(key);
  }

  /**
   * Get pending requests count
   * @returns {number} - Number of pending requests
   */
  getPendingCount() {
    return this.pendingRequests.size;
  }

  /**
   * Get pending requests info
   * @returns {Array} - Array of pending request keys
   */
  getPendingRequests() {
    return Array.from(this.pendingRequests.keys());
  }
}

// Create and export singleton instance
const requestDeduplication = new RequestDeduplication();

export default requestDeduplication;
