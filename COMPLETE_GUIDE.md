# WealthWise - Complete Setup & Deployment Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Features Guide](#features-guide)
7. [Vercel Deployment](#vercel-deployment)
8. [Environment Variables](#environment-variables)
9. [Troubleshooting](#troubleshooting)
10. [Development Phases](#development-phases)

---

## 1. Project Overview

**WealthWise** is a modern personal finance management application built with:
- **Next.js 14** (App Router, Server Components)
- **TypeScript** (Type-safe development)
- **Tailwind CSS** (Utility-first styling)
- **Prisma ORM** (Type-safe database access)
- **NextAuth.js** (Authentication)
- **MySQL** (Database - XAMPP compatible)
- **Chart.js** (Data visualization)

### Core Features (Phase 1 - ✅ COMPLETED)
- ✅ User Authentication (Sign up, Sign in, Logout)
- ✅ Income Management
- ✅ Budget Allocation with validation (Investment ≥10%, Savings ≥5%)
- ✅ Expense Tracking
- ✅ Real-time Budget vs Expense visualization
- ✅ Category-based financial management (7 categories)
- ✅ User Profile Management
- ✅ Interactive Dashboard with charts

---

## 2. Prerequisites

### Required Software
```bash
# 1. Node.js (v18 or higher)
node --version  # Should be v18.x.x or higher

# 2. npm (comes with Node.js)
npm --version   # Should be 9.x.x or higher

# 3. MySQL Database
# Option A: XAMPP (includes MySQL + phpMyAdmin)
# Download from: https://www.apachefriends.org/

# Option B: Standalone MySQL Server
# Download from: https://dev.mysql.com/downloads/mysql/

# 4. Git (optional, for version control)
git --version
```

### Verify Installation
```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check MySQL is running
# For XAMPP: Open XAMPP Control Panel → Start MySQL
# For standalone: mysql --version
```

---

## 3. Local Development Setup

### Step 1: Navigate to Project Directory
```powershell
cd C:\Users\D\Desktop\Wealthwise\wealthwise-app
```

### Step 2: Install Dependencies
```powershell
# Install all npm packages
npm install

# This installs:
# - Next.js 14
# - React 18
# - TypeScript
# - Tailwind CSS
# - Prisma
# - NextAuth.js
# - Chart.js
# - bcryptjs
# - zod
```

### Step 3: Configure Environment Variables
Create/edit `.env` file in the project root:

```env
# Database Connection (MySQL on XAMPP)
DATABASE_URL="mysql://root:@localhost:3306/wealthwise"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production-min-32-chars"

# App Configuration
NEXT_PUBLIC_APP_NAME="WealthWise"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Important Notes:**
- `root:` - Default XAMPP MySQL has no password (empty after colon)
- `localhost:3306` - Default MySQL port
- `wealthwise` - Database name (we'll create this next)
- `NEXTAUTH_SECRET` - Generate a secure random string for production

### Step 4: Generate Prisma Client
```powershell
npx prisma generate
```

---

## 4. Database Setup

### Option A: Using phpMyAdmin (XAMPP)

1. **Start XAMPP Services**
   - Open XAMPP Control Panel
   - Click "Start" for Apache
   - Click "Start" for MySQL

2. **Open phpMyAdmin**
   - Navigate to: http://localhost/phpmyadmin
   - Login (usually no password needed)

3. **Create Database**
   - Click "New" in the left sidebar
   - Database name: `wealthwise`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

4. **Run SQL Script**
   - Select the `wealthwise` database
   - Click "SQL" tab
   - Open file: `C:\Users\D\Desktop\Wealthwise\wealthwise-app\prisma\setup-database.sql`
   - Copy the entire content
   - Paste into SQL editor
   - Click "Go"

### Option B: Using MySQL Command Line

```bash
# 1. Login to MySQL
mysql -u root -p
# (Press Enter if no password)

# 2. Create database
CREATE DATABASE wealthwise CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. Use the database
USE wealthwise;

# 4. Run the setup script
SOURCE C:/Users/D/Desktop/Wealthwise/wealthwise-app/prisma/setup-database.sql;

# 5. Verify tables created
SHOW TABLES;
# You should see: categories, income, transactions, user_budgets, users

# 6. Verify categories inserted
SELECT * FROM categories;
# You should see 7 categories

# 7. Exit
EXIT;
```

### Verify Database Structure
```sql
-- Check all tables exist
SHOW TABLES;

-- Expected output:
-- categories
-- income
-- transactions
-- user_budgets
-- users

-- Check categories are populated
SELECT id, name, color FROM categories;

-- Expected 7 rows:
-- 1  Mortgage      #6366f1
-- 2  Entertainment #ec4899
-- 3  Travel        #06b6d4
-- 4  Food          #f59e0b
-- 5  Health        #8b5cf6
-- 6  Investment    #10b981
-- 7  Savings       #f97316
```

---

## 5. Running the Application

### Start Development Server
```powershell
# Make sure you're in the project directory
cd C:\Users\D\Desktop\Wealthwise\wealthwise-app

# Start the development server
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env

 ✓ Ready in 2.5s
```

### Access the Application
1. Open your browser
2. Navigate to: **http://localhost:3000**
3. You should see the **WealthWise Sign In page**

### First Time User Flow
1. **Sign Up** (Create Account)
   - Click "Sign Up" tab
   - Enter: Name, Email, Password, Phone (optional)
   - Click "Create Account"
   - Auto-redirects to Sign In

2. **Sign In**
   - Enter your Email & Password
   - Click "Sign In"
   - Redirects to Dashboard

3. **Set Monthly Income**
   - Dashboard shows "No Income Set" warning
   - Click "Enter Income" or navigate to Income page
   - Enter your monthly income (e.g., 50000)
   - Click "Save Income"
   - Auto-redirects to Budget page

4. **Allocate Budget**
   - Use sliders to set percentages for each category
   - Ensure total = 100%
   - Ensure Investment ≥ 10%
   - Ensure Savings ≥ 5%
   - Click "Save Budget Allocation"
   - Redirects to Dashboard

5. **Add Expenses**
   - Navigate to Expenses page
   - Fill form: Amount, Category, Date, Description
   - Click "Add Expense"
   - View budget status and remaining amounts

6. **View Dashboard**
   - See income summary
   - View budget distribution chart
   - Track expenses by category
   - Monitor budget vs actual spending

---

## 6. Features Guide

### 🏠 Dashboard
**URL:** `/dashboard`

**Features:**
- Monthly income display
- Total budget overview
- Total expenses summary
- Budget distribution pie chart
- Expense summary by category
- Category cards showing:
  - Budget percentage
  - Amount budgeted
  - Amount spent
  - Remaining balance
  - Visual progress bars (green/yellow/red)

### 💰 Income Management
**URL:** `/income`

**Features:**
- Set/update monthly income
- View current income
- Income tips and guidance

**Workflow:**
1. Enter monthly income amount
2. Click "Save Income"
3. System saves for current month
4. Auto-redirects to Budget page

### 📊 Budget Allocation
**URL:** `/budget`

**Features:**
- Interactive sliders for 7 categories
- Real-time percentage calculation
- Budget validation (total must = 100%)
- Constraint enforcement:
  - Investment minimum: 10%
  - Savings minimum: 5%
- Visual pie chart
- Amount breakdown per category

**Categories:**
1. 🏠 Mortgage (Housing costs)
2. 🎬 Entertainment (Fun activities)
3. ✈️ Travel (Trips, vacations)
4. 🍔 Food (Groceries, dining)
5. 🏥 Health (Medical, fitness)
6. 📈 Investment (Stocks, retirement)
7. 💰 Savings (Emergency fund)

**Workflow:**
1. Adjust sliders or type percentages
2. Watch total percentage update
3. Ensure validation passes
4. Click "Save Budget Allocation"
5. View chart and breakdown

### 💳 Expense Tracking
**URL:** `/expenses`

**Features:**
- Add new expenses
- View budget status per category
- Color-coded usage indicators:
  - Green: < 70% used
  - Yellow: 70-90% used
  - Red: > 90% used
- Recent expenses list
- Delete expenses
- Category-wise filtering

**Workflow:**
1. Fill expense form
2. Select category from dropdown
3. Enter amount, date, description
4. Click "Add Expense"
5. View in recent expenses list
6. Monitor budget status updates

### 👤 Profile Management
**URL:** `/profile`

**Features:**
- View user information
- Edit name and phone
- Account creation date
- Logout functionality
- Account settings

**Workflow:**
1. View current profile details
2. Click "Edit Profile"
3. Update information
4. Click "Save Changes"
5. Or click "Cancel" to discard

---

## 7. Vercel Deployment

### Prerequisites for Deployment
1. **Vercel Account** - Sign up at https://vercel.com
2. **GitHub Account** (recommended) - Push code to GitHub
3. **Production MySQL Database** - Options:
   - PlanetScale (Free tier)
   - Railway.app (Free tier)
   - Heroku ClearDB
   - AWS RDS
   - DigitalOcean Managed Database

### Step 1: Prepare for Deployment

#### A. Push to GitHub (Recommended)
```bash
# Initialize git (if not already)
cd C:\Users\D\Desktop\Wealthwise\wealthwise-app
git init

# Create .gitignore (already exists)
# Make sure it includes:
# node_modules/
# .env
# .env.local

# Add all files
git add .

# Commit
git commit -m "Initial commit - WealthWise Phase 1 Complete"

# Create repository on GitHub
# Then push
git remote add origin https://github.com/YOUR_USERNAME/wealthwise.git
git branch -M main
git push -u origin main
```

#### B. Set up Production Database

**Option 1: PlanetScale (Recommended)**
```bash
# 1. Sign up at https://planetscale.com
# 2. Create new database: "wealthwise"
# 3. Get connection string
# 4. Format: mysql://USER:PASSWORD@HOST/DATABASE?sslaccept=strict
```

**Option 2: Railway.app**
```bash
# 1. Sign up at https://railway.app
# 2. New Project → Add MySQL
# 3. Copy connection string
```

**Option 3: Use Existing XAMPP MySQL (Not Recommended for Production)**
- Requires exposing local MySQL to internet
- Security risk
- Better to use cloud database

### Step 2: Deploy to Vercel

#### A. Connect GitHub Repository
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Click "Import"

#### B. Configure Project
```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### C. Add Environment Variables
Click "Environment Variables" and add:

```env
# Database (Production MySQL)
DATABASE_URL=mysql://user:password@host:3306/wealthwise

# NextAuth (CRITICAL - Change this!)
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=GENERATE-A-NEW-SECRET-KEY-MINIMUM-32-CHARACTERS-LONG

# App
NEXT_PUBLIC_APP_NAME=WealthWise
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**Generate NEXTAUTH_SECRET:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 2: Using OpenSSL
openssl rand -base64 32

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

#### D. Deploy
1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Visit your deployment URL

### Step 3: Setup Production Database

#### Run Database Migrations
```bash
# Option 1: Using Prisma Studio (Local)
npx prisma db push

# Option 2: Using Vercel CLI
vercel env pull .env.production
npx prisma db push

# Option 3: Manually run SQL
# Copy prisma/setup-database.sql content
# Paste into your cloud database SQL editor
```

### Step 4: Test Production Deployment
1. Visit your Vercel URL
2. Sign up with new account
3. Test all features:
   - Authentication
   - Income setting
   - Budget allocation
   - Expense tracking
   - Profile management

---

## 8. Environment Variables

### Development (.env)
```env
DATABASE_URL="mysql://root:@localhost:3306/wealthwise"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production"
NEXT_PUBLIC_APP_NAME="WealthWise"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Production (Vercel Environment Variables)
```env
DATABASE_URL="mysql://user:pass@host:3306/wealthwise?sslaccept=strict"
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="secure-random-32-char-minimum-production-key"
NEXT_PUBLIC_APP_NAME="WealthWise"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

### Security Notes
- ⚠️ **Never commit `.env` to GitHub**
- ⚠️ **Use different secrets for dev and production**
- ⚠️ **Rotate NEXTAUTH_SECRET periodically**
- ⚠️ **Use SSL/TLS for production database**

---

## 9. Troubleshooting

### Common Issues & Solutions

#### Issue 1: "Cannot connect to database"
**Error:** `P1001: Can't reach database server`

**Solutions:**
```bash
# 1. Check MySQL is running
# XAMPP: Open Control Panel → MySQL should be green

# 2. Verify DATABASE_URL
# Check .env file has correct format:
DATABASE_URL="mysql://root:@localhost:3306/wealthwise"

# 3. Test MySQL connection
mysql -u root -p
# If this fails, MySQL is not running

# 4. Regenerate Prisma Client
npx prisma generate
```

#### Issue 2: "Database does not exist"
**Error:** `P1003: Database wealthwise does not exist`

**Solutions:**
```bash
# Create database manually
mysql -u root -p
CREATE DATABASE wealthwise;
USE wealthwise;
SOURCE C:/Users/D/Desktop/Wealthwise/wealthwise-app/prisma/setup-database.sql;
```

#### Issue 3: "Module not found" errors
**Error:** `Cannot find module 'next-auth'`

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or specific package
npm install next-auth@beta
```

#### Issue 4: TypeScript errors
**Error:** Type errors in IDE

**Solutions:**
```bash
# Regenerate Prisma types
npx prisma generate

# Restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### Issue 5: "Session not found"
**Error:** Redirects to login after signing in

**Solutions:**
```env
# Check NEXTAUTH_URL in .env
NEXTAUTH_URL="http://localhost:3000"

# Check NEXTAUTH_SECRET is set
NEXTAUTH_SECRET="your-secret-key"

# Clear browser cookies
# Chrome: Settings → Privacy → Clear browsing data
```

#### Issue 6: Port 3000 already in use
**Error:** `Port 3000 is already in use`

**Solutions:**
```powershell
# Option 1: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Option 2: Use different port
npm run dev -- -p 3001
```

#### Issue 7: Prisma Client not generated
**Error:** `Cannot find module '@prisma/client'`

**Solutions:**
```bash
# Generate Prisma Client
npx prisma generate

# If still failing
npm install @prisma/client
npx prisma generate
```

---

## 10. Development Phases

### ✅ Phase 0: Infrastructure (COMPLETED)
- [x] Next.js 14 project setup
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] Prisma ORM integration
- [x] NextAuth.js authentication
- [x] MySQL database schema
- [x] Environment configuration

### ✅ Phase 1: Core Features (COMPLETED)
- [x] User authentication (signup/signin)
- [x] Dashboard page with charts
- [x] Income management
- [x] Budget allocation with validation
- [x] Expense tracking
- [x] Profile management
- [x] Sidebar navigation
- [x] Responsive UI components

### 🚧 Phase 2: Enhanced Features (PLANNED)
- [ ] Multi-month income tracking
- [ ] Expense filtering & search
- [ ] Budget templates
- [ ] Recurring expenses
- [ ] Data export (CSV/PDF)
- [ ] Email notifications
- [ ] Dark mode toggle
- [ ] Mobile optimization

### 🔮 Phase 3: Advanced Features (FUTURE)
- [ ] AI Investment recommendations
- [ ] Financial insights & analytics
- [ ] Goal tracking
- [ ] Bill reminders
- [ ] Multi-currency support
- [ ] Shared budgets (family)
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations

### 🎯 Phase 4: Production Ready (FUTURE)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Security audit
- [ ] Backup & recovery
- [ ] Monitoring & logging
- [ ] CI/CD pipeline
- [ ] Documentation completion

---

## Quick Command Reference

```powershell
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Run production build
npm run lint             # Run ESLint

# Database
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema to database
npx prisma studio        # Open Prisma Studio GUI
npx prisma db pull       # Pull schema from database

# Deployment
vercel                   # Deploy to Vercel
vercel --prod            # Deploy to production
vercel env pull          # Pull environment variables
vercel logs              # View deployment logs
```

---

## Support & Resources

- **Documentation:** See DEVELOPMENT_PHASES.md
- **Database Schema:** See prisma/schema.prisma
- **API Routes:** See src/app/api/
- **Components:** See src/components/

**Deployed by:** GitHub Copilot  
**Last Updated:** February 4, 2026  
**Version:** 1.0.0 (Phase 1 Complete)

---

🎉 **Congratulations! Phase 1 is complete. Your WealthWise app is ready for development and testing!**
