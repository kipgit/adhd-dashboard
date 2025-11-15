# Quick Start Guide - ADHD Dashboard

## Current State
- ✅ **Backend API** - Fully functional REST API
- ❌ **Frontend Web App** - NOT BUILT YET (you can't see anything yet)
- ❌ **Database** - Need to set up PostgreSQL

## What You Need to Actually Use This

### Option 1: Just Want to See It Work? (Skip to "Easiest Hosting" below)

### Option 2: Run Locally for Development

---

## How to Download & Run Locally

### Step 1: Clone from GitHub

```bash
# Clone the repository
git clone https://github.com/kipgit/adhd-dashboard2.git
cd adhd-dashboard2

# Install dependencies
npm install
```

### Step 2: Set Up Database

**Option A: Use Docker (Easiest)**
```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# This creates:
# - PostgreSQL on localhost:5432
# - Redis on localhost:6379
```

**Option B: Install PostgreSQL Manually**
- Mac: `brew install postgresql@15`
- Windows: Download from postgresql.org
- Linux: `sudo apt-get install postgresql`

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use any text editor
```

**Minimum required .env:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/adhd_dashboard"
JWT_SECRET="your-super-secret-key-at-least-32-characters-long"
ANTHROPIC_API_KEY="sk-ant-your-key-here"
REDIS_URL="redis://localhost:6379"
PORT=3000
NODE_ENV=development
```

**Get Anthropic API Key:**
1. Go to https://console.anthropic.com/
2. Sign up / Log in
3. Create an API key
4. Paste in .env file

### Step 4: Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates database tables)
npm run db:migrate
```

### Step 5: Start the Server

```bash
# Development mode (auto-reloads on changes)
npm run dev

# You should see:
# 🚀 ADHD Dashboard API running on port 3000
```

### Step 6: Test It Works

Open another terminal:
```bash
# Test health endpoint
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":...}
```

---

## What Can You Do Right Now?

### You Can Test the API

**Create an account:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**You'll get back a token:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Use that token to create a task:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Write history essay",
    "description": "500 words on the Civil War"
  }'
```

**The AI will break it down into micro-steps!**

### But... You Can't Actually *Use* It

There's no web interface. You can only test via:
- ✅ curl commands (command line)
- ✅ Postman (API testing tool)
- ✅ Thunder Client (VS Code extension)
- ❌ Actual web browser (nothing to see)

---

## We Need to Build the Frontend

I can build a beautiful Next.js frontend that:
- Looks like Apple Notes
- Works on mobile
- Connects to this API
- Actually lets users capture thoughts and manage tasks

**Should I build that next?** It would take about 2-3 days.

---

## Easiest & Cheapest Hosting Options

### Option 1: **Render.com** (RECOMMENDED - Free tier available)

**Pros:**
- Free tier (enough to start)
- Auto-deploys from GitHub
- Built-in PostgreSQL
- Easy domain setup
- One-click updates

**Costs:**
- Free: API + Database (sleeps after 15 min inactivity)
- $7/month: API always on
- $7/month: Database (persistent)
- **Total: $14/month for production** OR Free for testing

**Setup:**
1. Go to https://render.com
2. Sign up with GitHub
3. "New" → "Web Service"
4. Connect `kipgit/adhd-dashboard2` repo
5. Settings:
   - Build: `npm install && npm run build && npx prisma generate`
   - Start: `npx prisma migrate deploy && npm start`
6. Add PostgreSQL service
7. Environment variables (copy from .env)
8. Deploy!

**Custom Domain:**
- Buy domain from Namecheap ($8/year) or Google Domains
- In Render: "Settings" → "Custom Domain"
- Add CNAME record in your domain DNS
- Done!

**Updates:** Just push to GitHub → Auto-deploys

---

### Option 2: **Railway.app** (Beginner-Friendly)

**Pros:**
- $5 free credit per month
- Beautiful interface
- One-click PostgreSQL + Redis
- GitHub auto-deploy

**Costs:**
- Pay-as-you-go (usually $5-10/month)

**Setup:**
1. https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select repo
4. Add PostgreSQL + Redis services
5. Set environment variables
6. Deploy!

---

### Option 3: **Fly.io** (Most Cost-Effective at Scale)

**Pros:**
- Free tier: 3GB RAM, 160GB bandwidth
- Global deployment
- Good for scale

**Cons:**
- Requires command line
- Slightly more complex

**Costs:**
- Free tier covers small usage
- ~$5-15/month if you exceed free tier

---

### Option 4: **Vercel** (IF we build Next.js frontend)

**Pros:**
- Best for Next.js
- Free tier is generous
- Automatic HTTPS
- Global CDN

**Costs:**
- Free: Hobby tier (perfect for starting)
- $20/month: Pro (if needed later)

**Note:** Vercel is for frontend. Backend would still need Render/Railway.

---

## Recommended Stack for You

**For Backend API (what we have now):**
- **Host:** Render.com free tier to start
- **Database:** Render PostgreSQL free tier
- **Cost:** $0 (or $14/month for always-on)

**For Frontend (need to build):**
- **Host:** Vercel (free tier)
- **Cost:** $0

**Domain:**
- **Namecheap:** adhddashboard.com ($8/year)
- Point to both Render (api.adhddashboard.com) and Vercel (adhddashboard.com)

**Total Monthly Cost:**
- **Testing/Demo:** $0 (free tiers)
- **Production (always-on):** $14/month
- **Domain:** $8/year ($0.67/month)
- **TOTAL: $14.67/month**

---

## Easy Update Workflow

### With Render/Railway/Vercel:

```bash
# Make changes to code
git add .
git commit -m "Added new feature"
git push

# That's it! Auto-deploys in 2-3 minutes
```

No manual deployments. No server management. Just push to GitHub.

---

## What Should We Do Next?

### Immediate Options:

**Option A: Push to GitHub & Host Backend**
1. You manually push code to GitHub (needs your credentials)
2. I guide you through Render setup
3. Backend API is live
4. You can test with Postman
5. **Cost:** Free
6. **Time:** 30 minutes

**Option B: Build Frontend Web App**
1. I build Next.js frontend (beautiful, Apple-style)
2. Users can actually USE the app
3. Deploy frontend to Vercel (free)
4. Backend to Render (free)
5. **Cost:** Free
6. **Time:** 2-3 days for MVP

**Option C: Do Both**
1. You get the backend hosted now
2. I build frontend over next few days
3. You have a complete working app
4. **Cost:** Free (or $14/month for production)
5. **Time:** 30 min setup + 3 days development

---

## How to Push to GitHub (From Your Computer)

Since I can't authenticate with GitHub from here, you'll need to:

### Option 1: Push from Your Machine

```bash
# Download the code (if you don't have it)
# I can create a zip file, or...

# Clone the current repo
git clone [current-location]
cd adhd-dashboard

# Update remote
git remote set-url origin https://github.com/kipgit/adhd-dashboard2.git

# Push to GitHub
git push -u origin claude/adhd-dashboard-backend-01TaZbgQqn6AN3F2eR5tG8gr

# Or push to main branch:
git checkout -b main
git merge claude/adhd-dashboard-backend-01TaZbgQqn6AN3F2eR5tG8gr
git push -u origin main
```

### Option 2: I Create a Downloadable Archive

I can create a .zip file with all the code that you can:
1. Download
2. Extract
3. Upload to GitHub manually

---

## What Do You Want to Do?

Tell me:
1. **Do you want to see the backend live first?** (I'll guide you through Render)
2. **Do you want me to build the frontend?** (So people can actually use it)
3. **Both?** (Backend live now, frontend in 3 days)
4. **Just create a zip file?** (You handle GitHub manually)

**My recommendation:** Option C (Both). Get backend hosted on Render's free tier today, and I'll build a beautiful frontend over the next few days so you have a complete working product.

What works best for you?
