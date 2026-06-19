import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Configures CSP, XSS protection, and frameguard security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      connectSrc: ["'self'", "http://localhost:5000"]
    }
  }
});

// General application rate limiting (15 min window, 200 requests max)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Authentication rate limiting (strict: 15 min window, 10 attempts max)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    message: 'Too many authentication attempts. Access blocked for 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
