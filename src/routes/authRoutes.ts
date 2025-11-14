/**
 * Authentication Routes
 */

import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', apiLimiter, authController.register);
router.post('/login', apiLimiter, authController.login);
router.get('/me', authenticate, authController.me);

export default router;
