'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface CategoryPieChartProps {
  expenses: Record<string, any[]>
  categoryColors: Record<string, string>
}

export default function CategoryPieChart({ expenses, categoryColors }: CategoryPieChartProps) {
  // Calculate total spent per category
  const data = Object.keys(categoryColors).map(category => {
    const categoryKey = category.toLowerCase()
    const categoryExpenses = expenses[categoryKey] || []
    const total = categoryExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount.toString()),
      0
    )
    
    return {
      name: category,
      value: total,
      color: categoryColors[category]
    }
  }).filter(item => item.value > 0) // Only show categories with expenses

  const totalExpenses = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
      {totalExpenses > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => `$${parseFloat(value).toFixed(2)}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px'
              }}
            />
            <Legend 
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No expenses recorded yet
        </div>
      )}
    </div>
  )
}
