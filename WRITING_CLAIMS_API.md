# Writing Claims API Documentation

## Overview

The Writing Claims feature provides guided claim construction for students with exceptionalities (ADHD, dyslexia, ADD, SLD, SLI, autism). It uses progressive scaffolding with AI-powered probing questions and sentence starters to help students build strong writing claims for any topic or subject.

### Key Features

- **Progressive Scaffolding**: Three support levels (MINIMAL, MODERATE, MAXIMUM)
- **AI-Powered Guidance**: Intelligent probing questions adapted to topic and subject
- **Sentence Starters**: Context-aware hints to reduce cognitive load
- **Dynamic Sentence Frames**: Fill-in-the-blank templates with varying support
- **Topic Agnostic**: Works for any subject (English, History, Science, etc.)
- **Accessibility First**: Designed for neurodivergent learners

## API Endpoints

All endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### 1. Create a New Writing Claim

**POST** `/api/writing-claims`

Creates a new writing claim and generates initial probing questions.

**Request Body:**
```json
{
  "title": "The Impact of Climate Change on Polar Bears",
  "subject": "Environmental Science",
  "sourceText": "Optional passage or text to analyze...",
  "sourceTitle": "Climate Change and Arctic Wildlife",
  "supportLevel": "MODERATE"  // Optional: MINIMAL, MODERATE, or MAXIMUM
}
```

**Response:**
```json
{
  "success": true,
  "message": "Let's build your claim together! We'll take it step by step.",
  "data": {
    "claim": {
      "id": "claim_123",
      "title": "The Impact of Climate Change on Polar Bears",
      "subject": "Environmental Science",
      "supportLevel": "MODERATE",
      "status": "IN_PROGRESS",
      "currentStep": 0,
      "steps": [
        {
          "id": "step_1",
          "stepNumber": 1,
          "stepType": "PROBE",
          "question": "What is the main topic or idea in this text?",
          "hint": "Think about what the text is mostly about.",
          "sentenceStarters": [
            "This text is about...",
            "The main idea is...",
            "This focuses on..."
          ]
        },
        {
          "id": "step_2",
          "stepNumber": 2,
          "stepType": "BRAINSTORM",
          "question": "What do you think about this topic?",
          "hint": "What's your initial reaction or opinion?",
          "sentenceStarters": [
            "I think that...",
            "In my opinion...",
            "I believe..."
          ]
        }
      ]
    }
  }
}
```

---

### 2. Get All Writing Claims

**GET** `/api/writing-claims`

Retrieves all writing claims for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (`IN_PROGRESS`, `COMPLETED`, `ARCHIVED`)

**Response:**
```json
{
  "success": true,
  "message": "Here are your writing claims",
  "data": {
    "claims": [
      {
        "id": "claim_123",
        "title": "The Impact of Climate Change on Polar Bears",
        "status": "IN_PROGRESS",
        "supportLevel": "MODERATE",
        "currentStep": 2,
        "createdAt": "2025-01-15T10:30:00Z",
        "steps": [...],
        "sentenceFrame": null
      }
    ]
  }
}
```

---

### 3. Get a Specific Writing Claim

**GET** `/api/writing-claims/:id`

Retrieves a specific writing claim with all steps and progress.

**Response:**
```json
{
  "success": true,
  "message": "Here's your claim progress",
  "data": {
    "claim": {
      "id": "claim_123",
      "title": "The Impact of Climate Change on Polar Bears",
      "steps": [...],
      "sentenceFrame": {...}
    },
    "progress": 60,
    "nextStep": {
      "id": "step_3",
      "stepNumber": 3,
      "question": "What evidence supports your thinking?"
    }
  }
}
```

---

### 4. Submit a Response to a Step

**PATCH** `/api/writing-claims/:id/steps/:stepId`

Submits the student's response to a probing question.

