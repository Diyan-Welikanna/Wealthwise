# WealthWise - Vercel Deployment Guide

## 📋 Prerequisites

Before deploying to Vercel, ensure you have:
- [x] Vercel account (sign up at [vercel.com](https://vercel.com))
- [x] GitHub account
- [x] MySQL database (can use PlanetScale, Railway, or any cloud MySQL provider)
- [x] Project pushed to GitHub repository

---

## 🗄️ Database Setup

### Option 1: PlanetScale (Recommended for Vercel)

1. **Create PlanetScale Account**
   - Go to [planetscale.com](https://planetscale.com)
   - Sign up for free tier

2. **Create Database**
   ```bash
   # Install PlanetScale CLI (optional)
   brew install planetscale/tap/pscale
   
   # Or use the web dashboard
   ```

3. **Get Connection String**
   - Navigate to your database in PlanetScale dashboard
   - Click "Connect"
   - Select "Prisma" as the framework
   - Copy the connection string (format: `mysql://...`)

4. **Run Initial Setup**
   ```bash
   # Push Prisma schema to PlanetScale
   npx prisma db push
   
   # Seed categories
   npx prisma db seed
   ```

### Option 2: Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create MySQL Database**
   - Click "New Project"
   - Select "Provision MySQL"
   - Get connection string from "Variables" tab

3. **Configure Database**
   ```bash
   # Use the Railway connection string
   DATABASE_URL="mysql://user:password@host:port/dbname"
   ```

### Option 3: Existing XAMPP MySQL (Development Only)

⚠️ **Not recommended for production!**

For production, you need a cloud-hosted MySQL database accessible from Vercel servers.

---

## 🔐 Environment Variables

### Local Setup (Already Done)

Your `.env` file should contain:
```env
DATABASE_URL="mysql://root:@localhost:3306/wealthwise"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production-min-32-chars"
NEXT_PUBLIC_APP_NAME="WealthWise"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Production Environment Variables (For Vercel)

You'll need to set these in Vercel dashboard:

```env
# Database (from PlanetScale or Railway)
DATABASE_URL="mysql://username:password@host:port/database?sslaccept=strict"

# NextAuth (must be your production URL)
NEXTAUTH_URL="https://your-app.vercel.app"

# Generate a new secret for production
NEXTAUTH_SECRET="generate-a-new-random-32-char-secret-here"

# App Configuration
NEXT_PUBLIC_APP_NAME="WealthWise"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

**Generate NEXTAUTH_SECRET:**
```bash
# Option 1: Use OpenSSL
openssl rand -base64 32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit https://generate-secret.vercel.app/32
```

---

## 📦 Prepare Your Project

### 1. Update `package.json`

Ensure you have a build script:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate"
  }
}
```

### 2. Create `.gitignore`

Ensure these are ignored:
```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
prisma/migrations
```

### 3. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - WealthWise app ready for deployment"

# Create GitHub repository and push
git remote add origin https://github.com/your-username/wealthwise.git
git branch -M main
git push -u origin main
```

---

## 🚀 Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Select "Import Git Repository"
   - Choose your GitHub repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (or `wealthwise-app` if in subdirectory)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   DATABASE_URL = mysql://user:pass@host:port/db?sslaccept=strict
   NEXTAUTH_URL = https://your-app.vercel.app
   NEXTAUTH_SECRET = your-generated-secret-here
   NEXT_PUBLIC_APP_NAME = WealthWise
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   ```

   **Important:** After first deployment, update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with your actual Vercel URL.

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your username
# - Link to existing project? No
# - Project name? wealthwise
# - Directory? ./
# - Override settings? No

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXT_PUBLIC_APP_NAME
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

---

## 🗄️ Database Migration on Vercel

After first deployment:

### 1. Push Prisma Schema

```bash
# Using your production DATABASE_URL
npx prisma db push
```

### 2. Seed Initial Categories

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
    { name: 'Mortgage', color: '#6366f1', icon: '🏠' },
    { name: 'Entertainment', color: '#ec4899', icon: '🎬' },
    { name: 'Travel', color: '#06b6d4', icon: '✈️' },
    { name: 'Food', color: '#f59e0b', icon: '🍔' },
    { name: 'Health', color: '#8b5cf6', icon: '🏥' },
    { name: 'Investment', color: '#10b981', icon: '📈' },
    { name: 'Savings', color: '#f97316', icon: '💰' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log('Categories seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Update `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Install dependencies:
```bash
npm install -D ts-node
```

Run seed:
```bash
npx prisma db seed
```

---

## ✅ Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Visit your Vercel URL
- [ ] Check sign-up page loads correctly
- [ ] Test user registration
- [ ] Test user login
- [ ] Verify dashboard loads

### 2. Update URLs
After first deployment, update environment variables:
```bash
# In Vercel dashboard, update:
NEXTAUTH_URL="https://your-actual-domain.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-actual-domain.vercel.app"

# Redeploy to apply changes
```

### 3. Configure Custom Domain (Optional)
1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update environment variables with new domain

### 4. Enable Production Optimizations
- [ ] Enable Edge Caching in Vercel
- [ ] Configure Image Optimization
- [ ] Set up Analytics (Vercel Analytics)
- [ ] Enable Speed Insights

### 5. Security Checklist
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database connection uses SSL
- [ ] Environment variables are set correctly
- [ ] CORS is properly configured
- [ ] Rate limiting enabled (future enhancement)

---

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to `main` branch:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically builds and deploys
```

### Preview Deployments
- Every pull request gets a preview URL
- Test features before merging
- Share preview links with team

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** Prisma client not generated
```bash
# Solution: Ensure postinstall script runs
"scripts": {
  "postinstall": "prisma generate"
}
```

**Issue:** Environment variables not found
- Check Vercel dashboard → Settings → Environment Variables
- Ensure variables are set for Production environment
- Redeploy after adding variables

### Database Connection Issues

**Issue:** Can't connect to database
```bash
# Check connection string format
DATABASE_URL="mysql://user:pass@host:port/db?sslaccept=strict"

# For PlanetScale, ensure SSL mode is correct
DATABASE_URL="mysql://user:pass@host:port/db?sslaccept=strict&sslmode=require"
```

**Issue:** Prisma schema out of sync
```bash
# Push latest schema
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

### Authentication Issues

**Issue:** NextAuth callback errors
- Verify `NEXTAUTH_URL` matches your Vercel URL exactly
- Ensure `NEXTAUTH_SECRET` is set and at least 32 characters
- Check browser console for errors

### Performance Issues

**Issue:** Slow page loads
- Enable Vercel Edge Functions
- Implement caching strategies
- Optimize images using Next.js Image component
- Use React Server Components where possible

---

## 📊 Monitoring

### Vercel Analytics
1. Go to your project in Vercel
2. Click "Analytics" tab
3. Enable Analytics (free tier available)
4. View real-time traffic and performance

### Error Tracking
Consider adding Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file**
2. **Use strong NEXTAUTH_SECRET**
3. **Enable SSL for database connection**
4. **Keep dependencies updated:**
   ```bash
   npm audit fix
   npm update
   ```
5. **Set up rate limiting** (Phase 4)
6. **Enable CSRF protection** (built into NextAuth)

---

## 💰 Cost Estimation

### Vercel
- **Hobby Plan:** FREE
  - Unlimited deployments
  - 100GB bandwidth
  - Serverless functions
  
- **Pro Plan:** $20/month
  - Advanced analytics
  - Better performance
  - Team collaboration

### Database (PlanetScale)
- **Free Tier:**
  - 5GB storage
  - 1 billion row reads/month
  - Perfect for MVP

- **Paid Plans:** Start at $29/month

### Total Estimated Cost
- **Development/MVP:** $0/month (free tiers)
- **Small Scale:** $0-20/month
- **Growing App:** $49+/month

---

## 🎉 You're Live!

Your WealthWise app is now deployed and accessible worldwide!

**Next Steps:**
1. Test all features in production
2. Share with beta users
3. Collect feedback
4. Continue with Phase 1 development
5. Monitor performance and errors

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **NextAuth Docs:** https://next-auth.js.org
- **PlanetScale Docs:** https://planetscale.com/docs

---

**Last Updated:** February 3, 2026  
**Version:** 1.0  
**Author:** WealthWise Development Team
