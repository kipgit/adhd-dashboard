# Frontend Deployment Guide

Complete guide for deploying the ADHD Dashboard frontend to production.

## Quick Deploy to Vercel (Recommended - 5 minutes)

### Prerequisites
- GitHub account
- Vercel account (free tier works great)
- Backend API deployed and running

### Steps

1. **Push frontend to GitHub** (already done!)

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com/api
   ```

4. **Deploy!**
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app is live! 🎉

5. **Set Up Custom Domain** (Optional)
   - In Vercel project settings → Domains
   - Add your domain (e.g., adhddashboard.com)
   - Update DNS records as shown
   - SSL certificate auto-generated

### Auto-Deployment
Every push to `main` branch auto-deploys. That's it!

---

## Alternative: Deploy to Netlify

### Steps

1. **Import from GitHub**
   - Go to [netlify.com](https://netlify.com)
   - "Add new site" → "Import from Git"
   - Select repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com/api
   ```

4. **Deploy**

---

## Alternative: Deploy to Railway

### Steps

1. **New Project**
   - Go to [railway.app](https://railway.app)
   - "New Project" → "Deploy from GitHub"

2. **Settings**
   - Railway auto-detects Next.js
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com/api
     ```

3. **Deploy**

Cost: ~$5/month (pay-as-you-go)

---

## Local Development

### Quick Start

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

Open http://localhost:3000

### Environment Variables

Create `.env.local`:

```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Production (example)
# NEXT_PUBLIC_API_URL=https://adhd-api.onrender.com/api
```

---

## Testing Before Deployment

### 1. Build Locally

```bash
npm run build
npm start
```

Test at http://localhost:3000

### 2. Check for Errors

```bash
npm run lint      # Check code quality
npm run type-check # Check TypeScript
```

### 3. Test API Connection

- Login should work
- Brain dump should save
- Tasks should load
- Energy selector should update

---

## Full Setup: Backend + Frontend

### Option 1: Separate Hosting (Recommended)

**Backend**: Render.com
- Deploy API to Render
- Get URL: `https://adhd-api.onrender.com`

**Frontend**: Vercel
- Deploy frontend to Vercel
- Set `NEXT_PUBLIC_API_URL=https://adhd-api.onrender.com/api`

**Domain Setup**:
- `api.adhddashboard.com` → Render (backend)
- `adhddashboard.com` → Vercel (frontend)

### Option 2: All on Railway

1. Deploy backend service
2. Deploy frontend service
3. Both auto-connected
4. Custom domain for frontend

---

## Progressive Web App (PWA)

The app works as a PWA out of the box!

### Install on Mobile

**iPhone/iPad**:
1. Open in Safari
2. Tap Share button
3. "Add to Home Screen"
4. Opens like native app!

**Android**:
1. Open in Chrome
2. Tap menu (3 dots)
3. "Add to Home Screen"
4. Opens like native app!

### Features
- Works offline (basic functionality)
- Installable
- Fast loading
- App-like experience

---

## Performance Optimization

### Already Configured

- ✅ Next.js automatic code splitting
- ✅ Image optimization
- ✅ Font optimization (Inter)
- ✅ Tailwind CSS purging
- ✅ Gzip compression

### Performance Targets

- First Contentful Paint: <1.5s
- Time to Interactive: <2.5s
- Lighthouse Score: >90

### Check Performance

```bash
npm run build
npm run start

# Open Chrome DevTools → Lighthouse
# Run audit
```

---

## Monitoring & Analytics

### Vercel Analytics (Free)

1. In Vercel project settings
2. Enable "Analytics"
3. See pageviews, performance, etc.

### Error Tracking (Optional)

**Sentry** (recommended):
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Follow prompts to configure.

---

## Troubleshooting

### "Failed to fetch" errors

**Issue**: Frontend can't reach backend

**Fix**:
1. Check `NEXT_PUBLIC_API_URL` is correct
2. Backend must have CORS enabled for frontend domain
3. Backend must be running

### White screen after login

**Issue**: API token not being saved

**Fix**:
1. Check browser console for errors
2. Ensure backend JWT_SECRET is set
3. Clear browser localStorage and try again

### Styles not loading

**Issue**: Tailwind CSS not building

**Fix**:
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Build fails on Vercel

**Issue**: TypeScript errors or missing dependencies

**Fix**:
1. Run `npm run build` locally first
2. Fix any TypeScript errors
3. Commit and push

---

## Updating After Deployment

### Deploy New Changes

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel auto-deploys in ~2 minutes
# Check deployment status in Vercel dashboard
```

### Rollback

In Vercel:
1. "Deployments" tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

---

## Security Checklist

Before going live:

- [ ] Environment variables set correctly
- [ ] No API keys in frontend code
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] CSP headers configured (Vercel does this)
- [ ] Rate limiting on backend
- [ ] CORS configured correctly

---

## Cost Breakdown

### Free Tier (Perfect for Starting)

**Frontend** (Vercel):
- Free tier: Unlimited deployments
- 100GB bandwidth/month
- Auto HTTPS
- **Cost: $0/month**

**Backend** (Render):
- Free tier: Sleeps after 15min inactivity
- 750 hours/month free
- **Cost: $0/month** (or $7 for always-on)

**Domain** (Namecheap):
- $8-12/year
- **Cost: ~$1/month**

**Total**: $0-8/month to start

### Production Tier

**Frontend** (Vercel Pro):
- $20/month
- More bandwidth
- Better analytics

**Backend** (Render):
- $7/month: Always-on API
- $7/month: PostgreSQL database
- **Cost: $14/month**

**Total**: $34/month for production

---

## Custom Domain Setup

### 1. Buy Domain

Recommended registrars:
- Namecheap
- Google Domains
- Cloudflare

### 2. Configure DNS

**For Frontend** (Vercel):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)
```

**For API** (if separate):
```
Type: CNAME
Name: api
Value: your-app.onrender.com
```

### 3. Add to Platform

**Vercel**:
- Project Settings → Domains
- Add "adhddashboard.com"
- Vercel verifies DNS
- SSL auto-generated

---

## Support & Maintenance

### Monitoring

Check these regularly:
- Vercel deployment status
- Backend API health endpoint
- Error logs in Vercel
- Database backups

### Updates

1. **Dependencies**: Monthly
   ```bash
   npm update
   npm audit fix
   ```

2. **Next.js**: When new version releases
   ```bash
   npm install next@latest react@latest react-dom@latest
   ```

3. **Security**: Immediately when notified
   ```bash
   npm audit
   npm audit fix
   ```

---

## Going Live Checklist

Before sharing with users:

- [ ] Both frontend and backend deployed
- [ ] Custom domain configured
- [ ] SSL certificate active (auto on Vercel)
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test brain dump creation
- [ ] Test task completion
- [ ] Test energy level changes
- [ ] Test on mobile device
- [ ] Test PWA installation
- [ ] Backend database backups configured
- [ ] Error monitoring set up
- [ ] LAUSD stakeholders notified

---

## For LAUSD Pitch

### Demo URLs

Provide:
- **Live App**: https://adhddashboard.com
- **Test Account**: demo@adhddashboard.com / DemoPassword123
- **API Docs**: https://api.adhddashboard.com/docs
- **GitHub**: https://github.com/kipgit/adhd-dashboard2

### Screenshots

Take screenshots of:
- Login screen
- Brain dump
- Today view
- Task detail modal
- Energy selector
- Mobile view

### Performance Metrics

Run and document:
- Lighthouse score
- Load time
- API response time
- Mobile performance

---

## Questions?

- Frontend issues: Check browser console
- Deployment issues: Check Vercel logs
- Backend issues: Check Render logs
- General questions: See main README.md

**Remember**: Start with free tiers, scale up as needed. The ADHD community needs this! 💚
