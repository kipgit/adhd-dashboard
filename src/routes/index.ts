/**
 * Main Router
 * Combines all API routes
 */

import { Router } from 'express';
import authRoutes from './authRoutes';
import brainDumpRoutes from './brainDumpRoutes';
import taskRoutes from './taskRoutes';
import routineRoutes from './routineRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/brain-dump', brainDumpRoutes);
router.use('/tasks', taskRoutes);
router.use('/routines', routineRoutes);
router.use('/users', userRoutes);

export default router;
