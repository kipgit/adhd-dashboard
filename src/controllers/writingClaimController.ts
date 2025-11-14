/**
 * Writing Claim Controller
 * Guided claim construction with progressive scaffolding
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';
import { prisma } from '../db/client';
import { WritingClaimService } from '../services/writingClaimService';
import { SupportLevel, ClaimStatus, StepType } from '@prisma/client';

// Validation schemas
const createClaimSchema = z.object({
  title: z.string().min(1, 'Please provide a topic or title'),
  subject: z.string().optional(),
  sourceText: z.string().optional(),
  sourceTitle: z.string().optional(),
  supportLevel: z.enum(['MINIMAL', 'MODERATE', 'MAXIMUM']).optional(),
});

const submitStepResponseSchema = z.object({
  response: z.string().min(1, 'Please provide a response'),
});

const generateFrameSchema = z.object({
  supportLevel: z.enum(['MINIMAL', 'MODERATE', 'MAXIMUM']).optional(),
});

const completeClaimSchema = z.object({
  filledSlots: z.record(z.string()),
});

export const writingClaimController = {
  /**
   * POST /api/writing-claims
   * Create a new writing claim and generate initial probing questions
   */
  createClaim: asyncHandler(async (req: AuthRequest, res: Response) => {
    const validated = createClaimSchema.parse(req.body);
    const userId = req.user!.id;

    // Get user's preferred support level if not specified
    let supportLevel = validated.supportLevel as SupportLevel | undefined;
    if (!supportLevel) {
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId },
      });
      supportLevel = preferences?.writingSupportLevel || 'MODERATE';
    }

    // Create the writing claim
    const claim = await prisma.writingClaim.create({
      data: {
        userId,
        title: validated.title,
        subject: validated.subject,
        sourceText: validated.sourceText,
        sourceTitle: validated.sourceTitle,
        supportLevel: supportLevel,
        status: 'IN_PROGRESS',
        currentStep: 0,
      },
    });

    // Generate initial probing questions
    const probes = await WritingClaimService.generateInitialProbes({
      topic: validated.title,
      subject: validated.subject,
      sourceText: validated.sourceText,
      sourceTitle: validated.sourceTitle,
      supportLevel: supportLevel,
    });

    // Save the probing questions as steps
    const steps = await Promise.all(
      probes.map((probe) =>
        prisma.claimStep.create({
          data: {
            claimId: claim.id,
            stepNumber: probe.stepNumber,
            stepType: probe.stepType,
            question: probe.question,
            hint: probe.hint,
            sentenceStarters: probe.sentenceStarters,
          },
        })
      )
    );

    res.status(201).json({
      success: true,
      message: 'Let\'s build your claim together! We\'ll take it step by step.',
      data: {
        claim: {
          ...claim,
          steps: steps,
        },
      },
    });
  }),

  /**
   * GET /api/writing-claims
   * Get all writing claims for the current user
   */
  getAllClaims: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const status = req.query.status as ClaimStatus | undefined;

    const claims = await prisma.writingClaim.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        sentenceFrame: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      success: true,
      message: status === 'COMPLETED'
        ? 'Here are your completed claims!'
        : 'Here are your writing claims',
      data: { claims },
    });
  }),

  /**
   * GET /api/writing-claims/:id
   * Get a specific writing claim with all steps
   */
  getClaim: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const claim = await prisma.writingClaim.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        sentenceFrame: true,
      },
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Writing claim not found',
      });
    }

    // Calculate progress
    const completedSteps = claim.steps.filter(s => s.isCompleted).length;
    const totalSteps = claim.steps.length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    res.json({
      success: true,
      message: 'Here\'s your claim progress',
      data: {
        claim,
        progress: Math.round(progress),
        nextStep: claim.steps.find(s => !s.isCompleted),
      },
    });
  }),

  /**
   * PATCH /api/writing-claims/:id/steps/:stepId
   * Submit a response to a specific step
   */
  submitStepResponse: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id, stepId } = req.params;
    const validated = submitStepResponseSchema.parse(req.body);

    // Verify claim ownership
    const claim = await prisma.writingClaim.findFirst({
      where: { id, userId },
      include: { steps: true },
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Writing claim not found',
      });
    }

    // Find the step
    const step = await prisma.claimStep.findFirst({
      where: {
        id: stepId,
        claimId: id,
      },
    });

    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Step not found',
      });
    }

    // Update the step with student's response
    const updatedStep = await prisma.claimStep.update({
      where: { id: stepId },
      data: {
        studentResponse: validated.response,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // Generate encouraging feedback
    const feedback = await WritingClaimService.provideFeedback(
      step.question,
      validated.response,
      claim.supportLevel
    );

    // Update claim's current step
    await prisma.writingClaim.update({
      where: { id },
      data: {
        currentStep: step.stepNumber,
      },
    });

    // Get next step if available
    const nextStep = claim.steps.find(
      s => s.stepNumber === step.stepNumber + 1
    );

    res.json({
      success: true,
      message: feedback,
      data: {
        step: updatedStep,
        nextStep,
        canGenerateFrame: !nextStep, // Can generate frame if no more steps
      },
    });
  }),

  /**
   * POST /api/writing-claims/:id/generate-frame
   * Generate sentence frames based on completed steps
   */
  generateFrame: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const validated = generateFrameSchema.parse(req.body);

    // Get claim with all completed steps
    const claim = await prisma.writingClaim.findFirst({
      where: { id, userId },
      include: {
        steps: {
          where: { isCompleted: true },
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Writing claim not found',
      });
    }

    // Check if student has completed enough steps
    if (claim.steps.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please complete at least 2 steps before generating a sentence frame',
      });
    }

    // Prepare student responses for frame generation
    const studentResponses = claim.steps.map(step => ({
      question: step.question,
      response: step.studentResponse || '',
    }));

    // Generate sentence frames
    const frames = await WritingClaimService.generateSentenceFrames(
      {
        topic: claim.title,
        subject: claim.subject || undefined,
        sourceText: claim.sourceText || undefined,
        sourceTitle: claim.sourceTitle || undefined,
        supportLevel: validated.supportLevel || claim.supportLevel,
      },
      studentResponses
    );

    // Save the sentence frame
    const sentenceFrame = await prisma.sentenceFrame.upsert({
      where: { claimId: id },
      create: {
        claimId: id,
        minimalSupport: frames.minimal,
        moderateSupport: frames.moderate,
        maximumSupport: frames.maximum,
        fillableSlots: frames.fillableSlots,
        slotHints: frames.slotHints,
      },
      update: {
        minimalSupport: frames.minimal,
        moderateSupport: frames.moderate,
        maximumSupport: frames.maximum,
        fillableSlots: frames.fillableSlots,
        slotHints: frames.slotHints,
      },
    });

    res.json({
      success: true,
      message: 'Great! Here\'s your sentence frame. Fill in the blanks with your ideas!',
      data: {
        sentenceFrame,
        selectedFrame: claim.supportLevel === 'MINIMAL'
          ? frames.minimal
          : claim.supportLevel === 'MAXIMUM'
          ? frames.maximum
          : frames.moderate,
      },
    });
  }),

  /**
   * PATCH /api/writing-claims/:id/complete
   * Complete the claim by filling in the sentence frame
   */
  completeClaim: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const validated = completeClaimSchema.parse(req.body);

    // Get claim with sentence frame
    const claim = await prisma.writingClaim.findFirst({
      where: { id, userId },
      include: { sentenceFrame: true },
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Writing claim not found',
      });
    }

    if (!claim.sentenceFrame) {
      return res.status(400).json({
        success: false,
        message: 'Please generate a sentence frame first',
      });
    }

    // Determine which frame to use based on support level
    const frameTemplate = claim.supportLevel === 'MINIMAL'
      ? claim.sentenceFrame.minimalSupport
      : claim.supportLevel === 'MAXIMUM'
      ? claim.sentenceFrame.maximumSupport
      : claim.sentenceFrame.moderateSupport;

    // Assemble final claim
    const finalClaim = await WritingClaimService.assembleFinalClaim(
      frameTemplate,
      validated.filledSlots
    );

    // Update claim as completed
    const updatedClaim = await prisma.writingClaim.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        finalClaim,
        completedAt: new Date(),
      },
      include: {
        steps: true,
        sentenceFrame: true,
      },
    });

    // Generate celebration
    const celebration = await WritingClaimService.generateCelebration(
      req.user?.name,
      claim.title
    );

    // Create celebration record
    await prisma.celebration.create({
      data: {
        userId,
        type: 'COMPLETION',
        message: celebration,
        animationType: 'confetti',
        triggerType: 'writing_claim_completion',
        metadata: {
          claimId: id,
          claimTitle: claim.title,
        },
      },
    });

    res.json({
      success: true,
      message: celebration,
      data: {
        claim: updatedClaim,
        finalClaim,
      },
    });
  }),

  /**
   * PATCH /api/writing-claims/:id/archive
   * Archive a writing claim
   */
  archiveClaim: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const claim = await prisma.writingClaim.findFirst({
      where: { id, userId },
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Writing claim not found',
      });
    }

    const archivedClaim = await prisma.writingClaim.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
      },
    });

    res.json({
      success: true,
      message: 'Claim archived. You can come back to it anytime!',
      data: { claim: archivedClaim },
    });
  }),

  /**
   * DELETE /api/writing-claims/:id
   * Delete a writing claim
   */
  deleteClaim: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const claim = await prisma.writingClaim.findFirst({
      where: { id, userId },
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Writing claim not found',
      });
    }

    await prisma.writingClaim.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Writing claim deleted',
    });
  }),

  /**
   * GET /api/writing-claims/:id/hint
   * Get a helpful hint for the current step (accessibility feature)
   */
  getHint: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const stepNumber = parseInt(req.query.step as string) || 0;

    const claim = await prisma.writingClaim.findFirst({
      where: { id, userId },
      include: {
        steps: {
          where: { stepNumber },
        },
      },
    });

    if (!claim || !claim.steps[0]) {
      return res.status(404).json({
        success: false,
        message: 'Step not found',
      });
    }

    const step = claim.steps[0];

    res.json({
      success: true,
      data: {
        hint: step.hint,
        sentenceStarters: step.sentenceStarters,
      },
    });
  }),
};

export default writingClaimController;
