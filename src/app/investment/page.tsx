'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import Button from '@/components/Button'
import toast from 'react-hot-toast'

interface InvestmentCapacity {
  totalIncome: number
  investmentBudget: number
  investmentPercentage: number
  currentlyInvested: number
  availableToInvest: number
  monthlyInvestmentCapacity: number
}

interface InvestmentOption {
  type: string
  name: string
  description: string
  riskLevel: 'low' | 'medium' | 'high'
  expectedReturn: string
  minInvestment: number
  recommendedAllocation: number
  liquidity: 'low' | 'medium' | 'high'
  timeHorizon: string
  pros: string[]
  cons: string[]
}

interface RiskProfile {
  title: string
  description: string
  characteristics: string[]
}

interface PortfolioItem {
  id: number
  investmentType: string
  name: string
  units: number
  buyPrice: number
  currentPrice: number
  totalInvested: number
  currentValue: number
  purchaseDate: string
  roi: number
  profit: number
  profitPercentage: number
}

interface PortfolioSummary {
  totalInvested: number
  currentValue: number
  totalProfit: number
  overallROI: number
  portfolioCount: number
}

export default function InvestmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [capacity, setCapacity] = useState<InvestmentCapacity | null>(null)
  const [recommendations, setRecommendations] = useState<InvestmentOption[]>([])
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)
  const [riskTolerance, setRiskTolerance] = useState<string>('moderate')
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null)
  const [showAddInvestment, setShowAddInvestment] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      const [recommendationsRes, portfolioRes] = await Promise.all([
        fetch('/api/investment/recommendations'),
        fetch('/api/investment/portfolio')
      ])

      const recommendationsData = await recommendationsRes.json()
      const portfolioData = await portfolioRes.json()

      if (recommendationsData.success) {
        setCapacity(recommendationsData.data.capacity)
        setRecommendations(recommendationsData.data.recommendations)
        setRiskProfile(recommendationsData.data.riskProfile)
        setRiskTolerance(recommendationsData.data.riskTolerance)
      }

      if (portfolioData.success) {
        setPortfolio(portfolioData.portfolio)
        setPortfolioSummary(portfolioData.summary)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching investment data:', error)
      toast.error('Failed to load investment data')
      setLoading(false)
    }
  }

  const handleRiskToleranceChange = async (newRisk: string) => {
    try {
      const res = await fetch('/api/investment/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskTolerance: newRisk })
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Risk tolerance updated')
        setRiskTolerance(newRisk)
        fetchData() // Refresh recommendations
      } else {
        toast.error(data.error || 'Failed to update')
      }
    } catch (error) {
      toast.error('Failed to update risk tolerance')
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getLiquidityColor = (liquidity: string) => {
    switch (liquidity) {
      case 'high': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Investment Hub</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Smart investment recommendations tailored to your goals</p>
            </div>
            <Button onClick={() => setShowAddInvestment(true)}>
              + Add Investment
            </Button>
          </div>

          {/* Investment Capacity Cards */}
          {capacity && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <h3 className="text-sm font-semibold mb-2 opacity-90">Investment Budget</h3>
                <p className="text-3xl font-bold">₹{capacity.investmentBudget.toFixed(2)}</p>
                <p className="text-sm opacity-80 mt-1">{capacity.investmentPercentage}% of income</p>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <h3 className="text-sm font-semibold mb-2 opacity-90">Currently Invested</h3>
                <p className="text-3xl font-bold">₹{capacity.currentlyInvested.toFixed(2)}</p>
                <p className="text-sm opacity-80 mt-1">{portfolioSummary?.portfolioCount || 0} investments</p>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <h3 className="text-sm font-semibold mb-2 opacity-90">Available to Invest</h3>
                <p className="text-3xl font-bold">₹{capacity.availableToInvest.toFixed(2)}</p>
                <p className="text-sm opacity-80 mt-1">This month</p>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <h3 className="text-sm font-semibold mb-2 opacity-90">Total Profit/Loss</h3>
                <p className={`text-3xl font-bold ${portfolioSummary && portfolioSummary.totalProfit >= 0 ? 'text-white' : 'text-red-200'}`}>
                  ₹{portfolioSummary?.totalProfit.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm opacity-80 mt-1">
                  {portfolioSummary?.overallROI.toFixed(2) || '0.00'}% ROI
                </p>
              </Card>
            </div>
          )}

          {/* Risk Profile Section */}
          {riskProfile && (
            <Card className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-2">{riskProfile.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{riskProfile.description}</p>
                </div>
                <div className="flex gap-2">
                  {['conservative', 'moderate', 'aggressive'].map(risk => (
                    <button
                      key={risk}
                      onClick={() => handleRiskToleranceChange(risk)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        riskTolerance === risk
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {risk}
                    </button>
                  ))}
                </div>
              </div>
              <ul className="space-y-2">
                {riskProfile.characteristics.map((char, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-purple-600 dark:text-purple-400">✓</span>
                    {char}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Investment Recommendations */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-6">Recommended Investments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((inv, idx) => (
                <Card key={idx} className="hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">{inv.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{inv.type.replace('_', ' ')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(inv.riskLevel)}`}>
                      {inv.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{inv.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expected Return</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-dark-text">{inv.expectedReturn}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Min. Investment</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-dark-text">₹{inv.minInvestment}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Time Horizon</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-dark-text">{inv.timeHorizon}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Liquidity</p>
                      <p className={`text-sm font-semibold capitalize ${getLiquidityColor(inv.liquidity)}`}>
                        {inv.liquidity}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Recommended: {inv.recommendedAllocation}% 
                      <span className="text-purple-600 dark:text-purple-400 ml-2">
                        (₹{((capacity?.availableToInvest || 0) * inv.recommendedAllocation / 100).toFixed(2)})
                      </span>
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${inv.recommendedAllocation}%` }}
                      />
                    </div>
                  </div>

                  <details className="mb-3">
                    <summary className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                      Pros & Cons
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Pros:</p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {inv.pros.map((pro, i) => (
                            <li key={i}>✓ {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Cons:</p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {inv.cons.map((con, i) => (
                            <li key={i}>✗ {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                </Card>
              ))}
            </div>
          </div>

          {/* Current Portfolio */}
          {portfolio.length > 0 && (
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-6">My Portfolio</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Investment</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Units</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Invested</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Current Value</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Profit/Loss</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((inv) => (
                      <tr key={inv.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-800 dark:text-dark-text">{inv.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(inv.purchaseDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {inv.investmentType.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-400">
                          {inv.units.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-gray-800 dark:text-dark-text">
                          ₹{inv.totalInvested.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-gray-800 dark:text-dark-text">
                          ₹{inv.currentValue.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-right text-sm font-semibold ${inv.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {inv.profit >= 0 ? '+' : ''}₹{inv.profit.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-right text-sm font-semibold ${inv.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {inv.roi >= 0 ? '+' : ''}{inv.roi.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {portfolio.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No investments in your portfolio yet</p>
              <Button onClick={() => setShowAddInvestment(true)}>
                Start Investing
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
