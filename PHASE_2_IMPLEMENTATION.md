# Phase 2 Implementation Guide
## Enhanced Visualization & UX

> **Status**: In Progress  
> **Start Date**: February 4, 2026  
> **Dependencies**: Phase 1 Completed ✅

---

## 📋 Overview

Phase 2 focuses on enhancing the user experience with advanced visualizations, improved UI/UX, filtering capabilities, and additional features to make WealthWise a more powerful finance management tool.

---

## 🎯 SECTION 1: Advanced Charts & Analytics

### 1.1 Monthly Expense Trend Chart
**Component**: `MonthlyTrendChart.tsx`
**Location**: `src/components/charts/`

```typescript
// Features:
- Line chart showing expense trends over last 6 months
- Multi-line support for different categories
- Hover tooltips with exact amounts
- Responsive design
- Uses Recharts LineChart component
```

**Data Requirements**:
- Aggregate expenses by month
- Group by category
- Calculate monthly totals
- Support date range filtering

**API Enhancement**:
```typescript
// Add to /api/expenses route
GET /api/expenses?period=6months&groupBy=month
Response: {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    { category: "Food", data: [500, 600, 550, ...] },
    { category: "Entertainment", data: [200, 150, 300, ...] }
  ]
}
```

---

### 1.2 Spending by Category Charts
**Components**: 
- `CategoryPieChart.tsx` - Pie chart
- `CategoryBarChart.tsx` - Bar chart

**Features**:
- Interactive pie chart with category breakdown
- Horizontal bar chart for budget vs actual comparison
- Click-to-filter category expenses
- Legend with percentages
- Color-coded categories (use existing categoryColors)

**Implementation**:
```typescript
// PieChart - Shows distribution
- Total spent per category
- Percentage of total expenses
- Interactive segments

// BarChart - Shows comparison
- Budgeted amount (light bar)
- Spent amount (colored bar)
- Side-by-side comparison
```

---

### 1.3 Budget vs Actual Comparison
**Component**: `BudgetComparisonChart.tsx`

**Visualization Type**: Grouped Bar Chart

**Data Structure**:
```typescript
interface ComparisonData {
  category: string
  budgeted: number
  actual: number
  variance: number // actual - budgeted
  percentageUsed: number
}
```

**Visual Indicators**:
- Green: Under budget
- Orange: 70-90% of budget
- Red: Over budget

---

### 1.4 Year-over-Year Comparison
**Component**: `YearComparisonChart.tsx`

**Features**:
- Compare current year vs previous year
- Monthly breakdown
- Toggle between categories
- Growth/decline indicators
- Percentage change labels

**Data Requirements**:
- Historical data for at least 2 years
- Month-by-month comparison
- Category-specific filtering

---

### 1.5 Expense Heatmap Calendar
**Component**: `ExpenseHeatmap.tsx`
**Library**: `react-calendar-heatmap` (install needed)

**Features**:
- GitHub-style contribution calendar
- Each day shows expense intensity
- Color gradient: low (light) to high (dark) spending
- Click day to see expense details
- Month/year navigation

**Color Scale**:
```typescript
- $0-50: Very light green
- $50-150: Light green
- $150-300: Medium green
- $300-500: Dark green
- $500+: Very dark green/red
```

---

## 🎯 SECTION 2: Dashboard Enhancements

### 2.1 Quick Stats Cards
**Component**: `StatsCards.tsx`

**Four Key Metrics**:
1. **Total Income** - Current month
2. **Total Spent** - Current month with percentage
3. **Total Saved** - Amount not spent
4. **Budget Health** - Overall score (0-100)

**Card Design**:
```typescript
interface StatCard {
  title: string
  value: string | number
  change: number // percentage change from last month
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: string
}
```

**Icons to use**: 💰 Income, 💸 Spent, 💎 Saved, ❤️ Health

---

### 2.2 Date Range Filter
**Component**: `DateRangeFilter.tsx`

