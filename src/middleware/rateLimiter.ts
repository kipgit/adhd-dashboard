/**
 * Rate Limiter
 * Protects against abuse while being generous for normal use
 */

import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'You\'re going too fast! Take a breath, and try again in a few minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// More generous limit for brain dumps (we never want to block capturing thoughts!)
export const brainDumpLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: 500, // 500 brain dumps per 15 minutes is very generous
  message: {
    success: false,
    message: 'Wow, that\'s a lot of thoughts! Take a quick break.',
  },
});
