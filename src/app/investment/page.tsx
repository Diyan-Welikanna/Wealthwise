'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
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
  const [formData, setFormData] = useState({
    investmentType: 'stocks',
    name: '',
    units: '',
    buyPrice: '',
    currentPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  })
  const [submitting, setSubmitting] = useState(false)

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

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/investment/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Investment added successfully!')
        setShowAddInvestment(false)
        setFormData({
          investmentType: 'stocks',
          name: '',
          units: '',
          buyPrice: '',
          currentPrice: '',
          purchaseDate: new Date().toISOString().split('T')[0]
        })
        fetchData() // Refresh data
      } else {
        toast.error(data.error || 'Failed to add investment')
      }
    } catch (error) {
      toast.error('Failed to add investment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteInvestment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this investment?')) return

    try {
      const res = await fetch(`/api/investment/portfolio?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Investment deleted')
        fetchData()
      } else {
        toast.error(data.error || 'Failed to delete investment')
      }
    } catch (error) {
      toast.error('Failed to delete investment')
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Sidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Investment Hub</h1>
              <p className="text-gray-600 mt-1">Smart investment recommendations tailored to your goals</p>
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
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{riskProfile.title}</h2>
                  <p className="text-gray-600">{riskProfile.description}</p>
                </div>
                <div className="flex gap-2">
                  {['conservative', 'moderate', 'aggressive'].map(risk => (
                    <button
                      key={risk}
                      onClick={() => handleRiskToleranceChange(risk)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        riskTolerance === risk
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {risk}
                    </button>
                  ))}
                </div>
              </div>
              <ul className="space-y-2">
                {riskProfile.characteristics.map((char, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <span className="text-purple-600">✓</span>
                    {char}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Investment Recommendations */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommended Investments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((inv, idx) => (
                <Card key={idx} className="hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{inv.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{inv.type.replace('_', ' ')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(inv.riskLevel)}`}>
                      {inv.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{inv.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-gray-500">Expected Return</p>
                      <p className="text-sm font-semibold text-gray-800">{inv.expectedReturn}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Min. Investment</p>
                      <p className="text-sm font-semibold text-gray-800">₹{inv.minInvestment}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Time Horizon</p>
                      <p className="text-sm font-semibold text-gray-800">{inv.timeHorizon}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Liquidity</p>
                      <p className={`text-sm font-semibold capitalize ${getLiquidityColor(inv.liquidity)}`}>
                        {inv.liquidity}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Recommended: {inv.recommendedAllocation}% 
                      <span className="text-purple-600 ml-2">
                        (₹{((capacity?.availableToInvest || 0) * inv.recommendedAllocation / 100).toFixed(2)})
                      </span>
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${inv.recommendedAllocation}%` }}
                      />
                    </div>
                  </div>

                  <details className="mb-3">
                    <summary className="text-sm font-semibold text-gray-700 cursor-pointer">
                      Pros & Cons
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-green-600 mb-1">Pros:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {inv.pros.map((pro, i) => (
                            <li key={i}>✓ {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-600 mb-1">Cons:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Portfolio</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Investment</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Units</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Invested</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Current Value</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Profit/Loss</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">ROI</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((inv) => (
                      <tr key={inv.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-800">{inv.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(inv.purchaseDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                          {inv.investmentType.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">
                          {inv.units.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-gray-800">
                          ₹{inv.totalInvested.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-gray-800">
                          ₹{inv.currentValue.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-right text-sm font-semibold ${inv.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {inv.profit >= 0 ? '+' : ''}₹{inv.profit.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-right text-sm font-semibold ${inv.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {inv.roi >= 0 ? '+' : ''}{inv.roi.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteInvestment(inv.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                            title="Delete investment"
                          >
                            Delete
                          </button>
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
              <p className="text-gray-500 text-lg mb-4">No investments in your portfolio yet</p>
              <Button onClick={() => setShowAddInvestment(true)}>
                Start Investing
              </Button>
            </Card>
          )}
        </div>
      </main>

      {/* Add Investment Modal */}
      {showAddInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Add Investment</h2>
                <button
                  onClick={() => setShowAddInvestment(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddInvestment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Type
                </label>
                <select
                  value={formData.investmentType}
                  onChange={(e) => setFormData({ ...formData, investmentType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                >
                  <option value="stocks">Stocks</option>
                  <option value="bonds">Bonds</option>
                  <option value="mutual_funds">Mutual Funds</option>
                  <option value="real_estate">Real Estate (REITs)</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                  <option value="gold">Gold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Apple Inc. (AAPL), HDFC Mutual Fund"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units/Quantity
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                    placeholder="10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date
                  </label>
                  <Input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buy Price (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                    placeholder="150.50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Price (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.currentPrice}
                    onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                    placeholder="175.00"
                    required
                  />
                </div>
              </div>

              {formData.units && formData.buyPrice && formData.currentPrice && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Invested</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{(parseFloat(formData.units) * parseFloat(formData.buyPrice)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Current Value</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{(parseFloat(formData.units) * parseFloat(formData.currentPrice)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Profit/Loss</p>
                      <p className={`text-lg font-bold ${
                        (parseFloat(formData.currentPrice) - parseFloat(formData.buyPrice)) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(parseFloat(formData.currentPrice) - parseFloat(formData.buyPrice)) >= 0 ? '+' : ''}
                        ₹{((parseFloat(formData.units) * parseFloat(formData.currentPrice)) - 
                           (parseFloat(formData.units) * parseFloat(formData.buyPrice))).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowAddInvestment(false)}
                  className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Adding...' : 'Add Investment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

