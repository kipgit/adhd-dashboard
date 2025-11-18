/**
 * Writing Claim Service - AI-powered guided claim construction
 * Designed for students with exceptionalities (ADHD, dyslexia, ADD, SLD, SLI, autism)
 * Progressive scaffolding with varying support levels
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { logger } from '../utils/logger';
import { SupportLevel, StepType } from '@prisma/client';

const anthropic = new Anthropic({
  apiKey: config.anthropicApiKey,
});

interface ProbeQuestion {
  stepNumber: number;
  stepType: StepType;
  question: string;
  hint: string;
  sentenceStarters: string[];
}

interface SentenceFrames {
  minimal: string;
  moderate: string;
  maximum: string;
  fillableSlots: Record<string, string>;
  slotHints: Record<string, string>;
}

interface StudentContext {
  topic: string;
  subject?: string;
  sourceText?: string;
  sourceTitle?: string;
  supportLevel: SupportLevel;
  previousResponses?: Array<{
    question: string;
    response: string;
  }>;
}

export class WritingClaimService {
  /**
   * Generate initial probing questions to guide claim construction
   * Adapts to support level and subject matter
   */
  static async generateInitialProbes(context: StudentContext): Promise<ProbeQuestion[]> {
    try {
      const supportLevelGuidance = {
        MINIMAL: 'Ask 3-4 open-ended questions that encourage independent thinking.',
        MODERATE: 'Ask 4-5 questions with some hints and context to guide thinking.',
        MAXIMUM: 'Ask 5-6 questions with detailed hints, examples, and clear scaffolding.',
      };

      const prompt = `You are an expert special education teacher helping a student with exceptionalities (ADHD, dyslexia, ADD, SLD, SLI, or autism) construct a writing claim.

Student's Topic: ${context.topic}
${context.subject ? `Subject: ${context.subject}` : ''}
${context.sourceText ? `Source Text: "${context.sourceText.substring(0, 500)}${context.sourceText.length > 500 ? '...' : ''}"` : ''}
${context.sourceTitle ? `Source Title: ${context.sourceTitle}` : ''}
Support Level: ${context.supportLevel}

Instructions:
${supportLevelGuidance[context.supportLevel]}

Generate a sequence of probing questions that will guide the student to develop a strong claim. Each question should:
1. Build on the previous one
2. Be clear and concrete (avoid abstract language)
3. Use accessible vocabulary
4. Include helpful hints
5. Provide sentence starters that vary in specificity

The sequence should follow this progression:
1. PROBE - What is the main topic/text about?
2. BRAINSTORM - What is your initial reaction or opinion?
3. EVIDENCE - What examples or evidence support your thinking?
4. REASONING - Why does this evidence matter? How does it connect to your opinion?
5. REFINEMENT - Can you make your claim more specific or stronger?

Respond with a JSON array:
[
  {
    "stepNumber": 1,
    "stepType": "PROBE",
    "question": "Clear, accessible question",
    "hint": "Helpful hint or clarification",
    "sentenceStarters": ["I think this is about...", "The main idea is...", "This focuses on..."]
  }
]

Make sure questions are:
- Concrete and specific (not abstract)
- Age/grade appropriate
- Free from overwhelming vocabulary
- Encouraging and supportive in tone
- Designed to reduce cognitive load`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      });

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const probes = JSON.parse(jsonMatch[0]);
      return probes;
    } catch (error) {
      logger.error('AI probe generation failed:', error);
      // Graceful fallback with basic questions
      return [
        {
          stepNumber: 1,
          stepType: 'PROBE' as StepType,
          question: 'What is the main topic or idea you want to write about?',
          hint: 'Think about what the text or assignment is mostly about.',
          sentenceStarters: ['This is about...', 'The main topic is...', 'I want to write about...'],
        },
        {
          stepNumber: 2,
          stepType: 'BRAINSTORM' as StepType,
          question: 'What do you think about this topic? What is your opinion?',
          hint: 'There is no wrong answer - what is YOUR thinking about this?',
          sentenceStarters: ['I think that...', 'In my opinion...', 'I believe...'],
        },
        {
          stepNumber: 3,
          stepType: 'EVIDENCE' as StepType,
          question: 'What examples or details support your thinking?',
          hint: 'This could be from the text, from your experience, or from what you know.',
          sentenceStarters: ['For example...', 'One reason is...', 'The text shows...'],
        },
      ];
    }
  }

  /**
   * Generate context-aware sentence starters for the next step
   * Adapts based on what the student has already shared
   */
  static async generateSentenceStarters(
    currentQuestion: string,
    studentContext: StudentContext
  ): Promise<string[]> {
    try {
      const prompt = `You are helping a student with exceptionalities write a response to a question.

Current Question: ${currentQuestion}
Support Level: ${studentContext.supportLevel}
${studentContext.previousResponses && studentContext.previousResponses.length > 0
  ? `Previous Responses:\n${studentContext.previousResponses.map(r => `Q: ${r.question}\nA: ${r.response}`).join('\n\n')}`
  : ''}

Generate 3-5 sentence starters that will help the student begin their response. The starters should:
1. Vary in specificity (some more open, some more guided)
2. Use simple, clear language
3. Build on their previous responses if available
4. Match the support level (${studentContext.supportLevel === 'MAXIMUM' ? 'more detailed' : studentContext.supportLevel === 'MINIMAL' ? 'more open-ended' : 'balanced'})

Respond with a JSON array of strings:
["Sentence starter 1...", "Sentence starter 2...", ...]`;

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

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('AI sentence starter generation failed:', error);
      return ['I think...', 'One reason is...', 'For example...'];
    }
  }

  /**
   * Generate sentence frames with varying support levels
   * Creates fill-in-the-blank templates based on student responses
   */
  static async generateSentenceFrames(
    studentContext: StudentContext,
    studentResponses: Array<{ question: string; response: string }>
  ): Promise<SentenceFrames> {
    try {
      const prompt = `You are creating a sentence frame to help a student construct their final writing claim.

Topic: ${studentContext.topic}
${studentContext.subject ? `Subject: ${studentContext.subject}` : ''}

Student's Responses:
${studentResponses.map((r, i) => `${i + 1}. ${r.question}\n   Answer: ${r.response}`).join('\n\n')}

Create THREE versions of a sentence frame (fill-in-the-blank template) with varying support levels:

1. MINIMAL support: Basic structure with wide-open blanks
   - Fewest prompts
   - Most student autonomy
   - Example: "In _____, the author shows that _____."

2. MODERATE support: Balanced scaffolding with helpful prompts
   - Some guiding phrases
   - Clear structure
   - Example: "In [text title], the author shows that [main idea] because [reason]."

3. MAXIMUM support: Extensive prompts and specific guidance
   - Detailed prompts for each blank
   - Very clear expectations
   - Example: "In [title of the text we read], the author shows that [what is the main point?] because [what evidence supports this?] and [what else supports this?]."

Also identify the key "fillable slots" (the blanks) and create helpful hints for each.

Respond with JSON:
{
  "minimal": "sentence frame with _____ blanks",
  "moderate": "sentence frame with [prompted blanks]",
  "maximum": "sentence frame with [detailed prompted blanks]",
  "fillableSlots": {
    "slot1": "description of what goes here",
    "slot2": "description of what goes here"
  },
  "slotHints": {
    "slot1": "Helpful question or hint",
    "slot2": "Helpful question or hint"
  }
}

Make sure the frames:
- Build on the student's actual responses
- Use simple, clear language
- Avoid overwhelming complexity
- Maintain the student's voice and ideas
- Are age/grade appropriate`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
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

      const frames = JSON.parse(jsonMatch[0]);
      return {
        minimal: frames.minimal,
        moderate: frames.moderate,
        maximum: frames.maximum,
        fillableSlots: frames.fillableSlots,
        slotHints: frames.slotHints,
      };
    } catch (error) {
      logger.error('AI sentence frame generation failed:', error);
      // Graceful fallback
      return {
        minimal: 'In _____, the author shows that _____.',
        moderate: 'In [text title], the author shows that [main idea] because [reason].',
        maximum: 'In [title of the text we read], the author shows that [what is the main point?] because [what evidence or examples support this?].',
        fillableSlots: {
          slot1: 'text title',
          slot2: 'main idea',
          slot3: 'supporting reason',
        },
        slotHints: {
          slot1: 'What is the title of what you read?',
          slot2: 'What is the most important point?',
          slot3: 'Why do you think this? What supports your thinking?',
        },
      };
    }
  }

  /**
   * Provide encouraging, supportive feedback on student response
   * Never critical, always constructive
   */
  static async provideFeedback(
    question: string,
    studentResponse: string,
    supportLevel: SupportLevel
  ): Promise<string> {
    try {
      const prompt = `You are a supportive special education teacher providing feedback to a student with exceptionalities.

Question: ${question}
Student's Response: ${studentResponse}
Support Level: ${supportLevel}

Provide brief, encouraging feedback that:
1. NEVER uses negative language or criticism
2. Celebrates what the student DID share
3. Gently suggests one way to add more detail (if needed)
4. Uses simple, clear language
5. Keeps the student's confidence high
6. Is 1-2 sentences maximum

${supportLevel === 'MAXIMUM' ? 'Be very specific and detailed in your guidance.' : supportLevel === 'MINIMAL' ? 'Keep feedback brief and open-ended.' : 'Provide balanced, supportive guidance.'}

Respond with just the feedback text, no extra formatting.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      });

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : 'Great thinking! You\'re on the right track.';

      return responseText.trim();
    } catch (error) {
      logger.error('AI feedback generation failed:', error);
      return 'Great thinking! You\'re doing well.';
    }
  }

  /**
   * Assemble final claim from student's filled-in sentence frame
   */
  static async assembleFinalClaim(
    sentenceFrame: string,
    filledSlots: Record<string, string>
  ): Promise<string> {
    try {
      // Replace slots with student's content
      let finalClaim = sentenceFrame;

      // Handle both _____ blanks and [prompted] blanks
      Object.entries(filledSlots).forEach(([key, value]) => {
        // Remove any brackets or prompts, just keep the student's content
        const cleanValue = value.trim();
        // Replace first occurrence of blank or prompt
        finalClaim = finalClaim.replace(/\[.*?\]|_+/, cleanValue);
      });

      return finalClaim;
    } catch (error) {
      logger.error('Claim assembly failed:', error);
      return Object.values(filledSlots).join(' ');
    }
  }

  /**
   * Generate celebratory message for completing a claim
   * Positive reinforcement for neurodivergent learners
   */
  static async generateCelebration(
    studentName?: string,
    claimTitle?: string
  ): Promise<string> {
    const celebrations = [
      `🎉 Amazing work! You just built a complete writing claim!`,
      `✨ You did it! Your thinking is clear and well-organized.`,
      `🌟 Fantastic! You worked through each step and created something great.`,
      `💪 Way to go! You stuck with it and made a strong claim.`,
      `🎯 Excellent! Your claim is thoughtful and well-supported.`,
      `🚀 You're a star! Look at what you accomplished!`,
    ];

    const randomCelebration = celebrations[Math.floor(Math.random() * celebrations.length)];

    if (studentName && claimTitle) {
      return `${randomCelebration} ${studentName}, your work on "${claimTitle}" shows real growth! 🎊`;
    } else if (claimTitle) {
      return `${randomCelebration} Your work on "${claimTitle}" is something to be proud of! 🎊`;
    }

    return randomCelebration;
  }
}

export default WritingClaimService;
