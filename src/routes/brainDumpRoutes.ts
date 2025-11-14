/**
 * Brain Dump Routes
 * Frictionless thought capture
 */

import { Router } from 'express';
import { brainDumpController } from '../controllers/brainDumpController';
import { authenticate } from '../middleware/auth';
import { brainDumpLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', brainDumpLimiter, brainDumpController.create);
router.get('/', brainDumpController.getAll);
router.post('/:id/convert', brainDumpController.convertToTask);

export default router;
