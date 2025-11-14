/**
 * AI Service - Powered by Anthropic Claude
 * Task categorization, breakdown, and ADHD-friendly assistance
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { logger } from '../utils/logger';
import { EnergyLevel, BrainDumpCategory, TaskDifficulty } from '@prisma/client';

const anthropic = new Anthropic({
  apiKey: config.anthropicApiKey,
});

interface TaskBreakdown {
  steps: Array<{
    description: string;
    estimatedMinutes: number;
  }>;
  firstPhysicalAction: string;
  difficulty: TaskDifficulty;
  energyRequired: EnergyLevel;
}

interface BrainDumpAnalysis {
  category: BrainDumpCategory;
  suggestedEnergy: EnergyLevel;
  isUrgent: boolean;
  isImportant: boolean;
  suggestedTitle?: string;
}

export class AIService {
  /**
   * Analyze a brain dump and categorize it
   * ADHD-friendly: Quick categorization without user decision-making
   */
  static async analyzeBrainDump(content: string): Promise<BrainDumpAnalysis> {
    try {
      const prompt = `You are an ADHD-friendly task assistant. Analyze this thought/brain dump and categorize it.

Brain dump: "${content}"

Respond with a JSON object containing:
{
  "category": one of [URGENT, IMPORTANT, CREATIVE, LOW_ENERGY, PERSONAL, WORK, IDEAS, LATER],
  "suggestedEnergy": one of [HIGH, MEDIUM, LOW, CREATIVE],
  "isUrgent": boolean,
  "isImportant": boolean,
  "suggestedTitle": a clear, action-oriented title (optional)
}

Guidelines:
- URGENT: needs action today/tomorrow
- IMPORTANT: matters but not time-sensitive
- CREATIVE: brainstorming, ideas, creative work
- LOW_ENERGY: can be done while tired
- Keep it simple and actionable`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      });

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        category: analysis.category as BrainDumpCategory,
        suggestedEnergy: analysis.suggestedEnergy as EnergyLevel,
        isUrgent: analysis.isUrgent,
        isImportant: analysis.isImportant,
        suggestedTitle: analysis.suggestedTitle,
      };
    } catch (error) {
      logger.error('AI brain dump analysis failed:', error);
      // Graceful fallback
      return {
        category: 'LATER' as BrainDumpCategory,
        suggestedEnergy: 'MEDIUM' as EnergyLevel,
        isUrgent: false,
        isImportant: false,
      };
    }
  }

  /**
   * Break down a complex task into ADHD-friendly micro-steps
   * Each step should be 2-10 minutes max
   */
  static async breakDownTask(
    title: string,
    description?: string
  ): Promise<TaskBreakdown> {
    try {
      const prompt = `You are an ADHD coach helping break down a task into tiny, manageable steps.

Task: ${title}
${description ? `Description: ${description}` : ''}

Break this down following ADHD-friendly principles:
1. Each step should take 2-10 minutes maximum
2. Steps should be concrete physical actions (not vague)
3. Identify the FIRST physical action to overcome activation energy
4. 3-7 steps total (more steps = more overwhelming)

Respond with JSON:
{
  "steps": [
    {
      "description": "specific action",
      "estimatedMinutes": number between 2-10
    }
  ],
  "firstPhysicalAction": "the literal first 30-second action",
  "difficulty": one of [EASY, MEDIUM, HARD, OVERWHELMING],
  "energyRequired": one of [HIGH, MEDIUM, LOW, CREATIVE]
}

Example:
Task: "Write project report"
{
  "steps": [
    {"description": "Open Google Docs and create new document titled 'Project Report'", "estimatedMinutes": 2},
    {"description": "Write a rough outline with 3-5 main headers", "estimatedMinutes": 5},
    {"description": "Fill in the introduction section (just 2-3 sentences)", "estimatedMinutes": 8}
  ],
  "firstPhysicalAction": "Open Google Docs",
  "difficulty": "MEDIUM",
  "energyRequired": "MEDIUM"
}`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      });

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const breakdown = JSON.parse(jsonMatch[0]);

      return {
        steps: breakdown.steps,
        firstPhysicalAction: breakdown.firstPhysicalAction,
        difficulty: breakdown.difficulty as TaskDifficulty,
        energyRequired: breakdown.energyRequired as EnergyLevel,
      };
    } catch (error) {
      logger.error('AI task breakdown failed:', error);
      // Graceful fallback
      return {
        steps: [
          {
            description: title,
            estimatedMinutes: 10,
          },
        ],
        firstPhysicalAction: 'Start the task',
        difficulty: 'MEDIUM' as TaskDifficulty,
        energyRequired: 'MEDIUM' as EnergyLevel,
      };
    }
  }

  /**
   * Generate context-aware supportive prompts
   * Never nagging, always offering help
   */
  static async generateSupportivePrompt(
    context: {
      taskTitle: string;
      daysSinceCreated: number;
      currentEnergyLevel: EnergyLevel;
      timeOfDay: string;
    }
  ): Promise<string> {
    try {
      const prompt = `You are a supportive ADHD coach. Generate a helpful, non-judgmental prompt.

Context:
- Task: "${context.taskTitle}"
- Days since created: ${context.daysSinceCreated}
- User's current energy: ${context.currentEnergyLevel}
- Time of day: ${context.timeOfDay}

Generate a single supportive sentence that:
1. NEVER uses shame language ("you should have", "you're behind", etc.)
2. Offers practical help
3. Respects their current energy level
4. Is warm and encouraging

Examples:
- "Want to break this into smaller pieces?"
- "This might be easier after a quick walk"
- "How about just the first 2 minutes?"

Respond with just the prompt text, no quotes or extra formatting.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      });

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : 'You\'ve got this! What feels doable right now?';

      return responseText.trim();
    } catch (error) {
      logger.error('AI prompt generation failed:', error);
      return 'You\'ve got this! What feels doable right now?';
    }
  }

  /**
   * Translate abstract time to tangible references
   * Combat time blindness
   */
  static translateTime(minutes: number): string {
    if (minutes <= 5) return 'About one song';
    if (minutes <= 15) return 'About 3 songs';
    if (minutes <= 25) return '1 Pomodoro session';
    if (minutes <= 45) return 'About half a TV show';
    if (minutes <= 60) return 'About 1 TV episode';
    if (minutes <= 90) return 'About 1 movie (short)';
    if (minutes <= 120) return 'About 1 movie';
    if (minutes <= 180) return 'About half a workday';
    if (minutes <= 240) return 'About a morning';

    const hours = Math.round(minutes / 60);
    return `About ${hours} hours`;
  }
}

export default AIService;
