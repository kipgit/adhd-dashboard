/**
 * Google Calendar Integration Service
 * Two-way sync with forgiveness logic
 */

import { google } from 'googleapis';
import { prisma } from '../db/client';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { addDays } from 'date-fns';

const oauth2Client = new google.auth.OAuth2(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri
);

export class GoogleCalendarService {
  /**
   * Generate OAuth URL for user authorization
   */
  static getAuthUrl(): string {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  static async exchangeCodeForTokens(code: string, userId: string) {
    try {
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new AppError(400, 'Failed to get tokens from Google');
      }

      // Store tokens
      await prisma.googleCalendarAuth.upsert({
        where: { userId },
        create: {
          userId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        },
      });

      return tokens;
    } catch (error) {
      logger.error('Failed to exchange code for tokens:', error);
      throw new AppError(400, 'Failed to connect to Google Calendar');
    }
  }

  /**
   * Refresh access token if expired
   */
  private static async refreshAccessToken(userId: string) {
    const auth = await prisma.googleCalendarAuth.findUnique({
      where: { userId },
    });

    if (!auth) {
      throw new AppError(404, 'Google Calendar not connected');
    }

    // Check if token is expired
    if (auth.expiresAt > new Date()) {
      return auth.accessToken; // Still valid
    }

    try {
      oauth2Client.setCredentials({
        refresh_token: auth.refreshToken,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error('No access token received');
      }

      // Update stored token
      await prisma.googleCalendarAuth.update({
        where: { userId },
        data: {
          accessToken: credentials.access_token,
          expiresAt: new Date(credentials.expiry_date || Date.now() + 3600000),
        },
      });

      return credentials.access_token;
    } catch (error) {
      logger.error('Failed to refresh token:', error);
      throw new AppError(401, 'Please reconnect your Google Calendar');
    }
  }

  /**
   * Import events from Google Calendar as task suggestions
   */
  static async importEvents(userId: string, daysAhead: number = 7) {
    try {
      const accessToken = await this.refreshAccessToken(userId);

      oauth2Client.setCredentials({
        access_token: accessToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const timeMin = new Date();
      const timeMax = addDays(new Date(), daysAhead);

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];

      // Convert events to task suggestions (not rigid tasks)
      const suggestions = events.map(event => ({
        title: event.summary || 'Untitled event',
        description: event.description,
        dueDate: event.start?.dateTime || event.start?.date,
        source: 'google_calendar',
        eventId: event.id,
      }));

      // Update last sync time
      await prisma.googleCalendarAuth.update({
        where: { userId },
        data: { lastSync: new Date() },
      });

      return suggestions;
    } catch (error) {
      logger.error('Failed to import calendar events:', error);
      throw new AppError(500, 'Failed to import calendar events');
    }
  }

  /**
   * Disconnect Google Calendar
   */
  static async disconnect(userId: string) {
    await prisma.googleCalendarAuth.delete({
      where: { userId },
    });
  }
}
