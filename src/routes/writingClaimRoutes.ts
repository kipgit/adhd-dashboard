/**
 * Writing Claim Routes
 * Guided claim construction for students with exceptionalities
 */

import { Router } from 'express';
import { writingClaimController } from '../controllers/writingClaimController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create new writing claim (with initial probing questions)
router.post('/', apiLimiter, writingClaimController.createClaim);

// Get all writing claims for user
router.get('/', writingClaimController.getAllClaims);

// Get specific writing claim
router.get('/:id', writingClaimController.getClaim);

// Submit response to a step
router.patch('/:id/steps/:stepId', writingClaimController.submitStepResponse);

// Generate sentence frames
router.post('/:id/generate-frame', apiLimiter, writingClaimController.generateFrame);

// Complete the claim (fill in sentence frame)
router.patch('/:id/complete', writingClaimController.completeClaim);

// Archive claim
router.patch('/:id/archive', writingClaimController.archiveClaim);

// Delete claim
router.delete('/:id', writingClaimController.deleteClaim);

// Get hint for current step (accessibility feature)
router.get('/:id/hint', writingClaimController.getHint);

export default router;
