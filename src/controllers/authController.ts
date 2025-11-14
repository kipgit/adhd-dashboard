/**
 * Authentication Controller
 * Handle user registration and login
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string(),
});

export const authController = {
  register: asyncHandler(async (req: AuthRequest, res: Response) => {
    const validated = registerSchema.parse(req.body);

    const result = await AuthService.register(
      validated.email,
      validated.password,
      validated.name
    );

    res.status(201).json({
      success: true,
      message: 'Welcome aboard! Your account is ready.',
      data: result,
    });
  }),

  login: asyncHandler(async (req: AuthRequest, res: Response) => {
    const validated = loginSchema.parse(req.body);

    const result = await AuthService.login(validated.email, validated.password);

    res.json({
      success: true,
      message: 'Welcome back!',
      data: result,
    });
  }),

  me: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  }),
};
