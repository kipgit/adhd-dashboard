/**
 * Auto Cleanup Job
 * Maintenance-free cleanup with grace
 * Never forces decisions, always suggests
 */

import { prisma } from '../db/client';
import { logger } from '../utils/logger';
import { subDays } from 'date-fns';

export async function autoCleanup() {
  logger.info('Starting auto cleanup...');

  // Get all users
  const users = await prisma.user.findMany({
    include: {
      preferences: true,
    },
  });

  for (const user of users) {
    const autoArchiveDays = user.preferences?.autoArchiveDays ?? 30;
    const cutoffDate = subDays(new Date(), autoArchiveDays);

    // Find old incomplete tasks
    const oldTasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        status: {
          in: ['TODO', 'IN_PROGRESS'],
        },
        archivedAt: null,
        lastTouchedAt: {
          lt: cutoffDate,
        },
      },
    });

    if (oldTasks.length > 0) {
      // Don't auto-archive, but create a gentle prompt
      // Store this as a "celebration" (repurposed for gentle notifications)
      await prisma.celebration.create({
        data: {
          userId: user.id,
          type: 'SHOWING_UP',
          message: `You have ${oldTasks.length} old tasks. Want to release them or give them another chance?`,
          triggerType: 'cleanup_suggestion',
          metadata: {
            taskIds: oldTasks.map(t => t.id),
          },
        },
      });

      logger.info(`Created cleanup suggestion for user ${user.id}: ${oldTasks.length} tasks`);
    }

    // Archive old brain dumps that were converted to tasks
    const oldBrainDumps = await prisma.brainDump.deleteMany({
      where: {
        userId: user.id,
        convertedToTask: true,
        createdAt: {
          lt: subDays(new Date(), 60), // 60 days old
        },
      },
    });

    if (oldBrainDumps.count > 0) {
      logger.info(`Cleaned up ${oldBrainDumps.count} old brain dumps for user ${user.id}`);
    }
  }

  logger.info('Auto cleanup completed successfully');
}
