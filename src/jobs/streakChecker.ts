/**
 * Streak Checker Job
 * Celebrates consistency, never shames breaks
 * Positive framing always
 */

import { prisma } from '../db/client';
import { logger } from '../utils/logger';
import { startOfDay, subDays } from 'date-fns';

export async function streakChecker() {
  logger.info('Starting streak checker...');

  const users = await prisma.user.findMany({
    include: {
      preferences: true,
    },
  });

  for (const user of users) {
    // Skip if celebrations are disabled
    if (user.preferences?.celebrationsEnabled === false) {
      continue;
    }

    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);

    // Check if user completed any tasks today
    const tasksCompletedToday = await prisma.task.count({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        completedAt: {
          gte: today,
        },
      },
    });

    if (tasksCompletedToday === 0) {
      continue; // No activity today, skip
    }

    // Check for consecutive days
    let streakDays = 1;
    let checkDate = yesterday;

    for (let i = 0; i < 30; i++) { // Check up to 30 days back
      const dayStart = startOfDay(checkDate);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const completedOnDay = await prisma.task.count({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          completedAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });

      if (completedOnDay > 0) {
        streakDays++;
        checkDate = subDays(checkDate, 1);
      } else {
        break; // Streak broken
      }
    }

    // Celebrate milestones
    if (streakDays === 3) {
      await prisma.celebration.create({
        data: {
          userId: user.id,
          type: 'STREAK',
          message: 'You showed up 3 days in a row! 🔥',
          triggerType: 'streak',
          metadata: { days: 3 },
        },
      });
      logger.info(`Created 3-day streak celebration for user ${user.id}`);
    } else if (streakDays === 7) {
      await prisma.celebration.create({
        data: {
          userId: user.id,
          type: 'STREAK',
          message: 'A whole week of showing up! You\'re amazing! 🌟',
          triggerType: 'streak',
          metadata: { days: 7 },
        },
      });
      logger.info(`Created 7-day streak celebration for user ${user.id}`);
    } else if (streakDays === 14) {
      await prisma.celebration.create({
        data: {
          userId: user.id,
          type: 'MILESTONE',
          message: '2 weeks of consistency! This is HUGE! 🎉',
          triggerType: 'streak',
          metadata: { days: 14 },
        },
      });
      logger.info(`Created 14-day streak celebration for user ${user.id}`);
    } else if (streakDays === 30) {
      await prisma.celebration.create({
        data: {
          userId: user.id,
          type: 'MILESTONE',
          message: '30 days! You\'re building something real here. 💪',
          triggerType: 'streak',
          metadata: { days: 30 },
        },
      });
      logger.info(`Created 30-day streak celebration for user ${user.id}`);
    }

    // Also celebrate "coming back" after a break
    const tasksCompletedYesterday = await prisma.task.count({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        completedAt: {
          gte: yesterday,
          lt: today,
        },
      },
    });

    if (tasksCompletedYesterday === 0 && tasksCompletedToday > 0) {
      // User came back after missing a day
      const lastCompletedTask = await prisma.task.findFirst({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          completedAt: {
            lt: yesterday,
          },
        },
        orderBy: {
          completedAt: 'desc',
        },
      });

      if (lastCompletedTask) {
        const daysSinceLastActivity = Math.floor(
          (today.getTime() - lastCompletedTask.completedAt!.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastActivity >= 2) {
          await prisma.celebration.create({
            data: {
              userId: user.id,
              type: 'COURAGE',
              message: 'You came back! That takes courage. Welcome back! 💚',
              triggerType: 'comeback',
              metadata: { daysSince: daysSinceLastActivity },
            },
          });
          logger.info(`Created comeback celebration for user ${user.id}`);
        }
      }
    }
  }

  logger.info('Streak checker completed successfully');
}
