'use client'

interface StatCardProps {
  title: string
  value: string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon: string
  color: string
}

function StatCard({ title, value, change, trend, icon, color }: StatCardProps) {
  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-gray-500'
    return trend === 'up' ? 'text-green-500' : 'text-red-500'
  }

  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return '→'
    return trend === 'up' ? '↑' : '↓'
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm font-medium mt-1 ${getTrendColor()}`}>
              <span className="mr-1">{getTrendIcon()}</span>
              {Math.abs(change).toFixed(1)}% from last month
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatsCardsProps {
  income: number
  totalSpent: number
  totalSaved: number
  budgetHealth: number
}

export default function StatsCards({ income, totalSpent, totalSaved, budgetHealth }: StatsCardsProps) {
  const savingsRate = income > 0 ? ((totalSaved / income) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Income"
        value={`$${income.toFixed(2)}`}
        icon="💰"
        color="border-green-500"
      />
      
      <StatCard
        title="Total Spent"
        value={`$${totalSpent.toFixed(2)}`}
        change={0}
        trend="neutral"
        icon="💸"
        color="border-blue-500"
      />
      
      <StatCard
        title="Total Saved"
        value={`$${totalSaved.toFixed(2)}`}
        change={savingsRate}
        trend={savingsRate > 15 ? 'up' : savingsRate < 5 ? 'down' : 'neutral'}
        icon="💎"
        color="border-purple-500"
      />
      
      <StatCard
        title="Budget Health"
        value={`${budgetHealth}/100`}
        change={budgetHealth - 75}
        trend={budgetHealth >= 75 ? 'up' : budgetHealth < 50 ? 'down' : 'neutral'}
        icon="❤️"
        color="border-pink-500"
      />
    </div>
  )
}
