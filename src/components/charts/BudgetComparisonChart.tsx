'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import ChartSkeleton from '../ChartSkeleton';

interface BudgetComparisonChartProps {
  income: number
  budget: Record<string, { percentage: number }>
  expenses: Record<string, any[]>
  categoryColors: Record<string, string>
  loading?: boolean
}

export default function BudgetComparisonChart({ 
  income, 
  budget, 
  expenses, 
  categoryColors,
  loading = false
}: BudgetComparisonChartProps) {
  if (loading) {
    return <ChartSkeleton height={400} type="bar" />
  }
  // Prepare data for comparison
  const data = Object.keys(categoryColors).map(category => {
    const categoryKey = category.toLowerCase()
    const percentage = budget[categoryKey]?.percentage || 0
    const budgeted = (income * percentage) / 100
    
    const categoryExpenses = expenses[categoryKey] || []
    const spent = categoryExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount.toString()),
      0
    )
    
    return {
      category,
      budgeted: parseFloat(budgeted.toFixed(2)),
      spent: parseFloat(spent.toFixed(2)),
      color: categoryColors[category]
    }
  })

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `₹${value}`}
          />
          <YAxis 
            dataKey="category"
            type="category"
            width={100}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            formatter={(value: any) => `₹${parseFloat(value).toFixed(2)}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Bar 
            dataKey="budgeted" 
            fill="#e5e7eb" 
            name="Budgeted"
            radius={[0, 4, 4, 0]}
          />
          <Bar 
            dataKey="spent" 
            name="Spent"
            radius={[0, 4, 4, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.spent > entry.budgeted ? '#ef4444' : entry.color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend for colors */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Under budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Over budget</span>
        </div>
      </div>
    </div>
  )
}