**Presets**:
- This Month (default)
- Last Month
- Last 3 Months
- Last 6 Months
- This Year
- Last Year
- Custom Range (date picker)

**Implementation**:
```typescript
// Use react-datepicker or native input type="date"
// Store filter in component state
// Pass to all chart components
// Update API calls with date params
```

---

### 2.3 Month/Year Selector
**Component**: `MonthYearPicker.tsx`

**Features**:
- Dropdown for month selection
- Dropdown for year selection
- Navigate prev/next with arrows
- Show current selection prominently
- Persist selection in URL params

---

### 2.4 Financial Health Score Widget
**Component**: `HealthScoreWidget.tsx`

**Score Calculation** (0-100):
```typescript
function calculateHealthScore(data) {
  let score = 100
  
  // Deduct for overspending (max -30)
  const overspendCategories = categories.filter(c => c.spent > c.budgeted)
  score -= (overspendCategories.length * 5)
  
  // Bonus for savings (max +20)
  if (savingsRate >= 10) score += 10
  if (savingsRate >= 20) score += 10
  
  // Bonus for investment (max +20)
  if (investmentRate >= 15) score += 10
  if (investmentRate >= 25) score += 10
  
  // Deduct for no emergency fund (-20)
  if (totalSaved < monthlyIncome * 3) score -= 20
  
  return Math.max(0, Math.min(100, score))
}
```

**Visual**:
- Circular progress indicator
- Color coding: <50 red, 50-75 orange, >75 green
- Breakdown of score factors
- Tips to improve score

---

### 2.5 Recent Transactions
**Component**: `RecentTransactions.tsx`

**Display**:
- Last 5 transactions
- Transaction date, category, amount
- Category icon/color
- Description (truncated)
- Link to view all expenses

**Design**:
- List with alternating row colors
- Hover state
- Click to edit/delete
- Smooth animations

---

### 2.6 Budget Alerts
**Component**: `BudgetAlerts.tsx`

**Alert Types**:
1. **Warning**: 70-90% of budget used
2. **Critical**: 90-100% of budget used
3. **Over**: Exceeded budget

**Features**:
- Alert banner at top of dashboard
- Dismissible notifications
- Show affected categories
- Quick action buttons (Add Income, View Category)
- Icon indicators (⚠️ warning, 🚨 critical)

---

## 🎯 SECTION 3: Expense Filtering & Search

### 3.1 Search Functionality
**Component**: `ExpenseSearch.tsx`

**Search Fields**:
- Description (partial match)
- Amount (exact or range)
- Date (single or range)
- Category (dropdown multi-select)

**Implementation**:
```typescript
// Client-side filtering for < 1000 records
// Server-side search for > 1000 records
// Debounced input (300ms)
// Clear search button
// Show result count
```

---

### 3.2 Advanced Filters
**Component**: `ExpenseFilters.tsx`

**Filter Options**:
1. **Date Range**
   - Preset ranges
   - Custom start/end date
   
2. **Category Filter**
   - Multi-select checkboxes
   - "Select All" / "Clear All"
   
3. **Amount Range**
   - Min/Max inputs
   - Slider for quick selection
   
4. **Sort Options**
   - Date (newest/oldest)
   - Amount (high/low)
   - Category (A-Z)

**State Management**:
```typescript
interface FilterState {
  dateRange: { start: Date; end: Date }
  categories: string[]
  amountRange: { min: number; max: number }
  sortBy: 'date' | 'amount' | 'category'
  sortOrder: 'asc' | 'desc'
}
```

---

### 3.3 CSV Export
**Component**: `ExportButton.tsx`

**Export Data**:
```typescript
// Generate CSV with columns:
Date, Category, Amount, Description, Budget, Remaining

// Implementation:
- Use papaparse library or custom CSV generator
- Format dates as YYYY-MM-DD
- Format amounts with 2 decimals
- Trigger download with Blob URL
- Show loading state during generation
```

**Features**:
- Export all expenses
- Export filtered results
- Export current month
- Custom date range export

---

