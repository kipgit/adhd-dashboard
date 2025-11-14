/**
 * Routine Routes
 */

import { Router } from 'express';
import { routineController } from '../controllers/routineController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', apiLimiter, routineController.create);
router.get('/', routineController.getAll);
router.post('/start', routineController.startRoutine);

export default router;
