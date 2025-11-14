/**
 * Background Jobs
 * Automated maintenance and support tasks
 */

import cron from 'node-cron';
import { logger } from '../utils/logger';
import { dailyReset } from './dailyReset';
import { autoCleanup } from './autoCleanup';
import { streakChecker } from './streakChecker';

export async function startBackgroundJobs() {
  logger.info('🤖 Starting background automation jobs...');

  // Daily reset at midnight
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running daily reset...');
    try {
      await dailyReset();
      logger.info('✅ Daily reset completed');
    } catch (error) {
      logger.error('❌ Daily reset failed:', error);
    }
  });

  // Auto-cleanup weekly (Sundays at 2 AM)
  cron.schedule('0 2 * * 0', async () => {
    logger.info('Running auto cleanup...');
    try {
      await autoCleanup();
      logger.info('✅ Auto cleanup completed');
    } catch (error) {
      logger.error('❌ Auto cleanup failed:', error);
    }
  });

  // Streak checker (runs daily at 6 PM)
  cron.schedule('0 18 * * *', async () => {
    logger.info('Running streak checker...');
    try {
      await streakChecker();
      logger.info('✅ Streak checker completed');
    } catch (error) {
      logger.error('❌ Streak checker failed:', error);
    }
  });

  logger.info('✅ Background jobs scheduled successfully');
}