### 3.4 Pagination
**Component**: `ExpensePagination.tsx`

**Settings**:
- Items per page: 10, 25, 50, 100
- Show total count
- Page number input
- First/Last page buttons
- Prev/Next buttons

**Implementation**:
```typescript
// Client-side pagination for dashboard
// Server-side pagination for expense page
// Preserve page when filtering
// Reset to page 1 on new search
```

---

## 🎯 SECTION 4: Budget Templates

### 4.1 Predefined Templates
**Component**: `BudgetTemplates.tsx`

**Template Definitions**:

```typescript
const templates = {
  conservative: {
    name: "Conservative",
    description: "Focus on savings and security",
    allocations: {
      mortgage: 30,
      food: 15,
      health: 8,
      entertainment: 5,
      travel: 5,
      investment: 12,
      savings: 25
    }
  },
  
  balanced: {
    name: "Balanced",
    description: "Equal focus on saving and living",
    allocations: {
      mortgage: 30,
      food: 18,
      health: 7,
      entertainment: 10,
      travel: 8,
      investment: 15,
      savings: 12
    }
  },
  
  growth: {
    name: "Growth",
    description: "Maximize investments for future",
    allocations: {
      mortgage: 30,
      food: 15,
      health: 7,
      entertainment: 8,
      travel: 5,
      investment: 25,
      savings: 10
    }
  },
  
  custom: {
    name: "Custom",
    description: "Create your own allocation",
    allocations: {} // User defines
  }
}
```

---

### 4.2 Template Switcher
**Location**: Budget Page

**Features**:
- Template selector dropdown
- Preview template allocation
- "Apply Template" button
- Confirmation dialog before applying
- Save current as custom template

**Implementation**:
```typescript
// Show template comparison table
// Highlight differences from current
// Animate percentage changes
// Update budget with animation
```

---

### 4.3 Custom Template Management
**Component**: `CustomTemplates.tsx`

**Features**:
- Save current budget as template
- Name custom templates
- Edit saved templates
- Delete templates
- Set default template

**Storage**:
```typescript
// Store in database: user_budget_templates table
CREATE TABLE user_budget_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  template_name VARCHAR(100),
  allocations JSON,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 SECTION 5: Recurring Expenses

### 5.1 Schema Extension
**New Table**: `recurring_expenses`

```sql
CREATE TABLE recurring_expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255),
  frequency ENUM('daily', 'weekly', 'monthly', 'yearly'),
  start_date DATE NOT NULL,
  end_date DATE NULL,
  next_occurrence DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

---

### 5.2 Recurring Expense Manager
**Component**: `RecurringExpenseManager.tsx`
**Page**: `/expenses/recurring`

**Features**:
1. **Add Recurring Expense**
   - Amount
   - Category
   - Description
   - Frequency (daily/weekly/monthly/yearly)
   - Start date
   - End date (optional)

2. **List Recurring Expenses**
   - Show all active recurring expenses
   - Next occurrence date
   - Quick edit/delete
   - Pause/Resume toggle

3. **Auto-Generation**
   - Cron job or scheduled function
   - Run daily to check next_occurrence
   - Create transaction when date matches
   - Update next_occurrence based on frequency

---

### 5.3 API Routes
**New Routes**:

```typescript
// POST /api/expenses/recurring
// Create new recurring expense

// GET /api/expenses/recurring
// Get all recurring expenses for user

// PUT /api/expenses/recurring/[id]
// Update recurring expense

// DELETE /api/expenses/recurring/[id]
// Delete recurring expense

// POST /api/expenses/recurring/generate
// Manual trigger to generate pending expenses
```

---

### 5.4 Auto-Generation Logic
**Function**: `generateRecurringExpenses()`

