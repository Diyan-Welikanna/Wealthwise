"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"
import Button from "@/components/Button"
import Input from "@/components/Input"
import { notifySuccess, notifyError } from "@/utils/notifications"

interface Goal {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: string
  description?: string
  isCompleted: boolean
  progress: number
  remaining: number
}

export default function GoalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'emergency_fund',
    description: '',
  })

  const categories = [
    { value: 'emergency_fund', label: '🛡️ Emergency Fund', color: 'bg-red-100' },
    { value: 'vacation', label: '🏖️ Vacation', color: 'bg-blue-100' },
    { value: 'house', label: '🏠 House', color: 'bg-green-100' },
    { value: 'car', label: '🚗 Car', color: 'bg-yellow-100' },
    { value: 'retirement', label: '🏖️ Retirement', color: 'bg-purple-100' },
    { value: 'education', label: '🎓 Education', color: 'bg-indigo-100' },
    { value: 'wedding', label: '💒 Wedding', color: 'bg-pink-100' },
    { value: 'other', label: '🎯 Other', color: 'bg-gray-100' },
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchGoals()
    }
  }, [session])

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals')
      if (res.ok) {
        const data = await res.json()
        setGoals(data)
      }
    } catch (error) {
      notifyError('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingGoal ? `/api/goals/${editingGoal.id}` : '/api/goals'
      const method = editingGoal ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        notifySuccess(editingGoal ? 'Goal updated!' : 'Goal created!')
        fetchGoals()
        resetForm()
      } else {
        notifyError('Failed to save goal')
      }
    } catch (error) {
      notifyError('An error occurred')
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline.split('T')[0],
      category: goal.category,
      description: goal.description || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' })
      if (res.ok) {
        notifySuccess('Goal deleted!')
        fetchGoals()
      } else {
        notifyError('Failed to delete goal')
      }
    } catch (error) {
      notifyError('An error occurred')
    }
  }

  const handleAddProgress = async (goal: Goal, amount: number) => {
    try {
      const newAmount = Number(goal.currentAmount) + amount
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAmount: newAmount }),
      })

      if (res.ok) {
        notifySuccess('Progress updated!')
        fetchGoals()
      }
    } catch (error) {
      notifyError('Failed to update progress')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      category: 'emergency_fund',
      description: '',
    })
    setEditingGoal(null)
    setShowForm(false)
  }

  const getCategoryDetails = (category: string) => {
    return categories.find(c => c.value === category) || categories[categories.length - 1]
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Financial Goals</h1>
              <p className="text-gray-600 mt-1">Track your savings goals and watch your progress</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ New Goal'}
            </Button>
          </div>

          {showForm && (
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goal Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Emergency Fund"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Amount (₹) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      placeholder="100000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Amount (₹)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Additional details about your goal..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit">
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </Button>
                  {editingGoal && (
                    <Button type="button" onClick={resetForm} className="bg-gray-500">
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          )}

          {goals.length === 0 && !showForm ? (
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No Goals Yet</h2>
              <p className="text-gray-600 mb-6">Start by creating your first financial goal</p>
              <Button onClick={() => setShowForm(true)}>Create Your First Goal</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const categoryDetails = getCategoryDetails(goal.category)
                const daysUntil = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                
                return (
                  <Card key={goal.id} className={`${categoryDetails.color} border-l-4 border-purple-500`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{goal.name}</h3>
                        <p className="text-sm text-gray-600">{categoryDetails.label}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                    )}

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">Progress</span>
                        <span className="font-bold text-purple-600">{goal.progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                          style={{ width: `${Math.min(goal.progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Current</p>
                        <p className="font-bold text-gray-800">₹{Number(goal.currentAmount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Target</p>
                        <p className="font-bold text-gray-800">₹{Number(goal.targetAmount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Remaining</p>
                        <p className="font-bold text-orange-600">₹{goal.remaining.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Days Left</p>
                        <p className={`font-bold ${daysUntil < 30 ? 'text-red-600' : 'text-green-600'}`}>
                          {daysUntil > 0 ? `${daysUntil} days` : 'Overdue'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddProgress(goal, 1000)}
                        className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
                      >
                        +₹1,000
                      </button>
                      <button
                        onClick={() => handleAddProgress(goal, 5000)}
                        className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
                      >
                        +₹5,000
                      </button>
                      <button
                        onClick={() => {
                          const amount = prompt('Enter amount to add:')
                          if (amount) handleAddProgress(goal, parseFloat(amount))
                        }}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                      >
                        Custom
                      </button>
                    </div>

                    {goal.progress >= 100 && !goal.isCompleted && (
                      <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-center">
                        <p className="text-green-800 font-bold">🎉 Goal Achieved!</p>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
