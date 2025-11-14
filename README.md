# ADHD Neurodivergent Resource Dashboard - Backend API

> Research-backed ADHD support system built with radical simplicity and deep respect for neurodivergent needs.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

## 🎯 Core Philosophy

- **Radical Simplicity**: Complexity kills consistency for ADHD brains
- **Zero Maintenance Burden**: Maximum automation, minimal upkeep
- **Flexible, Not Rigid**: System bends without breaking
- **Energy-Based, Not Time-Based**: Respects variable cognitive capacity
- **Built-In Grace**: Always includes "survival mode" for low-spoons days

## ✨ Key Features

### 🧠 Frictionless Brain Dumps
- Voice-to-text or quick-add capture
- AI-powered auto-categorization
- No required fields beyond the thought itself
- Optional timestamps (time blindness accommodation)

### ⚡ Energy-Based Task Management
- High/Medium/Low/Creative energy level tagging
- Automatic task breakdown into 2-minute micro-steps
- "First physical action" identification to overcome activation energy
- Flexible due dates with built-in grace periods

### 🎉 Positive Reinforcement
- Celebration system for streaks, completions, and showing up
- **Never** uses shame language
- "You broke your streak" → "You showed up 3 days in a row!"

### 🤖 AI-Powered Intelligence
- Task categorization and prioritization
- Smart task breakdown
- Time translation (combat time blindness)
- Context-aware supportive prompts

### 🔄 Automated Maintenance
- Daily dashboard generation
- Auto-archive with gentle prompts
- Energy pattern learning
- Streak tracking and celebrations

### ♿ Accessibility First
- WCAG 2.1 AAA compliance
- Screen reader optimization
- Reduced motion mode
- High contrast themes
- Dyslexia-friendly font option

## 🛠️ Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Anthropic Claude API
- **Queue**: Node-cron for background jobs
- **Auth**: JWT-based authentication
- **Security**: Helmet, rate limiting, bcrypt

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Anthropic API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/adhd-dashboard-backend.git
cd adhd-dashboard-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/adhd_dashboard"
ANTHROPIC_API_KEY="your-api-key"
JWT_SECRET="your-super-secret-key"
REDIS_URL="redis://localhost:6379"
```

4. **Run database migrations**

```bash
npm run db:migrate
```

5. **Start development server**

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

## 📚 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "Jane Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome back!",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "Jane Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Brain Dumps

#### Capture a Thought
```http
POST /api/brain-dump
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "content": "Remember to call dentist about appointment",
  "showTimestamp": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Got it! Thought captured.",
  "data": {
    "brainDump": {
      "id": "...",
      "content": "Remember to call dentist about appointment",
      "category": "URGENT",
      "suggestedEnergy": "LOW",
      "isUrgent": true,
      "isImportant": true
    },
    "suggestion": "How about: \"Call dentist\"?"
  }
}
```

### Tasks

#### Get Daily Dashboard
```http
GET /api/tasks/daily-dashboard?energy_level=MEDIUM&survival_mode=false
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Here's what feels doable today",
  "data": {
    "tasks": [...],
    "quickWins": [...],
    "survivalMode": false,
    "energyLevel": "MEDIUM"
  }
}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Write project report",
  "description": "Q4 performance analysis",
  "energyRequired": "MEDIUM",
  "autoBreakdown": true
}
```

#### Get AI Task Breakdown
```http
POST /api/tasks/task-breakdown
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Organize home office",
  "description": "Clear desk, file papers, organize cables"
}
```

**Response:**
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

#### Time Translator
```http
GET /api/tasks/time-translator?minutes=90
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "minutes": 90,
    "translation": "About 1 movie (short)"
  }
}
```

### Routines

#### Create Routine
```http
POST /api/routines
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Morning Routine",
  "type": "MORNING",
  "steps": [
    {
      "description": "Take morning meds",
      "hasTimer": false
    },
    {
      "description": "5-minute meditation",
      "hasTimer": true,
      "timerMinutes": 5
    }
  ]
}
```

#### Start Routine
```http
POST /api/routines/start
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "routineId": "routine-id-here"
}
```

### User Preferences

#### Get Preferences
```http
GET /api/users/preferences
Authorization: Bearer YOUR_TOKEN
```

#### Update Preferences
```http
PATCH /api/users/preferences
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "survivalModeEnabled": true,
  "reducedMotion": true,
  "highContrast": "HIGH",
  "celebrationsEnabled": true,
  "pomodoroLength": 25
}
```

#### Log Energy Level
```http
POST /api/users/energy
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "energyLevel": "HIGH",
  "notes": "Feeling great after morning walk!"
}
```

#### Get Energy Patterns
```http
GET /api/users/energy/patterns
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [...],
    "hourlyPatterns": {
      "9": { "high": 12, "medium": 3, "low": 1, "creative": 2 },
      ...
    },
    "insights": {
      "bestHighEnergyHours": [9, 10, 14],
      "bestCreativeHours": [20, 21, 22]
    }
  }
}
```

## 🤖 Background Jobs

The system runs three automated jobs:

### Daily Reset (Midnight)
- Archives completed tasks older than 7 days
- Generates "Top 3" tasks for tomorrow
- Based on urgency, energy patterns, and quick wins

### Auto Cleanup (Sundays at 2 AM)
- Creates gentle suggestions for old tasks
- Never forces deletion
- Archives old converted brain dumps

### Streak Checker (Daily at 6 PM)
- Celebrates 3, 7, 14, and 30-day streaks
- Celebrates "coming back" after breaks
- Always positive framing

## 🔒 Security

- JWT-based authentication
- Bcrypt password hashing (12 rounds)
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS configuration
- SQL injection protection via Prisma
- Input validation with Zod

## 📊 Database Schema

See [prisma/schema.prisma](./prisma/schema.prisma) for the complete schema.

Key tables:
- `User` - User accounts and current energy state
- `UserPreferences` - Accessibility and behavior settings
- `BrainDump` - Frictionless thought capture
- `Task` - Energy-based task management
- `TaskStep` - Micro-step breakdowns
- `Routine` - Morning/transition/evening rituals
- `EnergyLog` - Energy level tracking
- `Celebration` - Positive reinforcement events

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Deployment

### Docker

```bash
# Build image
docker build -t adhd-dashboard-api .

# Run container
docker-compose up -d
```

### Manual Deployment

1. Build TypeScript
```bash
npm run build
```

2. Run migrations
```bash
npm run db:migrate
```

3. Start production server
```bash
npm start
```

## 🌟 Performance Requirements

- Page load: < 1.5 seconds
- API responses: < 300ms
- Optimistic UI updates
- Offline-first architecture

## 🤝 Contributing

We welcome contributions that align with our ADHD-friendly philosophy:

1. **Reduce cognitive load**, never add to it
2. **Simplicity over features**
3. **Grace over guilt**
4. **Flexibility over rigidity**

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

Built with deep respect for the neurodivergent community. Every technical decision prioritizes cognitive accessibility.

Special thanks to:
- ADDitude Magazine for research insights
- Understood.org for accessibility guidelines
- The ADHD community for invaluable feedback

## 📧 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/adhd-dashboard-backend/issues)
- Email: support@adhddashboard.com

---

**Remember**: Complexity is the enemy of consistency. Keep it simple, keep it kind. 💚
