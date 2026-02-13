"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ThemeToggle from "./ThemeToggle"

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
    { href: '/profile', label: 'Profile', icon: '👤' },
  ]
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 shadow-lg flex flex-col border-r dark:border-gray-800" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="p-6 border-b dark:border-gray-800">
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
                      ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
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
      <div className="p-4 border-t dark:border-gray-800">
        {session && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Theme</span>
              <ThemeToggle />
            </div>
            
            <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getUserInitials(session.user?.name || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session.user?.email}
                </p>
              </div>
            </Link>
            
            {/* Logout Button */}
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="w-full mt-3 flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
