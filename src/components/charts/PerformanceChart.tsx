'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ChartSkeleton from '../ChartSkeleton'

interface PerformanceChartProps {
  portfolio: Array<{
    name: string
    totalInvested: number
    currentValue: number
    profit: number
    roi: number
  }>
  loading?: boolean
}

export default function PerformanceChart({ portfolio, loading = false }: PerformanceChartProps) {
  if (loading) {
    return <ChartSkeleton height={350} type="bar" />
  }

  if (portfolio.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Investment Performance</h3>
        <div className="flex items-center justify-center h-80 text-gray-500 dark:text-gray-400">
          No investments to display
        </div>
      </div>
    )
  }

  const data = portfolio.slice(0, 10).map(inv => ({
    name: inv.name.length > 15 ? inv.name.substring(0, 15) + '...' : inv.name,
    Invested: parseFloat(inv.totalInvested.toFixed(2)),
    'Current Value': parseFloat(inv.currentValue.toFixed(2)),
    Profit: parseFloat(inv.profit.toFixed(2))
  }))

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Investment Performance</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Top {portfolio.length} investments by value
      </p>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px'
            }}
            formatter={(value: any) => `₹${parseFloat(value).toFixed(2)}`}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="Invested" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Current Value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar 
            dataKey="Profit" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Invested</p>
          <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
            ₹{portfolio.reduce((sum, inv) => sum + inv.totalInvested, 0).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Value</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            ₹{portfolio.reduce((sum, inv) => sum + inv.currentValue, 0).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Profit/Loss</p>
          <p className={`text-lg font-bold ${
            portfolio.reduce((sum, inv) => sum + inv.profit, 0) >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {portfolio.reduce((sum, inv) => sum + inv.profit, 0) >= 0 ? '+' : ''}
            ₹{portfolio.reduce((sum, inv) => sum + inv.profit, 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}
