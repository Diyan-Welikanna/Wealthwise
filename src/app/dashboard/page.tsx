"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"
import StatsCards from "@/components/StatsCards"
import HealthScoreWidget from "@/components/HealthScoreWidget"
import MonthlyTrendChart from "@/components/charts/MonthlyTrendChart"
import CategoryPieChart from "@/components/charts/CategoryPieChart"
import BudgetComparisonChart from "@/components/charts/BudgetComparisonChart"
import DateRangeFilter from "@/components/DateRangeFilter"
import RecentTransactions from "@/components/RecentTransactions"
import BudgetAlerts from "@/components/BudgetAlerts"
import { notifyBudgetAlert } from "@/utils/notifications"
import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, ChartTooltip, Legend)

interface BudgetData {
  [key: string]: {
    percentage: number
  }
}

interface Expense {
  id: number
  amount: number
  date: string
  description: string | null
  category: string
}

interface CategoryData {
  budgeted: number
  spent: number
  remaining: number
  percentage: number
  color: string
}

const categoryColors: Record<string, string> = {
  Mortgage: '#6366f1',
  Entertainment: '#ec4899',
  Travel: '#06b6d4',
  Food: '#f59e0b',
  Health: '#8b5cf6',
  Investment: '#10b981',
  Savings: '#f97316',
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [income, setIncome] = useState<number>(0)
  const [budget, setBudget] = useState<BudgetData>({})
  const [expenses, setExpenses] = useState<Record<string, Expense[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      const [incomeRes, budgetRes, expensesRes] = await Promise.all([
        fetch("/api/income"),
        fetch("/api/budget"),
        fetch("/api/expenses"),
      ])

      const incomeData = await incomeRes.json()
      const budgetData = await budgetRes.json()
      const expensesData = await expensesRes.json()

      setIncome(parseFloat(incomeData.income || "0"))
      
      if (budgetData.success && budgetData.budget) {
        setBudget(JSON.parse(budgetData.budget))
      }
      
      if (expensesData.success && expensesData.expenses) {
        setExpenses(JSON.parse(expensesData.expenses))
      }

      setLoading(false)

      // Check for budget alerts after data is loaded
      checkBudgetAlerts()
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  const checkBudgetAlerts = () => {
    if (!income || Object.keys(budget).length === 0) return

    const categoryData = calculateCategoryData()
    Object.entries(categoryData).forEach(([category, data]) => {
      const percentage = Math.round((data.spent / data.budgeted) * 100)
      if (percentage >= 85 && data.budgeted > 0) {
        notifyBudgetAlert(category, percentage)
      }
    })
  }

  const calculateCategoryData = (): Record<string, CategoryData> => {
    const data: Record<string, CategoryData> = {}
    
    Object.keys(categoryColors).forEach(category => {
      const categoryKey = category.toLowerCase()
      const percentage = budget[categoryKey]?.percentage || 0
      const budgeted = (income * percentage) / 100
      const categoryExpenses = expenses[categoryKey] || []
      const spent = categoryExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0)
      const remaining = budgeted - spent

      data[category] = {
        budgeted,
        spent,
        remaining,
        percentage,
        color: categoryColors[category],
      }
    })

    return data
  }

  const getChartData = () => {
    const categories = Object.keys(categoryColors)
    const data = categories.map(cat => budget[cat.toLowerCase()]?.percentage || 0)
    const colors = categories.map(cat => categoryColors[cat])

    return {
      labels: categories,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    }
  }

  const getTotalExpenses = () => {
    return Object.values(expenses).flat().reduce(
      (sum, exp) => sum + parseFloat(exp.amount.toString()),
      0
    )
  }

  const getUsagePercentage = (budgeted: number, spent: number) => {
    if (budgeted === 0) return 0
    return Math.min((spent / budgeted) * 100, 100)
  }

  const getStatusClass = (percentage: number) => {
    if (percentage < 70) return "bg-green-500"
    if (percentage < 90) return "bg-yellow-500"
    return "bg-red-500"
  }

  const calculateBudgetHealth = (): number => {
    let score = 100
    const categoryData = calculateCategoryData()
    
    // Deduct for overspending
    const overspendCategories = Object.values(categoryData).filter(c => c.spent > c.budgeted)
    score -= (overspendCategories.length * 5)
    
    // Bonus for savings
    const totalSaved = income - totalExpenses
    const savingsRate = income > 0 ? ((totalSaved / income) * 100) : 0
    if (savingsRate >= 10) score += 10
    if (savingsRate >= 20) score += 10
    
    // Bonus for investment
    const investmentPercent = budget.investment?.percentage || 0
    if (investmentPercent >= 15) score += 10
    if (investmentPercent >= 25) score += 10
    
    // Deduct for no emergency fund
    if (totalSaved < income * 3) score -= 20
    
    return Math.max(0, Math.min(100, score))
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const categoryData = calculateCategoryData()
  const totalExpenses = getTotalExpenses()
  const totalSaved = income - totalExpenses
  const budgetHealth = calculateBudgetHealth()

  // Sample transactions data
  const recentTransactions = Object.values(expenses).flat().map(exp => ({
    id: exp.id.toString(),
    type: 'expense' as const,
    amount: parseFloat(exp.amount.toString()),
    category: exp.category,
    description: exp.description || 'No description',
    date: new Date(exp.date)
  })).sort((a, b) => b.date.getTime() - a.date.getTime())

  // Budget alerts data
  const budgetAlerts = Object.entries(categoryData)
    .filter(([_, data]) => data.spent / data.budgeted >= 0.8)
    .map(([category, data]) => {
      const percentage = Math.round((data.spent / data.budgeted) * 100)
      let severity: 'warning' | 'danger' | 'critical'
      if (percentage >= 120) severity = 'critical'
      else if (percentage >= 100) severity = 'danger'
      else severity = 'warning'
      
      return {
        id: category,
        category,
        budgeted: data.budgeted,
        spent: data.spent,
        percentage,
        severity
      }
    })
    .sort((a, b) => b.percentage - a.percentage)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Sidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

          {/* Stats Cards */}
          <StatsCards 
            income={income}
            totalSpent={totalExpenses}
            totalSaved={totalSaved}
            budgetHealth={budgetHealth}
          />

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <MonthlyTrendChart expenses={expenses} categoryColors={categoryColors} />
            </div>
            <HealthScoreWidget 
              score={budgetHealth}
              income={income}
              totalSaved={totalSaved}
              budgetData={Object.fromEntries(
                Object.entries(categoryData).map(([cat, data]) => [cat, { budgeted: data.budgeted, spent: data.spent }])
              )}
            />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CategoryPieChart expenses={expenses} categoryColors={categoryColors} />
            <BudgetComparisonChart 
              income={income}
              budget={budget}
              expenses={expenses}
              categoryColors={categoryColors}
            />
          </div>

          {/* Dashboard Enhancements Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <DateRangeFilter 
              onRangeChange={(range) => {
                console.log('Date range changed:', range)
                // TODO: Filter expenses by date range
              }}
            />
            <RecentTransactions transactions={recentTransactions} limit={5} />
            <BudgetAlerts alerts={budgetAlerts} />
          </div>

          {/* Income Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Monthly Income</h3>
              <p className="text-4xl font-bold">₹{income.toFixed(2)}</p>
              <button
                onClick={() => router.push("/income")}
                className="mt-4 text-sm underline hover:text-green-100"
              >
                Update Income →
              </button>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Total Budget</h3>
              <p className="text-4xl font-bold">₹{income.toFixed(2)}</p>
              <button
                onClick={() => router.push("/budget")}
                className="mt-4 text-sm underline hover:text-blue-100"
              >
                Adjust Budget →
              </button>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
              <p className="text-4xl font-bold">₹{totalExpenses.toFixed(2)}</p>
              <button
                onClick={() => router.push("/expenses")}
                className="mt-4 text-sm underline hover:text-purple-100"
              >
                Add Expense →
              </button>
            </Card>
          </div>

          {/* Charts and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Budget Distribution</h2>
              {Object.keys(budget).length > 0 ? (
                <div className="h-80">
                  <Doughnut 
                    data={getChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="mb-4">No budget set yet</p>
                    <button
                      onClick={() => router.push("/budget")}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                    >
                      Set Budget
                    </button>
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Expense Summary</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.entries(categoryData).map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="font-medium text-gray-700">{category}</span>
                    </div>
                    <span className="text-gray-600">₹{data.spent.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Category Cards */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Categories Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(categoryData).map(([category, data]) => {
              const usagePercent = getUsagePercentage(data.budgeted, data.spent)
              
              return (
                <Card key={category} className="hover:shadow-xl transition-shadow">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{category}</h3>
                      <span className="text-sm text-gray-600">{data.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getStatusClass(usagePercent)}`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-semibold">₹{data.budgeted.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Spent:</span>
                      <span className="font-semibold">₹{data.spent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={`font-bold ${data.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{data.remaining.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
