/**
 * Configuration Management
 * Centralized config with validation
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  // Server
  port: z.string().default('3000').transform(Number),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  databaseUrl: z.string(),

  // JWT
  jwtSecret: z.string().min(32),
  jwtExpiresIn: z.string().default('7d'),

  // Redis
  redisUrl: z.string(),

  // AI
  anthropicApiKey: z.string(),

  // Google Calendar
  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),
  googleRedirectUri: z.string().optional(),

  // CORS
  corsOrigin: z.string().default('http://localhost:5173'),

  // Rate Limiting
  rateLimitWindowMs: z.string().default('900000').transform(Number),
  rateLimitMaxRequests: z.string().default('100').transform(Number),
});

const envVars = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  redisUrl: process.env.REDIS_URL,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  corsOrigin: process.env.CORS_ORIGIN,
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
};

export const config = configSchema.parse(envVars);
