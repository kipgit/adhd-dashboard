/**
 * ADHD Dashboard Backend
 * Main application entry point
 * Design: Radical simplicity, maximum automation, built-in grace
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import routes from './routes';
import { startBackgroundJobs } from './jobs';
import { logger } from './utils/logger';

const app = express();

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// ============================================================================
// PARSING MIDDLEWARE
// ============================================================================
app.use(express.json({ limit: '10mb' })); // Support voice recordings
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// LOGGING
// ============================================================================
app.use(requestLogger);

// ============================================================================
// HEALTH CHECK (for monitoring)
// ============================================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================================================
// API ROUTES
// ============================================================================
app.use('/api', routes);

// ============================================================================
// ERROR HANDLING
// ============================================================================
app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================
const PORT = config.port;

app.listen(PORT, async () => {
  logger.info(`🚀 ADHD Dashboard API running on port ${PORT}`);
  logger.info(`📊 Environment: ${config.nodeEnv}`);
  logger.info(`🎯 CORS enabled for: ${config.corsOrigin}`);

  // Start background automation jobs
  if (config.nodeEnv === 'production' || config.nodeEnv === 'development') {
    await startBackgroundJobs();
    logger.info('⏰ Background jobs started');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
