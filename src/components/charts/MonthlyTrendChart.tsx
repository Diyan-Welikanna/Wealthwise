'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subMonths, startOfMonth } from 'date-fns'
import ChartSkeleton from '../ChartSkeleton'

interface TrendData {
  month: string
  [category: string]: string | number
}

interface MonthlyTrendChartProps {
  expenses: Record<string, any[]>
  categoryColors: Record<string, string>
  loading?: boolean
}

export default function MonthlyTrendChart({ expenses, categoryColors, loading = false }: MonthlyTrendChartProps) {
  if (loading) {
    return <ChartSkeleton height={300} type="line" />
  }
  // Generate data for last 6 months
  const generateTrendData = (): TrendData[] => {
    const months: TrendData[] = []
    const today = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(startOfMonth(today), i)
      const monthKey = format(monthDate, 'MMM yyyy')
      
      const monthData: TrendData = { month: format(monthDate, 'MMM') }
      
      // Calculate expenses for each category in this month
      Object.keys(categoryColors).forEach(category => {
        const categoryKey = category.toLowerCase()
        const categoryExpenses = expenses[categoryKey] || []
        
        const monthTotal = categoryExpenses
          .filter(exp => {
            const expDate = new Date(exp.date)
            return format(expDate, 'MMM yyyy') === monthKey
          })
          .reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0)
        
        monthData[category] = monthTotal
      })
      
      months.push(monthData)
    }
    
    return months
  }

  const data = generateTrendData()

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Expense Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
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
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          {Object.keys(categoryColors).map(category => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={categoryColors[category]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
