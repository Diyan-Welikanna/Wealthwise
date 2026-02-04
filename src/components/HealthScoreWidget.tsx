'use client'

interface HealthScoreWidgetProps {
  score: number
  income: number
  totalSaved: number
  budgetData: Record<string, { budgeted: number; spent: number }>
}

export default function HealthScoreWidget({ 
  score, 
  income, 
  totalSaved,
  budgetData 
}: HealthScoreWidgetProps) {
  const getScoreColor = () => {
    if (score >= 75) return 'text-green-500'
    if (score >= 50) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreRing = () => {
    if (score >= 75) return 'stroke-green-500'
    if (score >= 50) return 'stroke-orange-500'
    return 'stroke-red-500'
  }

  const getScoreLabel = () => {
    if (score >= 75) return 'Excellent'
    if (score >= 50) return 'Good'
    if (score >= 25) return 'Fair'
    return 'Needs Improvement'
  }

  // Calculate factors
  const overspendCategories = Object.values(budgetData).filter(
    cat => cat.spent > cat.budgeted
  ).length
  const savingsRate = income > 0 ? ((totalSaved / income) * 100) : 0
  const emergencyFund = totalSaved >= income * 3

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Health Score</h3>
      
      <div className="flex flex-col items-center">
        {/* Circular Progress */}
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              className={getScoreRing()}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor()}`}>
              {score}
            </span>
            <span className="text-xs text-gray-500">out of 100</span>
          </div>
        </div>

        <p className={`mt-4 text-lg font-semibold ${getScoreColor()}`}>
          {getScoreLabel()}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Overspending Categories</span>
          <span className={overspendCategories === 0 ? 'text-green-600' : 'text-red-600'}>
            {overspendCategories === 0 ? '✓ None' : `✗ ${overspendCategories}`}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Savings Rate</span>
          <span className={savingsRate >= 10 ? 'text-green-600' : 'text-orange-600'}>
            {savingsRate.toFixed(1)}%
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Emergency Fund</span>
          <span className={emergencyFund ? 'text-green-600' : 'text-orange-600'}>
            {emergencyFund ? '✓ 3+ months' : '✗ Below target'}
          </span>
        </div>
      </div>

      {/* Tips */}
      {score < 75 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">💡 Tips to Improve:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            {overspendCategories > 0 && (
              <li>• Reduce spending in overspent categories</li>
            )}
            {savingsRate < 10 && (
              <li>• Aim to save at least 10% of your income</li>
            )}
            {!emergencyFund && (
              <li>• Build an emergency fund (3-6 months of expenses)</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
