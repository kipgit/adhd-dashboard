/**
 * Request Logger Middleware
 * Tracks API performance for optimization
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;

    // Log slow requests (>300ms violates ADHD-friendly performance requirement)
    if (duration > 300) {
      logger.warn(`SLOW REQUEST: ${message}`);
    } else {
      logger.info(message);
    }
  });

  next();
};