```typescript
async function generateRecurringExpenses() {
  // Get all active recurring expenses where next_occurrence <= today
  const pending = await prisma.recurringExpense.findMany({
    where: {
      is_active: true,
      next_occurrence: { lte: new Date() }
    }
  })
  
  for (const recurring of pending) {
    // Create transaction
    await prisma.transaction.create({
      data: {
        userId: recurring.user_id,
        categoryId: recurring.category_id,
        amount: recurring.amount,
        description: `${recurring.description} (Recurring)`,
        transactionDate: recurring.next_occurrence,
        transactionType: 'expense'
      }
    })
    
    // Calculate next occurrence
    const nextDate = calculateNextOccurrence(
      recurring.next_occurrence,
      recurring.frequency
    )
    
    // Update recurring expense
    await prisma.recurringExpense.update({
      where: { id: recurring.id },
      data: { next_occurrence: nextDate }
    })
  }
}
```

---

## 🎯 SECTION 6: Notifications & Alerts

### 6.1 Toast Notification System
**Library**: Install `react-hot-toast`

```bash
npm install react-hot-toast
```

**Setup**: 
- Add Toaster component to layout
- Create notification utility functions
- Style to match WealthWise theme

**Usage**:
```typescript
// Success notifications
toast.success('Budget saved successfully!')

// Error notifications
toast.error('Failed to delete expense')

// Warning notifications
toast.warning('You are at 90% of your Food budget')

// Info notifications
toast.info('Your monthly report is ready')
```

---

### 6.2 Budget Warnings
**Component**: `BudgetWarningSystem.tsx`

**Trigger Conditions**:
```typescript
// Check on every expense add/edit/delete
function checkBudgetWarnings(categoryData) {
  const warnings = []
  
  Object.entries(categoryData).forEach(([category, data]) => {
    const usagePercent = (data.spent / data.budgeted) * 100
    
    if (usagePercent >= 70 && usagePercent < 90) {
      warnings.push({
        type: 'warning',
        category,
        message: `${category} budget is ${usagePercent.toFixed(0)}% used`,
        action: 'Monitor spending'
      })
    }
    
    if (usagePercent >= 90 && usagePercent < 100) {
      warnings.push({
        type: 'critical',
        category,
        message: `${category} budget is ${usagePercent.toFixed(0)}% used`,
        action: 'Reduce spending'
      })
    }
    
    if (usagePercent >= 100) {
      warnings.push({
        type: 'over',
        category,
        message: `${category} budget exceeded by $${Math.abs(data.remaining).toFixed(2)}`,
        action: 'Urgent: Stop spending'
      })
    }
  })
  
  return warnings
}
```

---

### 6.3 Monthly Summary
**Component**: `MonthlySummaryNotification.tsx`

**Trigger**: First day of each month
**Content**:
```typescript
interface MonthlySummary {
  totalIncome: number
  totalSpent: number
  totalSaved: number
  savingsRate: number
  topCategory: { name: string; amount: number }
  budgetHealth: number
  comparisonLastMonth: {
    spent: number // +/- percentage
    saved: number // +/- percentage
  }
}
```

**Delivery Options**:
- In-app notification bell
- Toast on login
- Email (future phase)

---

### 6.4 Low Balance Alerts
**Component**: `LowBalanceAlert.tsx`

**Criteria**:
```typescript
// Alert when category remaining < $50 or < 10% of budget
function checkLowBalance(categoryData) {
  return Object.entries(categoryData).filter(([cat, data]) => {
    return data.remaining < 50 || 
           (data.remaining / data.budgeted) < 0.10
  })
}
```

**Display**:
- Show as banner at top of dashboard
- Include category and amount remaining
- Suggest actions (add income, adjust budget)

---

## 🎯 SECTION 7: Dark Mode Implementation

### 7.1 Theme Setup
**Library**: Use Tailwind's dark mode

**Configuration** (`tailwind.config.ts`):
```typescript
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          text: '#e2e8f0'
        }
      }
    }
  }
}
```

---

### 7.2 Theme Context
**File**: `src/context/ThemeContext.tsx`

```typescript
'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  
  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('theme') as Theme
    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle('dark', saved === 'dark')
    }
  }, [])
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

---

### 7.3 Theme Toggle Component
**Component**: `ThemeToggle.tsx`

```typescript
'use client'
import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

