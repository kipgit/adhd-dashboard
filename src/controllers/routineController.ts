/**
 * Routine Controller
 * Morning/transition/evening rituals
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';
import { prisma } from '../db/client';
import { RoutineType } from '@prisma/client';

const createRoutineSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['MORNING', 'TRANSITION', 'EVENING', 'CUSTOM']),
  description: z.string().optional(),
  steps: z.array(z.object({
    description: z.string(),
    hasTimer: z.boolean().optional(),
    timerMinutes: z.number().optional(),
    isOptional: z.boolean().optional(),
  })),
  timeOfDay: z.string().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
});

export const routineController = {
  /**
   * POST /api/routines
   * Create a new routine
   */
  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const validated = createRoutineSchema.parse(req.body);
    const userId = req.user!.id;

    const routine = await prisma.routine.create({
      data: {
        userId,
        name: validated.name,
        type: validated.type,
        description: validated.description,
        timeOfDay: validated.timeOfDay,
        daysOfWeek: validated.daysOfWeek ?? [],
        steps: {
          create: validated.steps.map((step, index) => ({
            order: index,
            description: step.description,
            hasTimer: step.hasTimer ?? false,
            timerMinutes: step.timerMinutes,
            isOptional: step.isOptional ?? false,
          })),
        },
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Routine created!',
      data: { routine },
    });
  }),

  /**
   * GET /api/routines
   * Get user's routines
   */
  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const type = req.query.type as RoutineType | undefined;

    const routines = await prisma.routine.findMany({
      where: {
        userId,
        isActive: true,
        ...(type && { type }),
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { routines },
    });
  }),

  /**
   * POST /api/routine-start
   * Start a routine session
   */
  startRoutine: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { routineId } = req.body;

    const routine = await prisma.routine.findFirst({
      where: { id: routineId, userId },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found',
      });
    }

    // Create session
    const session = await prisma.routineSession.create({
      data: {
        routineId: routine.id,
        userId,
        totalSteps: routine.steps.length,
      },
    });

    // Update routine stats
    await prisma.routine.update({
      where: { id: routine.id },
      data: {
        lastStarted: new Date(),
      },
    });

    const firstStep = routine.steps[0];

    res.json({
      success: true,
      message: `Let's start: ${routine.name}`,
      data: {
        session,
        routine,
        firstStep: firstStep ? {
          description: firstStep.description,
          hasTimer: firstStep.hasTimer,
          timerMinutes: firstStep.timerMinutes,
        } : null,
      },
    });
  }),
};
