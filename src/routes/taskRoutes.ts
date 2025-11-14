/**
 * Task Routes
 */

import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Special routes (custom paths)
router.get('/daily-dashboard', taskController.getDailyDashboard);
router.post('/task-breakdown', apiLimiter, taskController.getTaskBreakdown);
router.get('/time-translator', taskController.translateTime);

// Standard CRUD
router.post('/', apiLimiter, taskController.createTask);
router.patch('/:id/complete', taskController.completeTask);

export default router;
