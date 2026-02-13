'use client'

import { useState } from 'react'
import { format, eachDayOfInterval, startOfMonth, endOfMonth, getDay, addMonths, subMonths, isSameDay, startOfWeek, endOfWeek } from 'date-fns'
import ChartSkeleton from '../ChartSkeleton'

interface ExpenseHeatmapProps {
  expenses: Record<string, any[]>
  categoryColors: Record<string, string>
  loading?: boolean
}

export default function ExpenseHeatmap({ expenses, categoryColors, loading = false }: ExpenseHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  
  if (loading) {
    return <ChartSkeleton height={400} type="bar" />
  }

  // Calculate daily totals
  const getDailyExpenses = () => {
    const dailyTotals = new Map<string, number>()
    
    Object.keys(categoryColors).forEach(category => {
      const categoryKey = category.toLowerCase()
      const categoryExpenses = expenses[categoryKey] || []
      
      categoryExpenses.forEach(exp => {
        const dateKey = format(new Date(exp.date), 'yyyy-MM-dd')
        const current = dailyTotals.get(dateKey) || 0
        dailyTotals.set(dateKey, current + parseFloat(exp.amount.toString()))
      })
    })
    
    return dailyTotals
  }

  const dailyExpenses = getDailyExpenses()
  
  // Calculate intensity scale (0-4 based on quartiles)
  const getIntensityLevel = (amount: number) => {
    if (amount === 0) return 0
    
    const amounts = Array.from(dailyExpenses.values()).filter(a => a > 0).sort((a, b) => a - b)
    if (amounts.length === 0) return 0
    
    const q1 = amounts[Math.floor(amounts.length * 0.25)]
    const q2 = amounts[Math.floor(amounts.length * 0.5)]
    const q3 = amounts[Math.floor(amounts.length * 0.75)]
    
    if (amount <= q1) return 1
    if (amount <= q2) return 2
    if (amount <= q3) return 3
    return 4
  }

  // Get color based on intensity
  const getIntensityColor = (level: number) => {
    const colors = {
      0: 'bg-gray-100 dark:bg-gray-800',
      1: 'bg-purple-200 dark:bg-purple-900/40',
      2: 'bg-purple-400 dark:bg-purple-700/60',
      3: 'bg-purple-600 dark:bg-purple-600/80',
      4: 'bg-purple-800 dark:bg-purple-500'
    }
    return colors[level as keyof typeof colors]
  }

  // Generate calendar grid
  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    
    // Add padding days from previous month
    const firstDayOfWeek = getDay(start)
    const paddingDays = firstDayOfWeek
    
    return { days, paddingDays }
  }

  const { days, paddingDays } = generateCalendarDays()
  
  // Get expenses for selected day
  const getExpensesForDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayExpenses: any[] = []
    
    Object.keys(categoryColors).forEach(category => {
      const categoryKey = category.toLowerCase()
      const categoryExpenses = expenses[categoryKey] || []
      
      categoryExpenses.forEach(exp => {
        if (format(new Date(exp.date), 'yyyy-MM-dd') === dateKey) {
          dayExpenses.push({ ...exp, category })
        }
      })
    })
    
    return dayExpenses
  }

  const handleDayClick = (day: Date) => {
    setSelectedDay(isSameDay(day, selectedDay || new Date('1900-01-01')) ? null : day)
  }

  const monthTotal = days.reduce((sum, day) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    return sum + (dailyExpenses.get(dateKey) || 0)
  }, 0)

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Expense Heatmap</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(currentMonth, 'MMMM yyyy')} • Total: ₹{monthTotal.toFixed(2)}
          </p>
        </div>
        
        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="mb-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Padding days */}
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`padding-${i}`} className="aspect-square" />
          ))}
          
          {/* Actual days */}
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const amount = dailyExpenses.get(dateKey) || 0
            const intensity = getIntensityLevel(amount)
            const isSelected = selectedDay && isSameDay(day, selectedDay)
            const isToday = isSameDay(day, new Date())
            
            return (
              <button
                key={dateKey}
                onClick={() => handleDayClick(day)}
                className={`aspect-square rounded-lg transition-all relative group
                  ${getIntensityColor(intensity)}
                  ${isSelected ? 'ring-2 ring-purple-500 scale-95' : ''}
                  ${isToday ? 'ring-2 ring-blue-500' : ''}
                  hover:scale-95 hover:shadow-md
                `}
                title={`${format(day, 'MMM d, yyyy')}: ₹${amount.toFixed(2)}`}
              >
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-200">
                  {format(day, 'd')}
                </span>
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                  ₹{amount.toFixed(2)}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-4 h-4 rounded ${getIntensityColor(level)}`}
              title={level === 0 ? 'No expenses' : `Level ${level}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Selected day details */}
      {selectedDay && (
        <div className="border-t dark:border-gray-700 pt-4">
          <h4 className="font-semibold text-gray-900 dark:text-dark-text mb-3">
            {format(selectedDay, 'MMMM d, yyyy')}
          </h4>
          
          {getExpensesForDay(selectedDay).length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {getExpensesForDay(selectedDay).map((exp, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryColors[exp.category] }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{exp.description || exp.category}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-text">
                    ₹{parseFloat(exp.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No expenses recorded on this day
            </p>
          )}
        </div>
      )}
    </div>
  )
}
