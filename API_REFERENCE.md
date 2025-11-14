# API Reference

Complete API documentation for the ADHD Dashboard Backend.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Human-friendly message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Human-friendly error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Endpoints

### Authentication

#### `POST /api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "Jane Doe" // optional
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Welcome aboard! Your account is ready.",
  "data": {
    "user": {
      "id": "clx123abc",
      "email": "user@example.com",
      "name": "Jane Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### `POST /api/auth/login`

Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Welcome back!",
  "data": {
    "user": {
      "id": "clx123abc",
      "email": "user@example.com",
      "name": "Jane Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### `GET /api/auth/me`

Get current user info.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123abc",
      "email": "user@example.com"
    }
  }
}
```

---

### Brain Dumps

#### `POST /api/brain-dump`

Capture a thought with AI categorization.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "content": "Remember to call dentist about appointment",
  "audioUrl": "https://...", // optional
  "showTimestamp": false // optional, default: false
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Got it! Thought captured.",
  "data": {
    "brainDump": {
      "id": "clx456def",
      "content": "Remember to call dentist about appointment",
      "category": "URGENT",
      "suggestedEnergy": "LOW",
      "isUrgent": true,
      "isImportant": true,
      "createdAt": "2024-01-01T10:30:00.000Z"
    },
    "suggestion": "How about: \"Call dentist\"?"
  }
}
```

---

#### `GET /api/brain-dump`

Get all brain dumps.

**Headers:** Requires authentication

**Query Parameters:**
- `converted` (optional): Filter by conversion status (`true` | `false`)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "brainDumps": [
      {
        "id": "clx456def",
        "content": "Remember to call dentist",
        "category": "URGENT",
        "convertedToTask": false,
        "createdAt": "2024-01-01T10:30:00.000Z"
      }
    ]
  }
}
```

---

#### `POST /api/brain-dump/:id/convert`

Convert a brain dump to a task with AI breakdown.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Converted to task!",
  "data": {
    "task": {
      "id": "clx789ghi",
      "title": "Remember to call dentist",
      "energyRequired": "LOW",
      "difficulty": "EASY",
      "steps": [
        {
          "order": 0,
          "description": "Find dentist phone number",
          "estimatedMinutes": 2
        },
        {
          "order": 1,
          "description": "Call and schedule appointment",
          "estimatedMinutes": 5
        }
      ]
    }
  }
}
```

---

### Tasks

#### `GET /api/tasks/daily-dashboard`

Get today's task dashboard filtered by energy level and survival mode.

**Headers:** Requires authentication

**Query Parameters:**
- `energy_level` (optional): `HIGH` | `MEDIUM` | `LOW` | `CREATIVE`
- `survival_mode` (optional): `true` | `false`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Here's what feels doable today",
  "data": {
    "tasks": [
      {
        "id": "clx789ghi",
        "title": "Call dentist",
        "energyRequired": "LOW",
        "isQuickWin": true,
        "estimatedMinutes": 7,
        "tangibleTimeRef": "About one song",
        "steps": [...]
      }
    ],
    "quickWins": [...],
    "survivalMode": false,
    "energyLevel": "MEDIUM"
  }
}
```

---

#### `POST /api/tasks`

Create a new task with optional AI breakdown.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "title": "Write project report",
  "description": "Q4 performance analysis", // optional
  "energyRequired": "MEDIUM", // optional
  "dueDate": "2024-01-15T00:00:00.000Z", // optional
  "autoBreakdown": true // optional, default: true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Task created!",
  "data": {
    "task": {
      "id": "clxabc123",
      "title": "Write project report",
      "energyRequired": "MEDIUM",
      "difficulty": "MEDIUM",
      "hasBreakdown": true,
      "firstPhysicalAction": "Open Google Docs",
      "estimatedMinutes": 45,
      "tangibleTimeRef": "About half a TV show",
      "steps": [...]
    }
  }
}
```

---

#### `POST /api/tasks/task-breakdown`

Get AI breakdown for any task (without creating it).

**Headers:** Requires authentication

**Request Body:**
```json
{
  "title": "Organize home office",
  "description": "Clear desk, file papers, organize cables" // optional
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Here's how to tackle this:",
  "data": {
    "steps": [
      {
        "description": "Clear everything off desk surface",
        "estimatedMinutes": 5
      },
      {
        "description": "Sort items into 3 piles: keep, trash, relocate",
        "estimatedMinutes": 8
      }
    ],
    "firstPhysicalAction": "Grab a trash bag",
    "difficulty": "MEDIUM",
    "energyRequired": "MEDIUM"
  }
}
```

---

#### `PATCH /api/tasks/:id/complete`

