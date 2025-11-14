# Deployment Guide

Complete guide for deploying the ADHD Dashboard Backend to production.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Domain name (for production)
- SSL certificate (Let's Encrypt recommended)

## Environment Setup

### Required Environment Variables

Create a `.env` file with these required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/adhd_dashboard?schema=public"

# Server
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL="redis://localhost:6379"

# AI Service
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Google Calendar (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="https://yourdomain.com/api/auth/google/callback"

# CORS
CORS_ORIGIN="https://yourdomain.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generating JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

#### 1. Clone and Configure

```bash
git clone <repository-url>
cd adhd-dashboard
cp .env.example .env
# Edit .env with your values
```

#### 2. Build and Run

```bash
docker-compose up -d
```

#### 3. Run Migrations

```bash
docker-compose exec api npx prisma migrate deploy
```

#### 4. Verify

```bash
curl http://localhost:3000/health
```

### Option 2: Manual Deployment

#### 1. Install Dependencies

```bash
npm ci --production
```

#### 2. Build TypeScript

```bash
npm run build
```

#### 3. Run Migrations

```bash
npx prisma migrate deploy
```

#### 4. Start with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.js --name adhd-api

# Save PM2 process list
pm2 save

# Set up PM2 startup script
pm2 startup
```

### Option 3: Platform-as-a-Service

#### Railway

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add PostgreSQL and Redis services
5. Set environment variables in Railway dashboard
6. Deploy!

#### Render

1. Create account at [render.com](https://render.com)
2. New → Web Service
3. Connect repository
4. Build command: `npm install && npm run build && npx prisma generate`
5. Start command: `npx prisma migrate deploy && npm start`
6. Add PostgreSQL and Redis services
7. Set environment variables
8. Deploy!

#### Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create adhd-dashboard-api

# Add addons
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set ANTHROPIC_API_KEY=your-key

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

## Database Setup

### PostgreSQL Configuration

#### 1. Create Database

```sql
CREATE DATABASE adhd_dashboard;
CREATE USER adhd_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE adhd_dashboard TO adhd_user;
```

#### 2. Connection Pooling (Production)

Use PgBouncer for connection pooling:

```bash
# Install
sudo apt-get install pgbouncer

# Configure /etc/pgbouncer/pgbouncer.ini
[databases]
adhd_dashboard = host=localhost port=5432 dbname=adhd_dashboard

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

Update DATABASE_URL:
```
postgresql://adhd_user:password@localhost:6432/adhd_dashboard
```

### Redis Configuration

#### Production Redis Setup

```bash
# Install
sudo apt-get install redis-server

# Configure /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

## SSL/TLS Setup

### Using Nginx as Reverse Proxy

#### 1. Install Nginx

```bash
sudo apt-get install nginx
```

#### 2. Configure Nginx

Create `/etc/nginx/sites-available/adhd-dashboard`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase timeout for long-running requests
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

#### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/adhd-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Get SSL Certificate

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com
```

## Monitoring

### Health Checks

```bash
# Basic health check
curl https://api.yourdomain.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-10T12:00:00.000Z",
  "uptime": 3600
}
```

### Logs

#### PM2 Logs

```bash
# View logs
pm2 logs adhd-api

# Save logs to file
pm2 logs adhd-api > logs.txt
```

#### Docker Logs

```bash
# View logs
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail 100 api
```

### Monitoring Tools

#### Recommended Services:

- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry
- **Performance**: New Relic, Datadog
- **Logs**: Papertrail, Loggly

## Backup Strategy

### Database Backups

#### Automated Daily Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
mkdir -p $BACKUP_DIR

pg_dump adhd_dashboard > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

### Redis Backups

Redis automatically saves snapshots to dump.rdb. Copy this file regularly:

```bash
cp /var/lib/redis/dump.rdb /backups/redis/dump_$(date +%Y%m%d).rdb
```

## Performance Optimization

### Database Indexing

Ensure these indexes exist (already in schema):

```sql
CREATE INDEX idx_tasks_user_status ON tasks(userId, status);
CREATE INDEX idx_tasks_user_energy ON tasks(userId, energyRequired);
CREATE INDEX idx_brain_dumps_user_created ON brain_dumps(userId, createdAt);
```

### Redis Caching

The app uses Redis for session storage. Configure appropriately:

```env
REDIS_URL=redis://localhost:6379
```

### Node.js Optimization

```bash
# Increase Node.js memory (if needed)
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

## Scaling

### Horizontal Scaling

Run multiple instances behind a load balancer:

```bash
# PM2 cluster mode
pm2 start dist/index.js -i max --name adhd-api
```

### Database Scaling

- Use read replicas for read-heavy operations
- Implement connection pooling (PgBouncer)
- Consider database sharding for large user bases

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Strong JWT secret (min 32 characters)
- [ ] Database credentials rotated regularly
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Helmet.js security headers enabled
- [ ] Environment variables secured (not in code)
- [ ] Database backups automated
- [ ] Monitoring and alerting set up
- [ ] Logs don't contain sensitive data

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql postgresql://user:password@host:port/database

# Check Prisma connection
npx prisma db push
```

### Redis Connection Issues

```bash
# Test Redis
redis-cli ping

# Should return: PONG
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### High Memory Usage

```bash
# Monitor memory
pm2 monit

# Restart if needed
pm2 restart adhd-api
```

## Rollback Procedure

### If Deployment Fails

#### Docker

```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and start
docker-compose up -d
```

#### PM2

```bash
# Stop current version
pm2 stop adhd-api

# Checkout previous version
git checkout <previous-commit>

# Rebuild
npm run build

# Restart
pm2 restart adhd-api
```

### Database Migration Rollback

```bash
# View migration history
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back <migration-name>
```

## Support

For deployment help:
- Check [GitHub Issues](https://github.com/yourusername/adhd-dashboard-backend/issues)
- Join our Discord community
- Email: support@adhddashboard.com

---

**Remember**: Take your time, test thoroughly, and don't hesitate to ask for help! 🚀
