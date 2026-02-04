# 🚀 WealthWise - Quick Start Guide

## Step-by-Step Setup Instructions

### 1. Database Setup (REQUIRED FIRST)

Since you have an existing MySQL database on XAMPP, follow these steps:

#### Option A: Create New Database "wealthwise"

```bash
# Open MySQL command line or phpMyAdmin
# Run this SQL:

CREATE DATABASE wealthwise CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wealthwise;

# Then run the setup script
```

In phpMyAdmin or MySQL Workbench, execute the SQL file:
`wealthwise-app/prisma/setup-database.sql`

This will create all tables and insert the 7 default categories.

#### Option B: Use Existing "fintrack" Database

If you want to keep the database name as "fintrack":

1. Update `.env` file:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/fintrack"
   ```

2. Update `prisma.config.ts` datasource URL

---

### 2. Install Dependencies

```bash
cd wealthwise-app
npm install
```

This will install:
- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- NextAuth.js
- bcryptjs
- Chart.js
- Zod
- And all dependencies

---

### 3. Configure Environment Variables

The `.env` file is already set up. Verify it contains:

```env
DATABASE_URL="mysql://root:@localhost:3306/wealthwise"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production-min-32-chars"
NEXT_PUBLIC_APP_NAME="WealthWise"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**For production, change the NEXTAUTH_SECRET to a strong random value!**

---

### 4. Generate Prisma Client

```bash
npx prisma generate
```

This creates the TypeScript types for database access.

---

### 5. Verify Database Connection

```bash
# Optional: View your database in Prisma Studio
npx prisma studio
```

This opens a GUI at `http://localhost:5555` to browse your database.

---

### 6. Start Development Server

```bash
npm run dev
```

The app will start at **http://localhost:3000**

---

### 7. Test the Application

1. **Sign Up**
   - Navigate to http://localhost:3000
   - Click "Sign Up" tab
   - Fill in your details:
     - Name: Test User
     - Email: test@example.com
     - Password: test123
     - Phone: (optional)
   - Click "Create Account"

2. **Sign In**
   - You'll be redirected to Sign In page
   - Enter your credentials
   - Click "Sign In"

3. **Access Dashboard**
   - After login, you should see the dashboard (or be redirected if pages are not yet created)

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Problem:** MySQL is not running

**Solution:**
```bash
# Start XAMPP
# Make sure MySQL is running (green light)
```

### Error: "Database 'wealthwise' does not exist"

**Problem:** Database not created

**Solution:**
```bash
# In phpMyAdmin or MySQL:
CREATE DATABASE wealthwise;

# Then run the setup SQL script
```

### Error: "Prisma Client not found"

**Problem:** Prisma client not generated

**Solution:**
```bash
npx prisma generate
```

### Error: "Module not found"

**Problem:** Dependencies not installed

**Solution:**
```bash
npm install
```

### Error: "Port 3000 already in use"

**Solution:**
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port:
npm run dev -- -p 3001
```

---

## 📝 Next Steps After Setup

### Phase 1: Complete Core Features

The authentication is done. Now you need to create:

1. **Dashboard Page** (`src/app/dashboard/page.tsx`)
2. **Income Page** (`src/app/income/page.tsx`)
3. **Budget Page** (`src/app/budget/page.tsx`)
4. **Expenses Page** (`src/app/expenses/page.tsx`)
5. **Profile Page** (`src/app/profile/page.tsx`)

See `DEVELOPMENT_PHASES.md` for detailed tasks.

---

## 🚀 Deployment Checklist

Before deploying to Vercel:

- [ ] Create a cloud MySQL database (PlanetScale recommended)
- [ ] Update DATABASE_URL with cloud database credentials
- [ ] Generate a new NEXTAUTH_SECRET for production
- [ ] Test all features locally
- [ ] Push code to GitHub
- [ ] Follow DEPLOYMENT.md guide

---

## 📚 Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Prisma
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
npx prisma db pull   # Pull schema from database

# Database
npx prisma migrate dev    # Create migration
npx prisma migrate deploy # Apply migrations
```

---

## ✅ Verification Checklist

- [ ] MySQL is running in XAMPP
- [ ] Database "wealthwise" exists
- [ ] Tables are created (users, categories, income, user_budgets, transactions)
- [ ] Categories are populated (7 categories)
- [ ] npm install completed successfully
- [ ] Prisma client generated
- [ ] .env file configured correctly
- [ ] Dev server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can register a new user
- [ ] Can sign in
- [ ] JWT token is working

---

## 🆘 Getting Help

If you encounter issues:

1. Check the error message carefully
2. Review the troubleshooting section above
3. Check `DEVELOPMENT_PHASES.md` for feature status
4. Check `DEPLOYMENT.md` for deployment issues
5. Review API routes in `src/app/api/`

---

## 🎉 Success!

If you can sign up and sign in successfully, you're ready to start developing the core features!

**Next:** Start implementing the dashboard page as outlined in `DEVELOPMENT_PHASES.md`.

---

**Happy Coding! 💜**