**Request Body:**
```json
{
  "response": "Climate change is causing polar bear habitats to shrink because the ice is melting."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Great thinking! You've identified a clear connection between climate change and habitat loss.",
  "data": {
    "step": {
      "id": "step_2",
      "studentResponse": "Climate change is causing polar bear habitats to shrink because the ice is melting.",
      "isCompleted": true,
      "completedAt": "2025-01-15T11:00:00Z"
    },
    "nextStep": {
      "id": "step_3",
      "stepNumber": 3,
      "question": "What specific examples or evidence support this?"
    },
    "canGenerateFrame": false
  }
}
```

---

### 5. Generate Sentence Frames

**POST** `/api/writing-claims/:id/generate-frame`

Generates fill-in-the-blank sentence frames based on completed steps.

**Request Body:**
```json
{
  "supportLevel": "MODERATE"  // Optional: Override user's preference
}
```

**Response:**
```json
{
  "success": true,
  "message": "Great! Here's your sentence frame. Fill in the blanks with your ideas!",
  "data": {
    "sentenceFrame": {
      "id": "frame_123",
      "minimalSupport": "Climate change affects _____ because _____.",
      "moderateSupport": "Climate change affects [animal/ecosystem] because [specific impact] and [additional impact].",
      "maximumSupport": "Climate change affects [which animal or ecosystem are you writing about?] because [what is happening to their habitat?] and [what other problems does this cause?].",
      "fillableSlots": {
        "slot1": "animal/ecosystem",
        "slot2": "specific impact",
        "slot3": "additional impact"
      },
      "slotHints": {
        "slot1": "What are you writing about?",
        "slot2": "What is the main problem?",
        "slot3": "What else is affected?"
      }
    },
    "selectedFrame": "Climate change affects [animal/ecosystem] because [specific impact] and [additional impact]."
  }
}
```

---

### 6. Complete the Claim

**PATCH** `/api/writing-claims/:id/complete`

Completes the claim by filling in the sentence frame blanks.

**Request Body:**
```json
{
  "filledSlots": {
    "slot1": "polar bears",
    "slot2": "their Arctic ice habitat is melting rapidly",
    "slot3": "they have less area to hunt for seals"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "🎉 Amazing work! You just built a complete writing claim!",
  "data": {
    "claim": {
      "id": "claim_123",
      "status": "COMPLETED",
      "finalClaim": "Climate change affects polar bears because their Arctic ice habitat is melting rapidly and they have less area to hunt for seals.",
      "completedAt": "2025-01-15T11:30:00Z"
    },
    "finalClaim": "Climate change affects polar bears because their Arctic ice habitat is melting rapidly and they have less area to hunt for seals."
  }
}
```

---

### 7. Archive a Claim

**PATCH** `/api/writing-claims/:id/archive`

Archives a claim for later reference.

**Response:**
```json
{
  "success": true,
  "message": "Claim archived. You can come back to it anytime!",
  "data": {
    "claim": {
      "id": "claim_123",
      "status": "ARCHIVED"
    }
  }
}
```

---

### 8. Delete a Claim

**DELETE** `/api/writing-claims/:id`

Permanently deletes a claim.

**Response:**
```json
{
  "success": true,
  "message": "Writing claim deleted"
}
```

---

### 9. Get a Hint (Accessibility Feature)

**GET** `/api/writing-claims/:id/hint?step=1`

Retrieves hints and sentence starters for a specific step.

**Response:**
```json
{
  "success": true,
  "data": {
    "hint": "Think about what the text is mostly about.",
    "sentenceStarters": [
      "This text is about...",
      "The main idea is...",
      "This focuses on..."
    ]
  }
}
```

---

## Support Levels

### MINIMAL
- 3-4 open-ended questions
- Basic sentence frames with wide-open blanks
- Encourages independent thinking
- Example: "In _____, the author shows that _____."

### MODERATE (Default)
- 4-5 questions with hints and context
- Balanced scaffolding with helpful prompts
- Clear structure with guidance
- Example: "In [text title], the author shows that [main idea] because [reason]."

