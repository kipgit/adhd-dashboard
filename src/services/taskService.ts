/**
 * Task Service
 * Business logic for task management with ADHD-friendly features
 */

import { prisma } from '../db/client';
import { EnergyLevel, TaskStatus } from '@prisma/client';
import AIService from './aiService';
import { AppError } from '../middleware/errorHandler';
import { addDays, startOfDay, endOfDay } from 'date-fns';

export class TaskService {
  /**
   * Get daily dashboard filtered by energy level and survival mode
   */
  static async getDailyDashboard(
    userId: string,
    energyLevel?: EnergyLevel,
    survivalMode?: boolean
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const isSurvivalMode = survivalMode ?? user.preferences?.survivalModeEnabled ?? false;
    const taskLimit = isSurvivalMode ? (user.preferences?.survivalModeTaskLimit ?? 3) : undefined;

    // Build filter
    const where: any = {
      userId,
      status: {
        in: ['TODO', 'IN_PROGRESS'],
      },
      archivedAt: null,
    };

    // Filter by energy if provided
    if (energyLevel) {
      where.energyRequired = energyLevel;
    }

    // Get tasks
    const tasks = await prisma.task.findMany({
      where,
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [
        { isTopThree: 'desc' },
        { isQuickWin: 'desc' },
        { dueDate: 'asc' },
      ],
      take: taskLimit,
    });

    // Get quick wins (under 5 minutes)
    const quickWins = await prisma.task.findMany({
      where: {
        userId,
        status: {
          in: ['TODO', 'IN_PROGRESS'],
        },
        isQuickWin: true,
        archivedAt: null,
      },
      take: 3,
    });

    return {
      tasks,
      quickWins,
      survivalMode: isSurvivalMode,
      energyLevel: energyLevel ?? user.currentEnergyLevel,
    };
  }

  /**
   * Create task with optional AI breakdown
   */
  static async createTask(
    userId: string,
    data: {
      title: string;
      description?: string;
      energyRequired?: EnergyLevel;
      dueDate?: Date;
      autoBreakdown?: boolean;
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    });

    const shouldBreakdown = data.autoBreakdown ?? user?.preferences?.defaultTaskBreakdown ?? true;

    let breakdown;
    if (shouldBreakdown) {
      breakdown = await AIService.breakDownTask(data.title, data.description);
    }

    // Determine if it's a quick win
    const estimatedMinutes = breakdown?.steps.reduce((sum, step) => sum + step.estimatedMinutes, 0) ?? 0;
    const isQuickWin = estimatedMinutes <= 5;

    const task = await prisma.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        energyRequired: breakdown?.energyRequired ?? data.energyRequired ?? 'MEDIUM',
        difficulty: breakdown?.difficulty ?? 'MEDIUM',
        firstPhysicalAction: breakdown?.firstPhysicalAction,
        estimatedMinutes,
        tangibleTimeRef: estimatedMinutes > 0 ? AIService.translateTime(estimatedMinutes) : undefined,
        isQuickWin,
        hasBreakdown: !!breakdown,
        dueDate: data.dueDate,
        steps: breakdown ? {
          create: breakdown.steps.map((step, index) => ({
            order: index,
            description: step.description,
            estimatedMinutes: step.estimatedMinutes,
          })),
        } : undefined,
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return task;
  }

  /**
   * Complete a task (with celebration!)
   */
  static async completeTask(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    if (task.status === 'COMPLETED') {
      return task; // Already completed
    }

    const completedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Trigger celebration
    await this.createCelebration(userId, 'COMPLETION', completedTask.title);

    return completedTask;
  }

  /**
   * Create celebration
   */
  private static async createCelebration(
    userId: string,
    type: 'COMPLETION' | 'STREAK' | 'COURAGE' | 'SHOWING_UP',
    context: string
  ) {
    const messages = {
      COMPLETION: `You completed: ${context}! 🎉`,
      STREAK: `You're on a roll! ${context} 🔥`,
      COURAGE: `You showed up even when it was hard! 💪`,
      SHOWING_UP: `You showed up! That's what matters. 🌟`,
    };

    await prisma.celebration.create({
      data: {
        userId,
        type,
        message: messages[type],
        triggerType: type.toLowerCase(),
        metadata: { context },
      },
    });
  }
}
