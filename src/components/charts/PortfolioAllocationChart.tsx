'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import ChartSkeleton from '../ChartSkeleton'

interface PortfolioAllocationChartProps {
  portfolio: Array<{
    investmentType: string
    name: string
    currentValue: number
  }>
  loading?: boolean
}

const INVESTMENT_COLORS: Record<string, string> = {
  stocks: '#8b5cf6',
  bonds: '#3b82f6',
  mutual_funds: '#10b981',
  real_estate: '#f59e0b',
  crypto: '#ef4444',
  fixed_deposit: '#06b6d4',
  gold: '#f97316'
}

export default function PortfolioAllocationChart({ portfolio, loading = false }: PortfolioAllocationChartProps) {
  if (loading) {
    return <ChartSkeleton height={350} type="pie" />
  }

  // Group by investment type
  const allocationMap = new Map<string, number>()
  
  portfolio.forEach(inv => {
    const current = allocationMap.get(inv.investmentType) || 0
    allocationMap.set(inv.investmentType, current + inv.currentValue)
  })

  const data = Array.from(allocationMap.entries()).map(([type, value]) => ({
    name: type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    value: parseFloat(value.toFixed(2)),
    percentage: 0
  }))

  const total = data.reduce((sum, item) => sum + item.value, 0)
  data.forEach(item => {
    item.percentage = total > 0 ? parseFloat(((item.value / total) * 100).toFixed(1)) : 0
  })

  const colors = data.map(item => {
    const typeKey = item.name.toLowerCase().replace(' ', '_')
    return INVESTMENT_COLORS[typeKey] || '#6b7280'
  })

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Portfolio Allocation</h3>
        <div className="flex items-center justify-center h-80 text-gray-500 dark:text-gray-400">
          No investments yet
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Portfolio Allocation</h3>
      
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.name}: ${entry.percentage}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px'
            }}
            formatter={(value: any) => `₹${parseFloat(value).toFixed(2)}`}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: colors[idx] }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ₹{item.value.toFixed(2)} ({item.percentage}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