### MAXIMUM
- 5-6 questions with detailed hints and examples
- Extensive prompts and specific guidance
- Very clear expectations for each blank
- Example: "In [title of the text we read], the author shows that [what is the main point?] because [what evidence supports this?] and [what else supports this?]."

---

## Step Types

1. **PROBE** - Initial exploration of the topic
2. **BRAINSTORM** - Idea generation and opinion forming
3. **EVIDENCE** - Gathering supporting examples
4. **REASONING** - Connecting ideas and evidence
5. **REFINEMENT** - Polishing and strengthening the claim

---

## Example Workflow

```javascript
// 1. Create a new claim
const claim = await fetch('/api/writing-claims', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'The Water Cycle',
    subject: 'Science',
    supportLevel: 'MODERATE'
  })
});

// 2. Submit responses to each step
for (const step of claim.steps) {
  await fetch(`/api/writing-claims/${claim.id}/steps/${step.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      response: 'Student response here...'
    })
  });
}

// 3. Generate sentence frames
const frames = await fetch(`/api/writing-claims/${claim.id}/generate-frame`, {
  method: 'POST'
});

// 4. Complete the claim
const completed = await fetch(`/api/writing-claims/${claim.id}/complete`, {
  method: 'PATCH',
  body: JSON.stringify({
    filledSlots: {
      slot1: 'value1',
      slot2: 'value2',
      slot3: 'value3'
    }
  })
});
```

---

## User Preferences

Users can set their default writing support level in their preferences:

**PATCH** `/api/users/preferences`
```json
{
  "writingSupportLevel": "MODERATE",
  "writingCelebrations": true
}
```

---

## Celebrations

When a student completes a claim, the system automatically:
- Creates a celebration record
- Generates an encouraging message
- Triggers confetti animation (frontend integration)

Celebrations follow ADHD-friendly principles:
- Never use shame language
- Celebrate effort and progress
- Positive reinforcement
- Specific to the achievement

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Human-friendly error message"
}
```

Common HTTP status codes:
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Resource not found
- `500` - Server error (graceful fallback provided)

---

## Accessibility Features

- **Clear Language**: All prompts use simple, concrete vocabulary
- **Cognitive Load Reduction**: One question at a time
- **Visual Clarity**: Sentence frames with clear blanks
- **Hints On Demand**: Accessibility endpoint for extra support
- **Progress Tracking**: Visual progress percentage
- **Flexible Pacing**: No time pressure, work at own pace
- **Positive Feedback**: Encouraging, never critical

---

## Best Practices

1. **Start Simple**: Use MODERATE support level by default
2. **One Step at a Time**: Don't overwhelm with all questions at once
3. **Celebrate Progress**: Acknowledge each completed step
4. **Provide Hints**: Make hints easily accessible
5. **Save Frequently**: Auto-save student responses
6. **Allow Editing**: Let students revise their responses
7. **Show Progress**: Display completion percentage
8. **Reduce Anxiety**: Use warm, encouraging language

---

## Integration with Frontend

### Recommended UI Flow

1. **Topic Selection Screen**
   - Input for title/topic
   - Optional subject dropdown
   - Optional source text area
   - Support level selector (with descriptions)

2. **Question-by-Question Screen**
   - Display one question at a time
   - Show hint button (non-intrusive)
   - Display sentence starters in a helpful way
   - Large text input area
   - Encouraging feedback after submission
   - Progress bar showing % complete

3. **Sentence Frame Screen**
   - Display appropriate frame for support level
   - Clear input fields for each blank
   - Hints available for each slot
   - Preview of assembled claim
   - Option to go back and revise

4. **Completion Screen**
   - Display final claim prominently
   - Celebration animation
   - Option to save, share, or print
   - Encourage next steps (revise, expand, etc.)

---

## Questions?

For technical support or feature requests, please refer to the main project documentation or contact the development team.
