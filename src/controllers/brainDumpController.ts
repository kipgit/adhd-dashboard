/**
 * Brain Dump Controller
 * Frictionless thought capture with AI categorization
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';
import { prisma } from '../db/client';
import AIService from '../services/aiService';

const brainDumpSchema = z.object({
  content: z.string().min(1, 'Can\'t save an empty thought!'),
  audioUrl: z.string().url().optional(),
  showTimestamp: z.boolean().optional().default(false),
});

export const brainDumpController = {
  /**
   * POST /api/brain-dump
   * Capture a thought with AI categorization
   */
  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const validated = brainDumpSchema.parse(req.body);
    const userId = req.user!.id;

    // AI categorization (non-blocking, graceful fallback)
    const analysis = await AIService.analyzeBrainDump(validated.content);

    const brainDump = await prisma.brainDump.create({
      data: {
        userId,
        content: validated.content,
        audioUrl: validated.audioUrl,
        showTimestamp: validated.showTimestamp,
        category: analysis.category,
        suggestedEnergy: analysis.suggestedEnergy,
        isUrgent: analysis.isUrgent,
        isImportant: analysis.isImportant,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Got it! Thought captured.',
      data: {
        brainDump,
        suggestion: analysis.suggestedTitle
          ? `How about: "${analysis.suggestedTitle}"?`
          : null,
      },
    });
  }),

  /**
   * GET /api/brain-dump
   * Get all brain dumps
   */
  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const convertedToTask = req.query.converted === 'true' ? true : undefined;

    const brainDumps = await prisma.brainDump.findMany({
      where: {
        userId,
        convertedToTask,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to prevent overwhelm
    });

    res.json({
      success: true,
      data: { brainDumps },
    });
  }),

  /**
   * POST /api/brain-dump/:id/convert
   * Convert brain dump to task
   */
  convertToTask: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const brainDump = await prisma.brainDump.findFirst({
      where: { id, userId },
    });

    if (!brainDump) {
      return res.status(404).json({
        success: false,
        message: 'Brain dump not found',
      });
    }

    // Create task from brain dump
    const breakdown = await AIService.breakDownTask(brainDump.content);

    const task = await prisma.task.create({
      data: {
        userId,
        title: brainDump.content.slice(0, 100), // Truncate if needed
        energyRequired: breakdown.energyRequired,
        difficulty: breakdown.difficulty,
        firstPhysicalAction: breakdown.firstPhysicalAction,
        hasBreakdown: true,
        steps: {
          create: breakdown.steps.map((step, index) => ({
            order: index,
            description: step.description,
            estimatedMinutes: step.estimatedMinutes,
          })),
        },
      },
      include: {
        steps: true,
      },
    });

    // Mark brain dump as converted
    await prisma.brainDump.update({
      where: { id },
      data: {
        convertedToTask: true,
        convertedTaskId: task.id,
      },
    });

    res.json({
      success: true,
      message: 'Converted to task!',
      data: { task },
    });
  }),
};
