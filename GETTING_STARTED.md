# Getting Started with ADHD Dashboard

## 🎉 What You Have Now

A **complete, production-ready ADHD resource dashboard** with:

### Backend API (Node.js + Express + PostgreSQL)
✅ Full REST API with 20+ endpoints
✅ AI-powered task breakdown (Anthropic Claude)
✅ Energy-based task management
✅ Automated background jobs
✅ JWT authentication
✅ Comprehensive error handling

### Frontend Web App (Next.js + React + Tailwind)
✅ Beautiful Apple-inspired UI
✅ Brain Dump (hero feature)
✅ Today View dashboard
✅ Energy level selection
✅ Survival mode (top 3 tasks)
✅ Task detail modal with AI breakdown
✅ PWA support (install to home screen)
✅ Mobile-responsive

---

## 🚀 Quick Start (Development)

### 1. Run the Backend

```bash
cd adhd-dashboard
npm install

# Set up environment
cp .env.example .env
# Edit .env with your keys (see below)

# Start PostgreSQL (via Docker)
docker-compose up -d postgres redis

# Run migrations
npm run db:migrate

# Start server
npm run dev
```

Backend runs at: http://localhost:3000

### 2. Run the Frontend

```bash
cd frontend
npm install

# Set up environment
cp .env.example .env
# Add: NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000 (Next.js)

### 3. Open in Browser

Go to http://localhost:3000
- Register an account
- Start using the dashboard!

---

## 🔑 Required API Keys

### Anthropic (AI Features)

1. Go to https://console.anthropic.com/
2. Sign up / Log in
3. Create an API key
4. Add to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

### JWT Secret (Security)

Generate a secure random string:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Add to `.env`:
```
JWT_SECRET=your-generated-secret-here
```

---

## 📦 What's in the Repository

```
adhd-dashboard/
├── README.md                    # Main project documentation
├── DEPLOYMENT.md                # Backend deployment guide
├── DEPLOYMENT_FRONTEND.md       # Frontend deployment guide
├── API_REFERENCE.md             # Complete API documentation
├── CONTRIBUTING.md              # Contribution guidelines
│
├── backend/
│   ├── src/
│   │   ├── index.ts            # Main server entry
│   │   ├── config/             # Configuration
│   │   ├── controllers/        # API controllers
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Auth, error handling
│   │   ├── routes/             # API routes
│   │   └── jobs/               # Background automation
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/                # Next.js pages
    │   │   ├── login/          # Login page
    │   │   ├── register/       # Registration
    │   │   └── dashboard/      # Main dashboard
    │   ├── components/
    │   │   ├── ui/            # Reusable components
    │   │   └── dashboard/     # Dashboard features
    │   ├── lib/
    │   │   ├── api.ts         # API client
    │   │   └── utils.ts       # Helper functions
    │   └── store/
    │       └── useStore.ts    # Global state
    └── package.json
```

---

## 🎯 Key Features

### 1. Brain Dump (Hero Feature)

**What it does:**
- Frictionless thought capture
- AI categorizes automatically
- No required fields
- Voice support ready

**How to use:**
```typescript
// Frontend
<BrainDumpInput />

// Backend
POST /api/brain-dump
{
  "content": "Remember to call dentist"
}

// AI automatically:
// - Categorizes (URGENT)
// - Suggests energy level (LOW)
// - Identifies if urgent/important
```

### 2. Energy-Based Task Management

**What it does:**
- Tasks tagged by energy level
- Dashboard filters by current energy
- AI suggests best task type for energy level

**How to use:**
```typescript
// Set energy level
POST /api/users/energy
{
  "energyLevel": "LOW"
}

// Get filtered dashboard
GET /api/tasks/daily-dashboard?energy_level=LOW

// Returns only LOW energy tasks
```

### 3. Automatic Task Breakdown

**What it does:**
- AI breaks complex tasks into 2-minute steps
- Identifies "first physical action"
- Provides tangible time references

**How to use:**
```typescript
POST /api/tasks/task-breakdown
{
  "title": "Write project report",
  "description": "Q4 analysis"
}

// Returns:
{
  "steps": [
    {
      "description": "Open Google Docs and create document",
      "estimatedMinutes": 2
    },
    ...
  ],
  "firstPhysicalAction": "Open Google Docs",
  "tangibleTimeRef": "About half a TV show"
}
```

### 4. Survival Mode

**What it does:**
- Shows only top 3 tasks
- Perfect for overwhelming days
- Reduces decision fatigue

**How to use:**
```typescript
// Enable survival mode
GET /api/tasks/daily-dashboard?survival_mode=true

