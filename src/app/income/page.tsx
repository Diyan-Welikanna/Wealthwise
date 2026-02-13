"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"
import Input from "@/components/Input"
import Button from "@/components/Button"
import { notifySuccess, notifyError } from "@/utils/notifications"

export default function IncomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [income, setIncome] = useState("")
  const [currentIncome, setCurrentIncome] = useState<string>("0")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchIncome()
    }
  }, [status])

  const fetchIncome = async () => {
    try {
      const res = await fetch("/api/income")
      const data = await res.json()
      if (data.success) {
        setCurrentIncome(data.income)
        setIncome(data.income)
      }
    } catch (error) {
      console.error("Error fetching income:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/income", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ income: parseFloat(income) }),
      })

      const data = await res.json()

      if (data.success) {
        notifySuccess(`Income updated to $${income}!`)
        setCurrentIncome(income)
        setTimeout(() => {
          router.push("/budget")
        }, 1500)
      } else {
        notifyError(data.message || "Failed to update income")
      }
    } catch (error) {
      notifyError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Sidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Monthly Income</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Input Card */}
            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Set Your Income</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">₹</span>
                    <Input
                      id="income"
                      type="number"
                      step="0.01"
                      min="0"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      placeholder="Enter your monthly income"
                      required
                      className="pl-8"
                    />
                  </div>
                </div>

                {message && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    message.includes("success") 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {message}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Income"}
                </Button>
              </form>
            </Card>

            {/* Current Income Display */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <h2 className="text-xl font-bold mb-4">Current Monthly Income</h2>
              <div className="text-6xl font-bold mb-6">
                ₹{parseFloat(currentIncome).toFixed(2)}
              </div>
              <p className="text-green-100">
                This is your current monthly income. Update it anytime to reflect changes in your earnings.
              </p>
              <div className="mt-6 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-semibold mb-2">Quick Tip:</p>
                <p className="text-sm">
                  After setting your income, make sure to allocate your budget across different categories 
                  to effectively manage your finances.
                </p>
              </div>
            </Card>
          </div>

          {/* Information Section */}
          <Card className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Why Track Your Income?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Better Budgeting</h3>
                  <p className="text-sm text-gray-600">
                    Know exactly how much you can allocate to each category
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Financial Goals</h3>
                  <p className="text-sm text-gray-600">
                    Set realistic savings and investment targets based on your income
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Track Growth</h3>
                  <p className="text-sm text-gray-600">
                    Monitor your income changes over time and celebrate increases
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

