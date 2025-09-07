// Security Service for Input Validation and Sanitization
import DOMPurify from 'dompurify';
import validator from 'validator';

class SecurityService {
  constructor() {
    this.maxQueryLength = 100;
    this.maxSearchResults = 50;
    this.blockedPatterns = new Set();
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

  // Validate and sanitize search input
  validateSearchInput(input) {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', error: 'Invalid input type' };
    }

    // Check length
    if (input.length > this.maxQueryLength) {
      return { 
        isValid: false, 
        sanitized: '', 
        error: `Query too long. Maximum ${this.maxQueryLength} characters allowed.` 
      };
    }

    // Check for malicious patterns using advanced detection
    const threats = this.detectMaliciousPatterns(input);
    if (threats.length > 0) {
      console.warn('🚨 Malicious patterns detected:', threats, 'in input:', input);
      this.logSecurityEvent('MALICIOUS_PATTERN_DETECTED', {
        input,
        threats,
        userAgent: navigator.userAgent
      });
      
      return { 
        isValid: false, 
        sanitized: '', 
        error: `Security threat detected: ${threats[0].description}. Please use only safe search terms.` 
      };
    }

    // Basic validation
    if (!validator.isLength(input, { min: 1, max: this.maxQueryLength })) {
      return { 
        isValid: false, 
        sanitized: '', 
        error: 'Invalid input length' 
      };
    }

    // Sanitize HTML content
    const sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });

    // Remove any remaining HTML tags
    const cleanInput = sanitized.replace(/<[^>]*>/g, '');

    // Additional validation - allow common characters in college names
    if (!validator.isAlphanumeric(cleanInput.replace(/[\s\-_&.'"]/g, ''))) {
      return { 
        isValid: false, 
        sanitized: '', 
        error: 'Only alphanumeric characters, spaces, hyphens, underscores, ampersands, periods, and apostrophes are allowed' 
      };
    }

    return { 
      isValid: true, 
      sanitized: cleanInput.trim(), 
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
      const validation = this.validateSearchInput(params.q);
      if (!validation.isValid) {
        errors.push(validation.error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedParams: {
        ...params,
        q: params.q ? this.validateSearchInput(params.q).sanitized : params.q
      }
    };
  }

  // Rate limiting check (client-side)
  checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests from localStorage
    const requests = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
    
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
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(recentRequests));
    
    return { 
      allowed: true, 
      remaining: maxRequests - recentRequests.length, 
      resetTime: now + windowMs 
    };
  }

  // Advanced malicious pattern detection
  detectMaliciousPatterns(input) {
    const threats = [];
    
    // SQL Injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|OR|AND)\b)/gi,
      /(\b(UNION\s+SELECT|SELECT\s+.*\s+FROM|INSERT\s+INTO|UPDATE\s+.*\s+SET|DELETE\s+FROM)\b)/gi,
      /(\b(OR\s+1=1|AND\s+1=1|OR\s+'1'='1'|AND\s+'1'='1')\b)/gi,
      /(\b(UNION\s+ALL\s+SELECT|SELECT\s+.*\s+FROM\s+.*\s+WHERE)\b)/gi,
      /(\b(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS|SYSUSERS|SYSXLOGINS)\b)/gi,
      /(\b(CHAR|ASCII|SUBSTRING|LEN|LENGTH|COUNT|SUM|AVG|MIN|MAX)\b)/gi,
      /(\b(WAITFOR\s+DELAY|BENCHMARK|SLEEP|PG_SLEEP)\b)/gi,
      /(\b(LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE)\b)/gi,
      /(\b(EXEC\s+sp_|EXEC\s+xp_|EXEC\s+cmdshell)\b)/gi,
      /(\b(CAST|CONVERT|ISNULL|COALESCE)\b)/gi
    ];
    
    // XSS patterns
    const xssPatterns = [
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
      /encoding/gi
    ];
    
    // Command injection patterns
    const commandPatterns = [
      /(\b(cmd|command|exec|system|shell|bash|sh|powershell|ps1|bat|cmd)\b)/gi,
      /(\b(rm|del|delete|remove|mkdir|rd|md|copy|move|ren|rename)\b)/gi,
      /(\b(dir|ls|cat|type|more|less|head|tail|grep|find|search)\b)/gi,
      /(\b(net|netstat|ipconfig|ifconfig|ping|tracert|traceroute)\b)/gi,
      /(\b(reg|registry|regedit|regsvr32|rundll32)\b)/gi,
      /(\b(wget|curl|ftp|telnet|ssh|scp|rsync)\b)/gi,
      /(\b(echo|print|printf|sprintf|fprintf)\b)/gi,
      /(\b(exit|quit|halt|shutdown|reboot|restart)\b)/gi,
      /(\b(chmod|chown|chgrp|chattr|lsattr)\b)/gi,
      /(\b(sudo|su|runas|impersonate)\b)/gi
    ];
    
    // Check for SQL injection
    sqlPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'SQL_INJECTION',
          pattern: pattern.source,
          severity: 'HIGH',
          description: 'Potential SQL injection attack detected'
        });
      }
    });
    
    // Check for XSS
    xssPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'XSS',
          pattern: pattern.source,
          severity: 'HIGH',
          description: 'Potential XSS attack detected'
        });
      }
    });
    
    // Check for command injection
    commandPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'COMMAND_INJECTION',
          pattern: pattern.source,
          severity: 'CRITICAL',
          description: 'Potential command injection attack detected'
        });
      }
    });
    
    return threats;
  }

  // Log security events
  logSecurityEvent(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.warn('🚨 Security Event:', logEntry);
    
    // Store in localStorage for debugging
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));
  }
}

const securityService = new SecurityService();
export default securityService;
