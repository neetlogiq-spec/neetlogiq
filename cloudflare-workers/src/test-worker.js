// Simple test worker to check if basic functionality works
import { Router } from 'itty-router';

// Initialize router
const router = Router();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Health check endpoint
router.get('/api/health', async (request, env) => {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'cloudflare-worker-test',
    port: '8791'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

// Handle CORS preflight requests
router.options('*', () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
});

// 404 handler
router.all('*', () => {
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: 'The requested resource was not found'
  }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

// Fetch handler
export default {
  async fetch(request, env, ctx) {
    try {
      // Handle the request with router
      return await router.handle(request, env, ctx);
    } catch (error) {
      console.error('Request failed:', error);
      
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
