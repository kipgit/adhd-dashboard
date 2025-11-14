/**
 * Authentication Service
 * User registration, login, token management
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/client';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(email: string, password: string, name?: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'That email is already registered. Want to log in instead?');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with default preferences
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        preferences: {
          create: {
            // ADHD-friendly defaults
            survivalModeEnabled: false,
            reducedMotion: false,
            highContrast: 'STANDARD',
            dyslexicFont: false,
            defaultTaskBreakdown: true,
            celebrationsEnabled: true,
            timeBlindnessMode: false,
            pomodoroLength: 25,
            pomodoroBreakLength: 5,
            gentleRemindersEnabled: true,
            neverUseShameLanguage: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = this.generateToken(user.id, user.email);

    return {
      user,
      token,
    };
  }

  /**
   * Login existing user
   */
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, 'Email or password is incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Email or password is incorrect');
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Generate JWT token
   */
  private static generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }
}
