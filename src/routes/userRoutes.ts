/**
 * User Routes
 * Preferences and energy tracking
 */

import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { prisma } from '../db/client';
import { z } from 'zod';
import { EnergyLevel } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/users/preferences
 * Get user preferences
 */
router.get('/preferences', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const preferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  res.json({
    success: true,
    data: { preferences },
  });
}));

/**
 * PATCH /api/users/preferences
 * Update user preferences
 */
const updatePreferencesSchema = z.object({
  survivalModeEnabled: z.boolean().optional(),
  survivalModeTaskLimit: z.number().optional(),
  reducedMotion: z.boolean().optional(),
  highContrast: z.enum(['STANDARD', 'HIGH', 'MAXIMUM']).optional(),
  dyslexicFont: z.boolean().optional(),
  defaultTaskBreakdown: z.boolean().optional(),
  celebrationsEnabled: z.boolean().optional(),
  timeBlindnessMode: z.boolean().optional(),
  pomodoroLength: z.number().optional(),
  pomodoroBreakLength: z.number().optional(),
});

router.patch('/preferences', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const validated = updatePreferencesSchema.parse(req.body);

  const preferences = await prisma.userPreferences.upsert({
    where: { userId },
    update: validated,
    create: {
      userId,
      ...validated,
    },
  });

  res.json({
    success: true,
    message: 'Preferences updated!',
    data: { preferences },
  });
}));

/**
 * POST /api/users/energy
 * Log current energy level
 */
const energyLogSchema = z.object({
  energyLevel: z.enum(['HIGH', 'MEDIUM', 'LOW', 'CREATIVE']),
  notes: z.string().optional(),
});

router.post('/energy', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const validated = energyLogSchema.parse(req.body);

  // Create energy log
  const log = await prisma.energyLog.create({
    data: {
      userId,
      energyLevel: validated.energyLevel,
      notes: validated.notes,
    },
  });

  // Update user's current energy level
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentEnergyLevel: validated.energyLevel,
    },
  });

  res.json({
    success: true,
    message: 'Energy level updated!',
    data: { log },
  });
}));

/**
 * GET /api/users/energy/patterns
 * Get energy patterns over time
 */
router.get('/energy/patterns', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const logs = await prisma.energyLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: 100, // Last 100 logs
  });

  // Analyze patterns by hour of day
  const hourlyPatterns: Record<number, { high: number; medium: number; low: number; creative: number }> = {};

  logs.forEach(log => {
    const hour = log.timestamp.getHours();
    if (!hourlyPatterns[hour]) {
      hourlyPatterns[hour] = { high: 0, medium: 0, low: 0, creative: 0 };
    }

    const levelKey = log.energyLevel.toLowerCase() as 'high' | 'medium' | 'low' | 'creative';
    hourlyPatterns[hour][levelKey]++;
  });

  // Find best hours for each energy level
  const insights = {
    bestHighEnergyHours: Object.entries(hourlyPatterns)
      .sort(([, a], [, b]) => b.high - a.high)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour)),

    bestCreativeHours: Object.entries(hourlyPatterns)
      .sort(([, a], [, b]) => b.creative - a.creative)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour)),
  };

  res.json({
    success: true,
    data: {
      logs,
      hourlyPatterns,
      insights,
    },
  });
}));

/**
 * GET /api/users/celebrations
 * Get recent celebrations
 */
router.get('/celebrations', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const celebrations = await prisma.celebration.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Mark as acknowledged
  await prisma.celebration.updateMany({
    where: {
      userId,
      acknowledged: false,
    },
    data: {
      acknowledged: true,
    },
  });

  res.json({
    success: true,
    data: { celebrations },
  });
}));

export default router;
