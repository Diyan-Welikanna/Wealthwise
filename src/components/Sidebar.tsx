"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const getUserInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase()
    }
    return parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  }
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/income', label: 'Income', icon: '💰' },
    { href: '/budget', label: 'Budget', icon: '📈' },
    { href: '/expenses', label: 'Expenses', icon: '💸' },
    { href: '/recurring', label: 'Recurring', icon: '🔄' },
    { href: '/investment', label: 'Investment', icon: '💹' },
    { href: '/goals', label: 'Goals', icon: '🎯' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ]
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg flex flex-col border-r border-gray-200" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-purple rounded-lg flex items-center justify-center text-white font-bold text-xl">
            W
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            WealthWise
          </span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-purple-50 text-purple-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        {session && (
          <>
            <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getUserInitials(session.user?.name || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </p>
              </div>
            </Link>
            
            {/* Logout Button */}
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="w-full mt-3 flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
