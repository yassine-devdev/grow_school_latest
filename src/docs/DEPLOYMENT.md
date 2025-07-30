# Deployment Guide

This document provides comprehensive instructions for deploying the Grow School application to various environments.

## Overview

Grow School is a Next.js application that can be deployed to multiple platforms. This guide covers deployment to Vercel, AWS, Docker, and other popular hosting providers.

## Prerequisites

- Node.js 18+ installed
- Git repository access
- Environment variables configured
- Database (PocketBase) setup
- Domain name (for production)

## Environment Configuration

### Environment Variables

Create environment files for different environments:

**`.env.local` (Development)**
```env
# Database
DATABASE_URL=http://localhost:8090
POCKETBASE_URL=http://localhost:8090

# Authentication
JWT_SECRET=your-jwt-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# AI Services
OLLAMA_URL=http://localhost:11434
OPENAI_API_KEY=your-openai-key (optional)

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Security
CSRF_SECRET=your-csrf-secret
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Features
ENABLE_AI_FEATURES=true
ENABLE_WEBSOCKETS=true
ENABLE_ANALYTICS=true
```

**`.env.production` (Production)**
```env
# Database
DATABASE_URL=https://your-pocketbase-instance.com
POCKETBASE_URL=https://your-pocketbase-instance.com

# Authentication
JWT_SECRET=production-jwt-secret
NEXTAUTH_SECRET=production-nextauth-secret
NEXTAUTH_URL=https://your-domain.com

# AI Services
OLLAMA_URL=https://your-ollama-instance.com
OPENAI_API_KEY=your-production-openai-key

# Email
SMTP_HOST=your-production-smtp-host
SMTP_PORT=587
SMTP_USER=your-production-email
SMTP_PASS=your-production-password

# File Storage
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760

# Security
CSRF_SECRET=production-csrf-secret
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Features
ENABLE_AI_FEATURES=true
ENABLE_WEBSOCKETS=true
ENABLE_ANALYTICS=true
```

## Vercel Deployment

### 1. Automatic Deployment

**Connect Repository:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure build settings

**Build Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev"
}
```

### 2. Manual Deployment

**Install Vercel CLI:**
```bash
npm i -g vercel
```

**Deploy:**
```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 3. Environment Variables

Add environment variables in Vercel Dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add all required variables for each environment

### 4. Custom Domain

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

## AWS Deployment

### 1. AWS Amplify

**Deploy with Amplify:**
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

**amplify.yml Configuration:**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 2. AWS EC2

**Server Setup:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/your-username/grow-school.git
cd grow-school

# Install dependencies
npm ci

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'grow-school',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/grow-school',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

## Docker Deployment

### 1. Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set permissions
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=http://pocketbase:8090
    depends_on:
      - pocketbase
    volumes:
      - uploads:/app/uploads

  pocketbase:
    image: spectado/pocketbase:latest
    ports:
      - "8090:8090"
    volumes:
      - pocketbase_data:/pb_data
    command: ["serve", "--http=0.0.0.0:8090"]

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  pocketbase_data:
  uploads:
```

### 3. Build and Run

```bash
# Build image
docker build -t grow-school .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app
```

## Database Deployment

### PocketBase Setup

**1. Self-hosted PocketBase:**
```bash
# Download PocketBase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.20.0/pocketbase_0.20.0_linux_amd64.zip

# Extract and run
unzip pocketbase_0.20.0_linux_amd64.zip
./pocketbase serve --http=0.0.0.0:8090
```

**2. PocketBase with Docker:**
```bash
docker run -d \
  --name pocketbase \
  -p 8090:8090 \
  -v pocketbase_data:/pb_data \
  spectado/pocketbase:latest \
  serve --http=0.0.0.0:8090
```

**3. Database Migration:**
```bash
# Export from development
./pocketbase export

# Import to production
./pocketbase import backup.zip
```

## SSL/TLS Configuration

### 1. Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Nginx Configuration

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

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
}
```

## Monitoring and Logging

### 1. Application Monitoring

**Health Check Endpoint:**
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
}
```

### 2. Error Tracking

**Sentry Integration:**
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Performance Monitoring

**New Relic Setup:**
```bash
npm install newrelic
```

## Backup Strategy

### 1. Database Backup

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="pocketbase"

# Create backup
./pocketbase export "${BACKUP_DIR}/${DB_NAME}_${DATE}.zip"

# Upload to S3 (optional)
aws s3 cp "${BACKUP_DIR}/${DB_NAME}_${DATE}.zip" s3://your-backup-bucket/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "${DB_NAME}_*.zip" -mtime +7 -delete
```

### 2. File Backup

```bash
#!/bin/bash
# backup-files.sh

rsync -av --delete /app/uploads/ /backups/uploads/
```

## Scaling Considerations

### 1. Load Balancing

**Multiple Instances:**
```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  app:
    build: .
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
```

### 2. CDN Configuration

**Cloudflare Setup:**
1. Add domain to Cloudflare
2. Configure DNS records
3. Enable caching rules
4. Set up security rules

## Troubleshooting

### Common Issues

**1. Build Failures:**
```bash
# Clear cache
npm run clean
rm -rf .next node_modules
npm install
npm run build
```

**2. Memory Issues:**
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**3. Database Connection:**
```bash
# Check PocketBase status
curl http://localhost:8090/api/health
```

### Logs and Debugging

```bash
# Application logs
pm2 logs grow-school

# Docker logs
docker-compose logs -f app

# System logs
journalctl -u nginx -f
```

## Security Checklist

- [ ] Environment variables secured
- [ ] SSL/TLS certificates configured
- [ ] Database access restricted
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting setup
- [ ] Access logs reviewed regularly

## Post-Deployment

1. **Verify deployment**: Test all critical features
2. **Monitor performance**: Check response times and errors
3. **Set up alerts**: Configure monitoring alerts
4. **Update documentation**: Document any deployment-specific configurations
5. **Schedule maintenance**: Plan regular updates and backups
