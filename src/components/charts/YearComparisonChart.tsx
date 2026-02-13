'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subYears, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns'
import ChartSkeleton from '../ChartSkeleton'
import { useState } from 'react'

interface YearComparisonChartProps {
  expenses: Record<string, any[]>
  categoryColors: Record<string, string>
  loading?: boolean
}

export default function YearComparisonChart({ expenses, categoryColors, loading = false }: YearComparisonChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  if (loading) {
    return <ChartSkeleton height={350} type="line" />
  }

  const generateYearComparisonData = () => {
    const currentYear = new Date().getFullYear()
    const previousYear = currentYear - 1
    
    // Generate months for both years
    const currentYearMonths = eachMonthOfInterval({
      start: startOfYear(new Date(currentYear, 0, 1)),
      end: endOfYear(new Date(currentYear, 11, 31))
    })
    
    const data = currentYearMonths.map((month, index) => {
      const monthKey = format(month, 'MMM')
      const currentYearKey = format(month, 'MMM yyyy')
      const previousYearMonth = subYears(month, 1)
      const previousYearKey = format(previousYearMonth, 'MMM yyyy')
      
      let currentYearTotal = 0
      let previousYearTotal = 0
      
      // Calculate totals based on selected category
      if (selectedCategory === 'all') {
        // Sum all categories
        Object.keys(categoryColors).forEach(category => {
          const categoryKey = category.toLowerCase()
          const categoryExpenses = expenses[categoryKey] || []
          
          currentYearTotal += categoryExpenses
            .filter(exp => format(new Date(exp.date), 'MMM yyyy') === currentYearKey)
            .reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0)
          
          previousYearTotal += categoryExpenses
            .filter(exp => format(new Date(exp.date), 'MMM yyyy') === previousYearKey)
            .reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0)
        })
      } else {
        // Calculate for selected category only
        const categoryKey = selectedCategory.toLowerCase()
        const categoryExpenses = expenses[categoryKey] || []
        
        currentYearTotal = categoryExpenses
          .filter(exp => format(new Date(exp.date), 'MMM yyyy') === currentYearKey)
          .reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0)
        
        previousYearTotal = categoryExpenses
          .filter(exp => format(new Date(exp.date), 'MMM yyyy') === previousYearKey)
          .reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0)
      }
      
      // Calculate percentage change
      const change = previousYearTotal > 0 
        ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100 
        : 0
      
      return {
        month: monthKey,
        [currentYear]: parseFloat(currentYearTotal.toFixed(2)),
        [previousYear]: parseFloat(previousYearTotal.toFixed(2)),
        change: parseFloat(change.toFixed(1))
      }
    })
    
    return { data, currentYear, previousYear }
  }

  const { data, currentYear, previousYear } = generateYearComparisonData()
  
  // Calculate totals for both years
  const currentYearTotal = data.reduce((sum, month) => sum + month[currentYear], 0)
  const previousYearTotal = data.reduce((sum, month) => sum + month[previousYear], 0)
  const overallChange = previousYearTotal > 0 
    ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100 
    : 0

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Year-over-Year Comparison</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentYear} vs {previousYear} • 
            <span className={`ml-2 font-semibold ${overallChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {overallChange >= 0 ? '+' : ''}{overallChange.toFixed(1)}% change
            </span>
          </p>
        </div>
        
        {/* Category selector */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-purple-500 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {Object.keys(categoryColors).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
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
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey={currentYear}
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ r: 4, fill: '#8b5cf6' }}
            activeDot={{ r: 6 }}
            name={`${currentYear} (Current)`}
          />
          <Line
            type="monotone"
            dataKey={previousYear}
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: '#94a3b8' }}
            activeDot={{ r: 5 }}
            name={`${previousYear} (Previous)`}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t dark:border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{currentYear} Total</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">₹{currentYearTotal.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{previousYear} Total</p>
          <p className="text-lg font-bold text-gray-600 dark:text-gray-400">₹{previousYearTotal.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Difference</p>
          <p className={`text-lg font-bold ${overallChange >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {overallChange >= 0 ? '+' : ''}₹{(currentYearTotal - previousYearTotal).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}
