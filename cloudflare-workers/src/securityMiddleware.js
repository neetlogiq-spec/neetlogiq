// Security Middleware for Cloudflare Workers
import validator from 'validator';

class SecurityMiddleware {
  constructor() {
    this.maxQueryLength = 100;
    this.maxSearchResults = 50;
    this.maxRequestSize = 1024 * 1024; // 1MB
    this.maxUrlLength = 2048;
    this.maxParameters = 20;
    this.rateLimitStore = new Map();
    this.blockedIPs = new Set();
    this.suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<meta[^>]*>.*?<\/meta>/gi,
      /<style[^>]*>.*?<\/style>/gi,
      /expression\s*\(/gi,
      /url\s*\(/gi,
      /@import/gi,
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /Function\s*\(/gi,
      /alert\s*\(/gi,
      /confirm\s*\(/gi,
      /prompt\s*\(/gi,
      /document\./gi,
      /window\./gi,
      /location\./gi,
      /history\./gi,
      /navigator\./gi,
      /screen\./gi,
      /localStorage/gi,
      /sessionStorage/gi,
      /cookie/gi,
      /XMLHttpRequest/gi,
      /fetch\s*\(/gi,
      /import\s*\(/gi,
      /require\s*\(/gi,
      /module\./gi,
      /process\./gi,
      /global/gi,
      /this\./gi,
      /self\./gi,
      /parent\./gi,
      /top\./gi,
      /frames/gi,
      /contentWindow/gi,
      /contentDocument/gi,
      /srcdoc/gi,
      /data:/gi,
      /vbscript:/gi,
      /mocha:/gi,
      /livescript:/gi,
      /charset/gi,
      /encoding/gi,
      /&#/gi,
      /&#x/gi,
      /%3C/gi,
      /%3E/gi,
      /%22/gi,
      /%27/gi,
      /%2F/gi,
      /%5C/gi,
      /%00/gi,
      /%0A/gi,
      /%0D/gi,
      /%09/gi,
      /%20/gi,
      /%2B/gi,
      /%2D/gi,
      /%2E/gi,
      /%2F/gi,
      /%3A/gi,
      /%3B/gi,
      /%3C/gi,
      /%3D/gi,
      /%3E/gi,
      /%3F/gi,
      /%40/gi,
      /%5B/gi,
      /%5C/gi,
      /%5D/gi,
      /%5E/gi,
      /%5F/gi,
      /%60/gi,
      /%7B/gi,
      /%7C/gi,
      /%7D/gi,
      /%7E/gi,
      /%7F/gi,
      /%80/gi,
      /%81/gi,
      /%82/gi,
      /%83/gi,
      /%84/gi,
      /%85/gi,
      /%86/gi,
      /%87/gi,
      /%88/gi,
      /%89/gi,
      /%8A/gi,
      /%8B/gi,
      /%8C/gi,
      /%8D/gi,
      /%8E/gi,
      /%8F/gi,
      /%90/gi,
      /%91/gi,
      /%92/gi,
      /%93/gi,
      /%94/gi,
      /%95/gi,
      /%96/gi,
      /%97/gi,
      /%98/gi,
      /%99/gi,
      /%9A/gi,
      /%9B/gi,
      /%9C/gi,
      /%9D/gi,
      /%9E/gi,
      /%9F/gi,
      /%A0/gi,
      /%A1/gi,
      /%A2/gi,
      /%A3/gi,
      /%A4/gi,
      /%A5/gi,
      /%A6/gi,
      /%A7/gi,
      /%A8/gi,
      /%A9/gi,
      /%AA/gi,
      /%AB/gi,
      /%AC/gi,
      /%AD/gi,
      /%AE/gi,
      /%AF/gi,
      /%B0/gi,
      /%B1/gi,
      /%B2/gi,
      /%B3/gi,
      /%B4/gi,
      /%B5/gi,
      /%B6/gi,
      /%B7/gi,
      /%B8/gi,
      /%B9/gi,
      /%BA/gi,
      /%BB/gi,
      /%BC/gi,
      /%BD/gi,
      /%BE/gi,
      /%BF/gi,
      /%C0/gi,
      /%C1/gi,
      /%C2/gi,
      /%C3/gi,
      /%C4/gi,
      /%C5/gi,
      /%C6/gi,
      /%C7/gi,
      /%C8/gi,
      /%C9/gi,
      /%CA/gi,
      /%CB/gi,
      /%CC/gi,
      /%CD/gi,
      /%CE/gi,
      /%CF/gi,
      /%D0/gi,
      /%D1/gi,
      /%D2/gi,
      /%D3/gi,
      /%D4/gi,
      /%D5/gi,
      /%D6/gi,
      /%D7/gi,
      /%D8/gi,
      /%D9/gi,
      /%DA/gi,
      /%DB/gi,
      /%DC/gi,
      /%DD/gi,
      /%DE/gi,
      /%DF/gi,
      /%E0/gi,
      /%E1/gi,
      /%E2/gi,
      /%E3/gi,
      /%E4/gi,
      /%E5/gi,
      /%E6/gi,
      /%E7/gi,
      /%E8/gi,
      /%E9/gi,
      /%EA/gi,
      /%EB/gi,
      /%EC/gi,
      /%ED/gi,
      /%EE/gi,
      /%EF/gi,
      /%F0/gi,
      /%F1/gi,
      /%F2/gi,
      /%F3/gi,
      /%F4/gi,
      /%F5/gi,
      /%F6/gi,
      /%F7/gi,
      /%F8/gi,
      /%F9/gi,
      /%FA/gi,
      /%FB/gi,
      /%FC/gi,
      /%FD/gi,
      /%FE/gi,
      /%FF/gi
    ];
  }

  // Get client IP from request
  getClientIP(request) {
    const cfConnectingIp = request.headers.get('CF-Connecting-IP');
    const xForwardedFor = request.headers.get('X-Forwarded-For');
    const xRealIp = request.headers.get('X-Real-IP');
    
    return cfConnectingIp || xForwardedFor || xRealIp || 'unknown';
  }

  // Rate limiting check
  checkRateLimit(ip, maxRequests = 100, windowMs = 60000) {
    const now = Date.now();
    const key = `rate_limit_${ip}`;
    
    if (!this.rateLimitStore.has(key)) {
      this.rateLimitStore.set(key, []);
    }
    
    const requests = this.rateLimitStore.get(key);
    const windowStart = now - windowMs;
    
    // Filter requests within the current window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: recentRequests[0] + windowMs 
      };
    }
    
    // Add current request
    recentRequests.push(now);
    this.rateLimitStore.set(key, recentRequests);
    
    return { 
      allowed: true, 
      remaining: maxRequests - recentRequests.length, 
      resetTime: now + windowMs 
    };
  }

  // Validate and sanitize input
  validateInput(input) {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', error: 'Invalid input type' };
    }

    // Check length
    if (input.length > this.maxQueryLength) {
      return { 
        isValid: false, 
        sanitized: '', 
        error: `Input too long. Maximum ${this.maxQueryLength} characters allowed.` 
      };
    }

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(input)) {
        console.warn('🚨 Suspicious pattern detected:', pattern, 'in input:', input);
        return { 
          isValid: false, 
          sanitized: '', 
          error: 'Suspicious content detected' 
        };
      }
    }

    // Basic validation
    if (!validator.isLength(input, { min: 1, max: this.maxQueryLength })) {
      return { 
        isValid: false, 
        sanitized: '', 
        error: 'Invalid input length' 
      };
    }

    // Sanitize input
    const sanitized = input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove remaining angle brackets
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .replace(/[()]/g, '') // Remove parentheses
      .replace(/[{}]/g, '') // Remove braces
      .replace(/[\[\]]/g, '') // Remove square brackets
      .replace(/[\\]/g, '') // Remove backslashes
      .replace(/[\/]/g, '') // Remove forward slashes
      .replace(/[|]/g, '') // Remove pipes
      .replace(/[&]/g, '') // Remove ampersands
      .replace(/[=]/g, '') // Remove equals
      .replace(/[+]/g, '') // Remove plus signs
      .replace(/[%]/g, '') // Remove percent signs
      .replace(/[#]/g, '') // Remove hash signs
      .replace(/[!]/g, '') // Remove exclamation marks
      .replace(/[@]/g, '') // Remove at signs
      .replace(/[$]/g, '') // Remove dollar signs
      .replace(/[^]/g, '') // Remove caret
      .replace(/[~]/g, '') // Remove tilde
      .replace(/[`]/g, '') // Remove backticks
      .replace(/[?]/g, '') // Remove question marks
      .replace(/[>]/g, '') // Remove greater than
      .replace(/[<]/g, '') // Remove less than
      .replace(/[^a-zA-Z0-9\s\-_]/g, '') // Keep only alphanumeric, spaces, hyphens, underscores
      .trim();

    return { 
      isValid: true, 
      sanitized, 
      error: null 
    };
  }

  // Validate API parameters
  validateApiParams(params) {
    const errors = [];

    // Validate page parameter
    if (params.page !== undefined) {
      const page = parseInt(params.page);
      if (isNaN(page) || page < 1 || page > 1000) {
        errors.push('Page must be a number between 1 and 1000');
      }
    }

    // Validate limit parameter
    if (params.limit !== undefined) {
      const limit = parseInt(params.limit);
      if (isNaN(limit) || limit < 1 || limit > this.maxSearchResults) {
        errors.push(`Limit must be a number between 1 and ${this.maxSearchResults}`);
      }
    }

    // Validate search query
    if (params.q !== undefined) {
      const validation = this.validateInput(params.q);
      if (!validation.isValid) {
        errors.push(validation.error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedParams: {
        ...params,
        q: params.q ? this.validateInput(params.q).sanitized : params.q
      }
    };
  }

  // Security headers
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    };
  }

  // Log security events
  logSecurityEvent(event, details = {}, request) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      ip: this.getClientIP(request),
      userAgent: request.headers.get('User-Agent'),
      url: request.url
    };
    
    console.warn('🚨 Security Event:', logEntry);
    
    // Store in database if available
    // This would be implemented with your database
  }

  // Validate request size and parameters
  validateRequestSize(request) {
    const url = new URL(request.url);
    
    // Check URL length
    if (url.href.length > this.maxUrlLength) {
      return { 
        isValid: false, 
        error: `URL too long. Maximum ${this.maxUrlLength} characters allowed.` 
      };
    }
    
    // Check number of parameters
    const paramCount = url.searchParams.size;
    if (paramCount > this.maxParameters) {
      return { 
        isValid: false, 
        error: `Too many parameters. Maximum ${this.maxParameters} parameters allowed.` 
      };
    }
    
    // Check Content-Length header
    const contentLength = request.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > this.maxRequestSize) {
      return { 
        isValid: false, 
        error: `Request too large. Maximum ${this.maxRequestSize} bytes allowed.` 
      };
    }
    
    return { isValid: true, error: null };
  }

  // Main security middleware
  async securityMiddleware(request, env, ctx) {
    const ip = this.getClientIP(request);
    
    // Check if IP is blocked
    if (this.blockedIPs.has(ip)) {
      this.logSecurityEvent('BLOCKED_IP_ACCESS', { ip }, request);
      return new Response(JSON.stringify({ 
        error: 'Access denied',
        message: 'Your IP has been blocked due to suspicious activity'
      }), { 
        status: 403, 
        headers: { 
          ...this.getSecurityHeaders(),
          'Content-Type': 'application/json' 
        } 
      });
    }

    // Validate request size
    const sizeValidation = this.validateRequestSize(request);
    if (!sizeValidation.isValid) {
      this.logSecurityEvent('REQUEST_SIZE_EXCEEDED', { 
        ip, 
        error: sizeValidation.error,
        url: request.url 
      }, request);
      
      return new Response(JSON.stringify({ 
        error: 'Request too large',
        message: sizeValidation.error
      }), { 
        status: 413, 
        headers: { 
          ...this.getSecurityHeaders(),
          'Content-Type': 'application/json' 
        } 
      });
    }

    // Rate limiting
    const rateLimit = this.checkRateLimit(ip);
    if (!rateLimit.allowed) {
      this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip, rateLimit }, request);
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }), { 
        status: 429, 
        headers: { 
          ...this.getSecurityHeaders(),
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
        } 
      });
    }

    // Validate request parameters
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    
    const validation = this.validateApiParams(params);
    if (!validation.isValid) {
      this.logSecurityEvent('INVALID_PARAMS', { 
        ip, 
        params, 
        errors: validation.errors 
      }, request);
      
      return new Response(JSON.stringify({ 
        error: 'Invalid parameters',
        message: validation.errors.join(', ')
      }), { 
        status: 400, 
        headers: { 
          ...this.getSecurityHeaders(),
          'Content-Type': 'application/json' 
        } 
      });
    }

    // Add security headers to response
    const response = await this.handleRequest(request, env, ctx);
    const headers = new Headers(response.headers);
    
    Object.entries(this.getSecurityHeaders()).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  // Placeholder for actual request handling
  async handleRequest(request, env, ctx) {
    // This would be implemented with your actual request handling logic
    return new Response('OK', { status: 200 });
  }
}

export default new SecurityMiddleware();
