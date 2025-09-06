// Minimal worker with essential functionality
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
    server: 'cloudflare-worker-minimal',
    port: '8794'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

// Debug endpoint
router.get('/api/debug', async (request, env) => {
  const services = {
    AI: !!env.AI,
    Vectorize: !!env.VECTORIZE_INDEX,
    Database: !!env.DB,
    Environment: env.ENVIRONMENT || 'unknown'
  };
  
  return new Response(JSON.stringify({
    services,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

// Test database endpoint
router.get('/api/test-db', async (request, env) => {
  try {
    if (!env.DB) {
      return new Response(JSON.stringify({
        error: 'Database not available'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const result = await env.DB.prepare('SELECT 1 as test').first();
    
    return new Response(JSON.stringify({
      success: true,
      result,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Database error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
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
