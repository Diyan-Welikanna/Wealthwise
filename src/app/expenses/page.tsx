"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"
import Input from "@/components/Input"
import Button from "@/components/Button"
import ExpenseSearch from "@/components/ExpenseSearch"
import ExpenseFilters, { type FilterState } from "@/components/ExpenseFilters"
import ExpenseTable from "@/components/ExpenseTable"
import Pagination from "@/components/Pagination"
import { exportToCSV } from "@/utils/csvExport"
import { notifySuccess, notifyError, notifyBudgetAlert } from "@/utils/notifications"

interface Expense {
  id: number
  amount: number
  date: string
  description: string | null
  category: string
}

interface Category {
  id: number
  name: string
  color: string
  icon: string | null
}

interface BudgetStatus {
  category: string
  budgeted: number
  spent: number
  remaining: number
  percentage: number
  color: string
}

export default function ExpensesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [expenses, setExpenses] = useState<Record<string, Expense[]>>({})
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  
  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
  })

  // Filtering and pagination state
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    dateFrom: "",
    dateTo: new Date().toISOString().split('T')[0],
    amountMin: "",
    amountMax: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      const [categoriesRes, expensesRes, incomeRes, budgetRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/expenses"),
        fetch("/api/income"),
        fetch("/api/budget"),
      ])

      const categoriesData = await categoriesRes.json()
      const expensesData = await expensesRes.json()
      const incomeData = await incomeRes.json()
      const budgetData = await budgetRes.json()

      if (categoriesData.success) {
        setCategories(categoriesData.categories)
        if (categoriesData.categories.length > 0) {
          setFormData(prev => ({ ...prev, category: categoriesData.categories[0].name }))
        }
      }

      if (expensesData.success && expensesData.expenses) {
        setExpenses(JSON.parse(expensesData.expenses))
      }

      // Calculate budget status
      if (budgetData.success && budgetData.budget) {
        const income = parseFloat(incomeData.income || "0")
        const budget = JSON.parse(budgetData.budget)
        const expensesByCategory = expensesData.success ? JSON.parse(expensesData.expenses) : {}
        
        const status = categoriesData.categories.map((cat: Category) => {
          const categoryKey = cat.name.toLowerCase()
          const percentage = budget[categoryKey]?.percentage || 0
          const budgeted = (income * percentage) / 100
          const categoryExpenses = expensesByCategory[categoryKey] || []
          const spent = categoryExpenses.reduce((sum: number, exp: Expense) => sum + parseFloat(exp.amount.toString()), 0)
          
          return {
            category: cat.name,
            budgeted,
            spent,
            remaining: budgeted - spent,
            percentage: budgeted > 0 ? (spent / budgeted) * 100 : 0,
            color: cat.color,
          }
        })
        
        setBudgetStatus(status)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: formData.category,
          amount: parseFloat(formData.amount),
          date: formData.date,
          description: formData.description,
        }),
      })

      const data = await res.json()

      if (data.success) {
        notifySuccess(`Expense added: $${formData.amount} for ${formData.category}`)
        setFormData({
          amount: "",
          category: categories[0]?.name || "",
          date: new Date().toISOString().split('T')[0],
          description: "",
        })
        await fetchData()
      } else {
        notifyError(data.message || "Failed to add expense")
      }
    } catch (error) {
      notifyError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (expenseId: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return
    }

    try {
      const res = await fetch("/api/expenses", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expenseId }),
      })

      const data = await res.json()

      if (data.success) {
        notifySuccess("Expense deleted successfully")
        await fetchData()
      } else {
        notifyError(data.message || "Failed to delete expense")
      }
    } catch (error) {
      notifyError("An error occurred. Please try again.")
    }
  }

  const getStatusColor = (percentage: number) => {
    if (percentage < 70) return "text-green-600"
    if (percentage < 90) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return "bg-green-500"
    if (percentage < 90) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (status === "loading") {
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

  // Apply filters and search
  const allExpenses = Object.values(expenses).flat()
  
  const filteredExpenses = allExpenses.filter(expense => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        expense.category.toLowerCase().includes(query) ||
        (expense.description?.toLowerCase().includes(query) || false)
      if (!matchesSearch) return false
    }

    // Category filter
    if (filters.category && expense.category !== filters.category) {
      return false
    }

    // Date range filter
    if (filters.dateFrom && new Date(expense.date) < new Date(filters.dateFrom)) {
      return false
    }
    if (filters.dateTo && new Date(expense.date) > new Date(filters.dateTo)) {
      return false
    }

    // Amount range filter
    const amount = parseFloat(expense.amount.toString())
    if (filters.amountMin && amount < parseFloat(filters.amountMin)) {
      return false
    }
    if (filters.amountMax && amount > parseFloat(filters.amountMax)) {
      return false
    }

    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)
  const paginatedExpenses = filteredExpenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleResetFilters = () => {
    setFilters({
      category: "",
      dateFrom: "",
      dateTo: new Date().toISOString().split('T')[0],
      amountMin: "",
      amountMax: "",
    })
    setSearchQuery("")
    setCurrentPage(1)
  }

  const handleExportCSV = () => {
    exportToCSV(filteredExpenses, 'wealthwise_expenses')
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Sidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Expense Tracking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Add Expense Form */}
            <Card className="lg:col-span-1">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Expense</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Grocery shopping"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add Expense
                </Button>
              </form>
            </Card>
          </div>

          {/* Expense Management */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">All Expenses</h2>
              <button
                onClick={handleExportCSV}
                disabled={filteredExpenses.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ExpenseSearch 
                  onSearch={setSearchQuery}
                  placeholder="Search by category or description..."
                />
              </div>
              <ExpenseFilters
                categories={categories.map(c => c.name)}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>

            {/* Results Summary */}
            {(searchQuery || Object.values(filters).some(v => v && v !== new Date().toISOString().split('T')[0])) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Showing <span className="font-semibold">{filteredExpenses.length}</span> of{' '}
                  <span className="font-semibold">{allExpenses.length}</span> expenses
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
            )}

            {/* Expense Table */}
            <ExpenseTable
              expenses={paginatedExpenses}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredExpenses.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          {/* Recent Expenses */}
          <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Expenses</h2>
            {allExpenses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No expenses recorded yet</p>
                <p className="text-sm mt-2">Add your first expense using the form above</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allExpenses.map(expense => {
                  const category = categories.find(c => c.name.toLowerCase() === expense.category)
                  
                  return (
                    <div key={expense.id} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0">
                      <div className="flex items-center gap-4 flex-1">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${category?.color}20` }}
                        >
                          <span className="text-lg">{category?.icon || "💰"}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{expense.category}</div>
                          {expense.description && (
                            <div className="text-sm text-gray-600">{expense.description}</div>
                          )}
                          <div className="text-xs text-gray-500">
                            {new Date(expense.date).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xl font-bold text-gray-800">
                          ₹{parseFloat(expense.amount.toString()).toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete expense"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