// Returns max 3 tasks
```

### 5. Background Automation

**What runs automatically:**

- **Daily Reset (Midnight)**: Archives old tasks, generates Top 3
- **Auto Cleanup (Weekly)**: Suggests releasing old tasks
- **Streak Checker (Daily)**: Celebrates consistency

All configured in `/src/jobs/`

---

## 🧪 Testing the App

### Manual Testing Checklist

- [ ] Register new account
- [ ] Login works
- [ ] Brain dump saves thought
- [ ] AI categorizes brain dump
- [ ] Can convert brain dump to task
- [ ] Task shows AI breakdown
- [ ] Energy selector changes dashboard
- [ ] Survival mode shows 3 tasks
- [ ] Can complete task
- [ ] Celebration appears
- [ ] Logout works

### Test User Flow

1. Register: `test@example.com` / `password123`
2. Set energy: Click "Medium Energy"
3. Brain dump: "Write history essay"
4. View AI suggestion
5. Click task to see breakdown
6. Complete first step
7. See progress update

---

## 🌐 Deploy to Production

### Recommended Setup

**Backend**: Render.com (Free tier)
- See DEPLOYMENT.md
- Cost: $0 or $14/month

**Frontend**: Vercel (Free tier)
- See DEPLOYMENT_FRONTEND.md
- Cost: $0

**Total**: Free to start!

### Quick Deploy Commands

```bash
# Backend to Render
# 1. Push to GitHub (done!)
# 2. Go to render.com
# 3. Import from GitHub
# 4. Add environment variables
# 5. Deploy

# Frontend to Vercel
# 1. Go to vercel.com
# 2. Import from GitHub
# 3. Add NEXT_PUBLIC_API_URL
# 4. Deploy
```

Full guides in DEPLOYMENT.md and DEPLOYMENT_FRONTEND.md

---

## 📱 Mobile/PWA Features

The app works as a Progressive Web App:

**iPhone**:
1. Open in Safari
2. Share → Add to Home Screen
3. Opens like native app!

**Android**:
1. Open in Chrome
2. Menu → Add to Home Screen
3. Opens like native app!

**Features**:
- Offline support (basic)
- Install to home screen
- App icon
- Splash screen
- Fullscreen mode

---

## 🎨 Design System

### Colors (Apple-Inspired)

```css
--ios-blue: #007AFF    /* Primary actions */
--ios-green: #34C759   /* Success, high energy */
--ios-orange: #FF9500  /* Warning, low energy */
--ios-purple: #AF52DE  /* Creative mode */
```

### Typography

- Font: System fonts (SF Pro on Apple, Inter fallback)
- Sizes: 14px (small), 16px (body), 20px (headings)
- Weight: Medium (500) for emphasis

### Spacing

- 4px base unit
- Generous whitespace (ADHD-friendly)
- Rounded corners: 12-24px

---

## 🔧 Customization

### Add New Energy Level

1. Update enum in `prisma/schema.prisma`:
   ```prisma
   enum EnergyLevel {
     HIGH
     MEDIUM
     LOW
     CREATIVE
     HYPER  // New!
   }
   ```

2. Run migration:
   ```bash
   npx prisma migrate dev
   ```

3. Update frontend `EnergySelector.tsx`

### Add New Celebration Type

1. Update enum in schema
2. Add celebration trigger in `/src/jobs/streakChecker.ts`
3. Frontend automatically displays it

### Customize Time Translations

Edit `/src/services/aiService.ts`:
```typescript
static translateTime(minutes: number): string {
  if (minutes <= 5) return 'One TikTok video';
  // Add your own!
}
```

---

## 🐛 Troubleshooting

### Backend won't start

**Check**:
1. PostgreSQL running? `docker-compose up -d postgres`
2. .env file created? `cp .env.example .env`
3. Migrations run? `npm run db:migrate`

### Frontend can't connect to backend

**Check**:
1. Backend URL correct in `.env`?
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```
2. Backend server running?
3. CORS enabled in backend? (should be by default)

### AI features not working

**Check**:
1. Anthropic API key in `.env`?
2. API key valid?
3. Check backend logs for errors

### Database errors

**Reset database**:
```bash
npx prisma migrate reset
npm run db:migrate
```

---

## 📊 For LAUSD Pitch

### What to Show

1. **Login screen** - Clean, minimal, accessible
2. **Brain Dump** - Hero feature, show AI categorization
3. **Today View** - Energy filtering in action
4. **Survival Mode** - "Just tell me what to do"
5. **Task Detail** - AI breakdown into micro-steps
6. **Mobile view** - Responsive design
7. **PWA install** - Works like native app

### Key Talking Points

- **Built specifically for ADHD**: Not a general productivity app
- **Energy-based, not time-based**: Respects variable capacity
- **AI-powered**: Reduces cognitive load, not adds to it
- **Zero shame language**: Always supportive, never guilt-inducing
- **Free tier available**: Start with free, scale up as needed
- **Privacy-first**: No data selling, end-to-end encryption ready

### Demo Account

Create a demo account with sample data:
```bash
npm run db:seed
```

Credentials: `demo@lausd.org` / `DemoPassword123`

---

## 🎓 Learning Resources

### For Developers

- Next.js: https://nextjs.org/docs
- Prisma: https://prisma.io/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Anthropic AI: https://docs.anthropic.com

### For ADHD Understanding

- ADDitude Magazine: https://additudemag.com
- Understood.org: https://understood.org
- How to ADHD (YouTube): Jessica McCabe's channel

---

## 🤝 Contributing

See CONTRIBUTING.md for:
- Code of conduct
- Development workflow
- Pull request process
- ADHD-friendly contribution tips

---

## 📝 License

MIT - See LICENSE file

---

## 💚 Support

**Questions?**
- Check README.md
- See API_REFERENCE.md
- Read deployment guides
- Open GitHub issue

**Remember**: This was built WITH and FOR the neurodivergent community. Every feature prioritizes cognitive accessibility over complexity.

**You've got this!** 🧠✨
