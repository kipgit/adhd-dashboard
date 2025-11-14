/**
 * Daily Reset Job
 * Runs at midnight to prepare tomorrow's dashboard
 * ADHD-friendly: No shame, just support
 */

import { prisma } from '../db/client';
import { logger } from '../utils/logger';
import { startOfDay, subDays } from 'date-fns';

export async function dailyReset() {
  logger.info('Starting daily reset...');

  // Archive completed tasks older than 7 days
  const sevenDaysAgo = subDays(new Date(), 7);

  const archivedCompleted = await prisma.task.updateMany({
    where: {
      status: 'COMPLETED',
      completedAt: {
        lt: sevenDaysAgo,
      },
      archivedAt: null,
    },
    data: {
      archivedAt: new Date(),
    },
  });

  logger.info(`Archived ${archivedCompleted.count} completed tasks`);

  // Get all users with active tasks
  const users = await prisma.user.findMany({
    include: {
      tasks: {
        where: {
          status: {
            in: ['TODO', 'IN_PROGRESS'],
          },
          archivedAt: null,
        },
      },
      preferences: true,
    },
  });

  for (const user of users) {
    // Generate "Top 3" for tomorrow based on:
    // 1. Urgent tasks (due soon)
    // 2. Tasks matching typical high-energy windows
    // 3. Quick wins for motivation

    const today = startOfDay(new Date());
    const tomorrow = startOfDay(new Date(Date.now() + 24 * 60 * 60 * 1000));

    // Clear previous top 3
    await prisma.task.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        isTopThree: false,
      },
    });

    // Find urgent tasks
    const urgentTasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        status: {
          in: ['TODO', 'IN_PROGRESS'],
        },
        dueDate: {
          lte: tomorrow,
        },
        archivedAt: null,
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 2,
    });

    // Add one quick win if we have room
    const quickWin = await prisma.task.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['TODO', 'IN_PROGRESS'],
        },
        isQuickWin: true,
        archivedAt: null,
        id: {
          notIn: urgentTasks.map(t => t.id),
        },
      },
    });

    const topThreeIds = [
      ...urgentTasks.map(t => t.id),
      ...(quickWin ? [quickWin.id] : []),
    ].slice(0, 3);

    // Mark as top 3
    if (topThreeIds.length > 0) {
      await prisma.task.updateMany({
        where: {
          id: {
            in: topThreeIds,
          },
        },
        data: {
          isTopThree: true,
        },
      });

      logger.info(`Set Top 3 tasks for user ${user.id}`);
    }
  }

  logger.info('Daily reset completed successfully');
}
