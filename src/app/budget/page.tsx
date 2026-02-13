"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"
import Button from "@/components/Button"
import BudgetTemplateSelector from "@/components/BudgetTemplateSelector"
import { type BudgetTemplate } from "@/utils/budgetTemplates"
import { notifySuccess, notifyError, notifyWarning } from "@/utils/notifications"
import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface BudgetAllocation {
  [key: string]: number
}

const categories = [
  { key: "mortgage", name: "Mortgage", color: "#6366f1", icon: "🏠" },
  { key: "entertainment", name: "Entertainment", color: "#ec4899", icon: "🎬" },
  { key: "travel", name: "Travel", color: "#06b6d4", icon: "✈️" },
  { key: "food", name: "Food", color: "#f59e0b", icon: "🍔" },
  { key: "health", name: "Health", color: "#8b5cf6", icon: "🏥" },
  { key: "investment", name: "Investment", color: "#10b981", icon: "📈", min: 10 },
  { key: "savings", name: "Savings", color: "#f97316", icon: "💰", min: 5 },
]

export default function BudgetPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [income, setIncome] = useState<number>(0)
  const [budget, setBudget] = useState<BudgetAllocation>({
    mortgage: 30,
    entertainment: 10,
    travel: 10,
    food: 15,
    health: 10,
    investment: 15,
    savings: 10,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>()

  const handleTemplateSelect = (template: BudgetTemplate) => {
    if (template.id === 'custom') {
      // Reset to zeros for custom
      const customBudget: BudgetAllocation = {}
      categories.forEach(cat => {
        customBudget[cat.key] = 0
      })
      setBudget(customBudget)
    } else {
      // Apply template allocations
      const templateBudget: BudgetAllocation = {}
      categories.forEach(cat => {
        templateBudget[cat.key] = template.allocations[cat.key] || 0
      })
      setBudget(templateBudget)
    }
    setSelectedTemplate(template.id)
    setShowTemplates(false)
    setMessage("")
    setErrors([])
  }

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
      const [incomeRes, budgetRes] = await Promise.all([
        fetch("/api/income"),
        fetch("/api/budget"),
      ])

      const incomeData = await incomeRes.json()
      const budgetData = await budgetRes.json()

      setIncome(parseFloat(incomeData.income || "0"))
      
      if (budgetData.success && budgetData.budget) {
        const parsedBudget = JSON.parse(budgetData.budget)
        const budgetObj: BudgetAllocation = {}
        
        categories.forEach(cat => {
          budgetObj[cat.key] = parsedBudget[cat.key]?.percentage || 0
        })
        
        setBudget(budgetObj)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleSliderChange = (category: string, value: number) => {
    const newBudget = {
      ...budget,
      [category]: value
    }
    setBudget(newBudget)
    setMessage("")
    
    // Real-time validation
    validateBudgetRealtime(newBudget)
  }
  
  const validateBudgetRealtime = (currentBudget: BudgetAllocation) => {
    const newErrors: string[] = []
    const total = Object.values(currentBudget).reduce((sum, val) => sum + val, 0)

    if (total !== 100) {
      const diff = total - 100
      if (diff > 0) {
        newErrors.push(`Over budget by ${diff}% - reduce allocations`)
      } else {
        newErrors.push(`Under budget by ${Math.abs(diff)}% - allocate remaining`)
      }
    }

    if (currentBudget.investment < 10) {
      newErrors.push("⚠️ Investment should be at least 10%")
    }

    if (currentBudget.savings < 5) {
      newErrors.push("⚠️ Savings should be at least 5%")
    }

    setErrors(newErrors)
  }

  const getTotalPercentage = () => {
    return Object.values(budget).reduce((sum, val) => sum + val, 0)
  }

  const validateBudget = (): boolean => {
    const newErrors: string[] = []
    const total = getTotalPercentage()

    if (total !== 100) {
      newErrors.push(`Total must equal 100% (currently ${total}%)`)
    }

    if (budget.investment < 10) {
      newErrors.push("Investment must be at least 10%")
    }

    if (budget.savings < 5) {
      newErrors.push("Savings must be at least 5%")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateBudget()) {
      notifyWarning("Please fix validation errors before saving")
      return
    }

    setLoading(true)

    try {
      const budgetData = Object.entries(budget).reduce((acc, [key, percentage]) => {
        acc[key] = { percentage }
        return acc
      }, {} as Record<string, { percentage: number }>)

      const res = await fetch("/api/budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ budget: budgetData }),
      })

      const data = await res.json()

      if (data.success) {
        notifySuccess("Budget saved successfully!")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        notifyError(data.message || "Failed to save budget")
      }
    } catch (error) {
      notifyError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getChartData = () => {
    return {
      labels: categories.map(cat => cat.name),
      datasets: [
        {
          data: categories.map(cat => budget[cat.key]),
          backgroundColor: categories.map(cat => cat.color),
          borderWidth: 0,
        },
      ],
    }
  }

  const calculateAmount = (percentage: number) => {
    return (income * percentage) / 100
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

  const total = getTotalPercentage()
  const isValid = total === 100 && budget.investment >= 10 && budget.savings >= 5

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Sidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Budget Planning</h1>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">📋</span>
              {showTemplates ? 'Hide Templates' : 'Use Template'}
            </button>
          </div>

          {showTemplates && (
            <Card className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <BudgetTemplateSelector
                onSelectTemplate={handleTemplateSelect}
                currentTemplate={selectedTemplate}
              />
            </Card>
          )}

          {income === 0 && (
            <Card className="mb-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-yellow-800">No Income Set</h3>
                  <p className="text-sm text-yellow-700">
                    Please set your monthly income first to see budget amounts.{" "}
                    <button
                      onClick={() => router.push("/income")}
                      className="underline hover:text-yellow-900"
                    >
                      Go to Income Page
                    </button>
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Monthly Income</h3>
              <p className="text-4xl font-bold">₹{income.toFixed(2)}</p>
            </Card>

            <Card className={`${total === 100 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white`}>
              <h3 className="text-lg font-semibold mb-2">Total Allocation</h3>
              <p className="text-4xl font-bold">{total}%</p>
              <p className="text-sm mt-2">{total === 100 ? "Perfect!" : total > 100 ? "Over budget" : "Under budget"}</p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Status</h3>
              <p className="text-2xl font-bold">{isValid ? "✓ Valid" : "✗ Invalid"}</p>
              <p className="text-sm mt-2">
                {isValid ? "Ready to save" : "Fix errors below"}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Sliders */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Adjust Percentages</h2>
                {selectedTemplate && selectedTemplate !== 'custom' && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template
                  </span>
                )}
              </div>
              
              {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, idx) => (
                      <li key={idx} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-6">
                {categories.map(category => (
                  <div key={category.key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{category.icon}</span>
                        <span className="font-medium text-gray-700">{category.name}</span>
                        {category.min && (
                          <span className="text-xs text-gray-500">(min {category.min}%)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={budget[category.key]}
                          onChange={(e) => handleSliderChange(category.key, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-gray-600">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={budget[category.key]}
                      onChange={(e) => handleSliderChange(category.key, parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${category.color} 0%, ${category.color} ${budget[category.key]}%, #e5e7eb ${budget[category.key]}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">0%</span>
                      <span className="text-sm font-semibold text-gray-700">
                        ₹{calculateAmount(budget[category.key]).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">100%</span>
                    </div>
                  </div>
                ))}
              </div>

              {message && (
                <div className={`mt-4 p-3 rounded-lg ${
                  message.includes("success") 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {message}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={loading || !isValid}
                className="w-full mt-6"
              >
                {loading ? "Saving..." : "Save Budget Allocation"}
              </Button>
            </Card>

            {/* Budget Visualization */}
            <div className="space-y-6">
              <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Budget Breakdown</h2>
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
              </Card>

              <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Amount Breakdown</h2>
                <div className="space-y-3">
                  {categories.map(category => (
                    <div key={category.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-gray-700">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">
                          ₹{calculateAmount(budget[category.key]).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {budget[category.key]}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
