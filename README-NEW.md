# 💰 WealthWise - Your Intelligent Finance Companion

<div align="center">
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)

  **A modern, intelligent personal finance management application**

</div>

---

## 📖 About

WealthWise is a comprehensive personal finance management system that helps users track income, manage budgets, monitor expenses, and receive intelligent investment recommendations. Built with modern web technologies for a seamless user experience.

## ✨ Key Highlights

- 🔐 **Secure Authentication** - JWT-based auth with NextAuth.js
- 📊 **Visual Analytics** - Beautiful charts using Chart.js
- 💸 **Expense Tracking** - Categorized expense management
- 📈 **Budget Allocation** - Interactive budget planning
- 🎨 **Modern UI** - Purple-indigo gradient theme
- 📱 **Responsive Design** - Works on all devices
- 🚀 **Fast & Optimized** - Built on Next.js 14

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17+
- npm 9.x+
- MySQL 8.0+ (local or cloud)

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/yourusername/wealthwise.git
   cd wealthwise/wealthwise-app
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Setup database**
   ```bash
   # Run SQL script
   mysql -u root -p wealthwise < prisma/setup-database.sql
   
   # Or use Prisma
   npx prisma db push
   npx prisma generate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Visit** [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── dashboard/         # Dashboard (TODO)
│   └── ...
├── components/            # React components
└── lib/                   # Utilities
```

---

## 🗄️ Database Schema

- **users** - User accounts
- **categories** - 7 finance categories
- **income** - Monthly income
- **user_budgets** - Budget allocations
- **transactions** - Expense records

---

## 📚 Documentation

- [DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md) - Complete roadmap
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Vercel deployment guide

---

## 🚀 Deployment to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy!

---

## 📝 License

MIT License - See LICENSE file

---

**Made with 💜 by WealthWise Team**
