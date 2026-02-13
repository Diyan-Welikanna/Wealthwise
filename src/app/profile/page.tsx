"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"
import Input from "@/components/Input"
import Button from "@/components/Button"
import { getSupportedCurrencies } from "@/utils/currencyConverter"
import { notifySuccess, notifyError } from "@/utils/notifications"

interface UserProfile {
  id: number
  name: string
  email: string
  phone: string | null
  currency: string
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currency: "INR",
  })

  const currencies = getSupportedCurrencies()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile()
    }
  }, [status])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile")
      const data = await res.json()

      if (data.success && data.user) {
        setProfile(data.user)
        setFormData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "",
          currency: data.user.currency || "INR",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setMessage("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
        currency: profile.currency || "INR",
      })
    }
    setMessage("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        notifySuccess("Profile updated successfully!")
        setIsEditing(false)
        await fetchProfile()
      } else {
        notifyError(data.message || "Failed to update profile")
      }
    } catch (error) {
      notifyError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await signOut({ redirect: true, callbackUrl: "/auth/signin" })
    }
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase()
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
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

  if (!session || !profile) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Sidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
                    {getInitials(profile.name)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{profile.name}</h2>
                <p className="text-gray-600 mb-4">{profile.email}</p>
                <p className="text-sm text-gray-500">
                  Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </Card>

            {/* Personal Information */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                {!isEditing && (
                  <Button onClick={handleEdit} variant="secondary">
                    Edit Profile
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      {currencies.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.code} - {curr.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      All amounts will be displayed in your preferred currency
                    </p>
                  </div>
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

                {isEditing && (
                  <div className="flex gap-3 mt-6">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </Card>
          </div>

          {/* Account Actions */}
          <Card className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Account Actions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-800">Logout</h3>
                  <p className="text-sm text-gray-600">Sign out of your account</p>
                </div>
                <Button onClick={handleLogout} variant="secondary">
                  Logout
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-red-800">Delete Account</h3>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                </div>
                <Button 
                  onClick={() => alert("This feature is not yet implemented")}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>

          {/* App Information */}
          <Card className="mt-6 bg-gradient-to-br from-primary to-purple-600 text-white">
            <h2 className="text-xl font-bold mb-4">About WealthWise</h2>
            <div className="space-y-2 text-white/90">
              <p>Your intelligent finance companion helping you manage your money better.</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm opacity-75">Version</p>
                  <p className="font-semibold">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Last Updated</p>
                  <p className="font-semibold">Feb 2026</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