Mark a task as complete and trigger celebration.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "You did it! 🎉",
  "data": {
    "task": {
      "id": "clxabc123",
      "title": "Write project report",
      "status": "COMPLETED",
      "completedAt": "2024-01-10T14:30:00.000Z"
    }
  }
}
```

---

#### `GET /api/tasks/time-translator`

Convert abstract time to tangible references.

**Headers:** Requires authentication

**Query Parameters:**
- `minutes` (required): Number of minutes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "minutes": 90,
    "translation": "About 1 movie (short)"
  }
}
```

---

### Routines

#### `POST /api/routines`

Create a new routine.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "name": "Morning Routine",
  "type": "MORNING", // MORNING | TRANSITION | EVENING | CUSTOM
  "description": "Start the day right", // optional
  "timeOfDay": "8:00", // optional
  "daysOfWeek": [1, 2, 3, 4, 5], // optional, 0=Sunday
  "steps": [
    {
      "description": "Take morning meds",
      "hasTimer": false,
      "isOptional": false
    },
    {
      "description": "5-minute meditation",
      "hasTimer": true,
      "timerMinutes": 5,
      "isOptional": true
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Routine created!",
  "data": {
    "routine": {
      "id": "clxrtn123",
      "name": "Morning Routine",
      "type": "MORNING",
      "steps": [...]
    }
  }
}
```

---

#### `GET /api/routines`

Get all user routines.

**Headers:** Requires authentication

**Query Parameters:**
- `type` (optional): Filter by routine type

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "routines": [
      {
        "id": "clxrtn123",
        "name": "Morning Routine",
        "type": "MORNING",
        "steps": [...],
        "completionCount": 12
      }
    ]
  }
}
```

---

#### `POST /api/routines/start`

Start a routine session.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "routineId": "clxrtn123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Let's start: Morning Routine",
  "data": {
    "session": {
      "id": "clxses456",
      "routineId": "clxrtn123",
      "startedAt": "2024-01-10T08:00:00.000Z",
      "totalSteps": 5
    },
    "routine": {...},
    "firstStep": {
      "description": "Take morning meds",
      "hasTimer": false
    }
  }
}
```

---

### User Preferences

#### `GET /api/users/preferences`

Get user preferences.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "preferences": {
      "survivalModeEnabled": false,
      "survivalModeTaskLimit": 3,
      "reducedMotion": false,
      "highContrast": "STANDARD",
      "dyslexicFont": false,
      "celebrationsEnabled": true,
      "pomodoroLength": 25,
      "pomodoroBreakLength": 5
    }
  }
}
```

---

#### `PATCH /api/users/preferences`

Update user preferences.

**Headers:** Requires authentication

**Request Body:** (all fields optional)
```json
{
  "survivalModeEnabled": true,
  "reducedMotion": true,
  "highContrast": "HIGH", // STANDARD | HIGH | MAXIMUM
  "dyslexicFont": true,
  "celebrationsEnabled": true,
  "pomodoroLength": 30
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Preferences updated!",
  "data": {
    "preferences": {...}
  }
}
```

---

#### `POST /api/users/energy`

Log current energy level.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "energyLevel": "HIGH", // HIGH | MEDIUM | LOW | CREATIVE
  "notes": "Feeling great after morning walk!" // optional
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Energy level updated!",
  "data": {
    "log": {
      "id": "clxeng789",
      "energyLevel": "HIGH",
      "timestamp": "2024-01-10T09:00:00.000Z"
    }
  }
}
```

---

#### `GET /api/users/energy/patterns`

Get energy patterns and insights over time.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "logs": [...],
    "hourlyPatterns": {
      "9": { "high": 12, "medium": 3, "low": 1, "creative": 2 },
      "14": { "high": 8, "medium": 5, "low": 2, "creative": 1 }
    },
    "insights": {
      "bestHighEnergyHours": [9, 10, 14],
      "bestCreativeHours": [20, 21, 22]
    }
  }
}
```

---

#### `GET /api/users/celebrations`

Get recent celebrations and mark as acknowledged.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "celebrations": [
      {
        "id": "clxcel123",
        "type": "STREAK",
        "message": "You showed up 3 days in a row! 🔥",
        "createdAt": "2024-01-10T18:00:00.000Z",
        "acknowledged": false
      }
    ]
  }
}
```

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes
- **Brain Dumps**: 500 requests per 15 minutes (generous for thought capture)

When rate limited, you'll receive:

```json
{
  "success": false,
  "message": "You're going too fast! Take a breath, and try again in a few minutes."
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

## ADHD-Friendly Design Principles

All error messages follow these principles:

1. **Never blame**: "Hmm, something doesn't look right" instead of "You entered invalid data"
2. **Offer solutions**: "Want to update it instead?" when duplicate exists
3. **Gentle language**: "Maybe it was already deleted?" instead of "Resource not found"
4. **Reassurance**: "It's not your fault!" for server errors

---

For more details, see the [README](./README.md).
