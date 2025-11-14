/**
 * Task Controller
 * Energy-based task management with AI assistance
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';
import { TaskService } from '../services/taskService';
import { EnergyLevel } from '@prisma/client';
import AIService from '../services/aiService';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task needs a title'),
  description: z.string().optional(),
  energyRequired: z.enum(['HIGH', 'MEDIUM', 'LOW', 'CREATIVE']).optional(),
  dueDate: z.string().datetime().optional().transform(d => d ? new Date(d) : undefined),
  autoBreakdown: z.boolean().optional(),
});

export const taskController = {
  /**
   * GET /api/daily-dashboard
   * Get today's tasks filtered by energy and survival mode
   */
  getDailyDashboard: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const energyLevel = req.query.energy_level as EnergyLevel | undefined;
    const survivalMode = req.query.survival_mode === 'true';

    const dashboard = await TaskService.getDailyDashboard(
      userId,
      energyLevel,
      survivalMode
    );

    res.json({
      success: true,
      message: survivalMode
        ? 'Here are your Top 3 for today. That\'s all you need to focus on.'
        : 'Here\'s what feels doable today',
      data: dashboard,
    });
  }),

  /**
   * POST /api/tasks
   * Create a new task with optional AI breakdown
   */
  createTask: asyncHandler(async (req: AuthRequest, res: Response) => {
    const validated = createTaskSchema.parse(req.body);
    const userId = req.user!.id;

    const task = await TaskService.createTask(userId, validated);

    res.status(201).json({
      success: true,
      message: 'Task created!',
      data: { task },
    });
  }),

  /**
   * POST /api/task-breakdown
   * Get AI breakdown for a task
   */
  getTaskBreakdown: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const breakdown = await AIService.breakDownTask(title, description);

    res.json({
      success: true,
      message: 'Here\'s how to tackle this:',
      data: breakdown,
    });
  }),

  /**
   * PATCH /api/tasks/:id/complete
   * Mark task as complete
   */
  completeTask: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const task = await TaskService.completeTask(userId, id);

    res.json({
      success: true,
      message: 'You did it! 🎉',
      data: { task },
    });
  }),

  /**
   * GET /api/time-translator
   * Convert time to tangible references
   */
  translateTime: asyncHandler(async (req: AuthRequest, res: Response) => {
    const minutes = parseInt(req.query.minutes as string);

    if (isNaN(minutes)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide minutes as a number',
      });
    }

    const translation = AIService.translateTime(minutes);

    res.json({
      success: true,
      data: {
        minutes,
        translation,
      },
    });
  }),
};