**Placement**: Header, Sidebar

---

### 7.4 Component Updates
**Update All Components** with dark mode classes:

```typescript
// Example: Card component
<div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
  <h3 className="text-gray-900 dark:text-dark-text">Title</h3>
  <p className="text-gray-600 dark:text-gray-400">Content</p>
</div>

// Example: Button component
<button className="bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-800 text-white">
  Click Me
</button>

// Example: Input component
<input className="border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text" />
```

**Components to Update**:
- Card
- Button
- Input
- Sidebar
- All page layouts
- Charts (use dark-friendly colors)

---

### 7.5 Chart Dark Mode
**Update Chart Colors** for dark mode:

```typescript
// In chart components, use theme-aware colors
const { theme } = useTheme()

const chartColors = theme === 'dark' ? {
  text: '#e2e8f0',
  grid: '#334155',
  background: '#1e293b'
} : {
  text: '#1f2937',
  grid: '#e5e7eb',
  background: '#ffffff'
}

// Apply to chart options
options: {
  plugins: {
    legend: {
      labels: {
        color: chartColors.text
      }
    }
  },
  scales: {
    x: { grid: { color: chartColors.grid } },
    y: { grid: { color: chartColors.grid } }
  }
}
```

---

## 📊 Implementation Priority

### Week 1: Charts & Visualizations
1. Install and configure Recharts ✅
2. Create MonthlyTrendChart component
3. Create CategoryPieChart and CategoryBarChart
4. Add BudgetComparisonChart
5. Implement ExpenseHeatmap

### Week 2: Dashboard Enhancements
1. Build StatsCards component
2. Add DateRangeFilter
3. Create HealthScoreWidget
4. Implement RecentTransactions
5. Add BudgetAlerts system

### Week 3: Filtering & Templates
1. Build ExpenseSearch component
2. Create ExpenseFilters
3. Implement CSV export
4. Add pagination
5. Create BudgetTemplates system

### Week 4: Recurring Expenses & Polish
1. Create recurring_expenses table
2. Build RecurringExpenseManager
3. Implement auto-generation logic
4. Add notification system
5. Implement dark mode

---

## ✅ Testing Checklist

### Charts
- [ ] Monthly trend shows correct data
- [ ] Category charts interactive
- [ ] Budget comparison accurate
- [ ] Heatmap displays all days
- [ ] Charts responsive on mobile

### Dashboard
- [ ] Stats cards calculate correctly
- [ ] Date filter updates all components
- [ ] Health score formula accurate
- [ ] Alerts show at correct thresholds
- [ ] Recent transactions update live

### Filtering
- [ ] Search works across all fields
- [ ] Filters combine correctly
- [ ] CSV export includes all data
- [ ] Pagination preserves filters
- [ ] Sort options work correctly

### Templates
- [ ] All templates add to 100%
- [ ] Template switching animated
- [ ] Custom templates saved
- [ ] Default template loads on login

### Recurring
- [ ] Recurring expenses created
- [ ] Auto-generation runs correctly
- [ ] Next occurrence calculated right
- [ ] Edit/delete works
- [ ] Pause/resume functional

### Notifications
- [ ] Toasts appear and dismiss
- [ ] Budget warnings trigger correctly
- [ ] Monthly summary accurate
- [ ] Low balance alerts timely

### Dark Mode
- [ ] All components support dark mode
- [ ] Theme persists on reload
- [ ] Charts readable in dark mode
- [ ] Smooth transition animation
- [ ] No FOUC (flash of unstyled content)

---

## 🚀 Next Steps After Phase 2

After completing Phase 2, proceed to:
- **Phase 3**: AI-Powered Investment Recommendations
- **Phase 4**: Advanced Analytics & Reporting
- **Phase 5**: Mobile App & PWA

---

**Document Version**: 1.0  
**Last Updated**: February 4, 2026  
**Author**: WealthWise Development Team
