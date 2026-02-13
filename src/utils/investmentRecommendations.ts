/**
 * Investment Recommendation Engine
 * Rule-based system for generating personalized investment recommendations
 */

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive'

export type InvestmentType = 
  | 'stocks' 
  | 'bonds' 
  | 'mutual_funds' 
  | 'real_estate' 
  | 'crypto' 
  | 'fixed_deposit' 
  | 'gold'

export interface InvestmentOption {
  type: InvestmentType
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

const investmentDatabase: InvestmentOption[] = [
  {
    type: 'fixed_deposit',
    name: 'Fixed Deposit (FD)',
    description: 'Guaranteed returns with capital protection from banks',
    riskLevel: 'low',
    expectedReturn: '6-7% p.a.',
    minInvestment: 1000,
    recommendedAllocation: 0,
    liquidity: 'low',
    timeHorizon: '1-5 years',
    pros: ['Guaranteed returns', 'Capital protection', 'No market risk'],
    cons: ['Low returns', 'Penalty on premature withdrawal', 'Fixed lock-in period']
  },
  {
    type: 'bonds',
    name: 'Government Bonds',
    description: 'Debt securities issued by government, very safe',
    riskLevel: 'low',
    expectedReturn: '7-8% p.a.',
    minInvestment: 1000,
    recommendedAllocation: 0,
    liquidity: 'medium',
    timeHorizon: '3-10 years',
    pros: ['Low risk', 'Stable returns', 'Government backed'],
    cons: ['Lower returns than equity', 'Interest rate risk', 'Long lock-in']
  },
  {
    type: 'gold',
    name: 'Digital Gold / Gold ETF',
    description: 'Hedge against inflation, safe haven asset',
    riskLevel: 'low',
    expectedReturn: '8-10% p.a.',
    minInvestment: 500,
    recommendedAllocation: 0,
    liquidity: 'high',
    timeHorizon: '3-5 years',
    pros: ['Inflation hedge', 'High liquidity', 'Safe haven'],
    cons: ['No regular income', 'Price volatility', 'Storage costs (physical)']
  },
  {
    type: 'mutual_funds',
    name: 'Balanced Mutual Funds',
    description: 'Mix of equity and debt, professionally managed',
    riskLevel: 'medium',
    expectedReturn: '10-12% p.a.',
    minInvestment: 500,
    recommendedAllocation: 0,
    liquidity: 'high',
    timeHorizon: '3-5 years',
    pros: ['Professional management', 'Diversification', 'Balanced risk'],
    cons: ['Management fees', 'Market risk', 'Exit load']
  },
  {
    type: 'mutual_funds',
    name: 'Index Funds',
    description: 'Low-cost funds tracking market indices like Nifty 50',
    riskLevel: 'medium',
    expectedReturn: '12-15% p.a.',
    minInvestment: 500,
    recommendedAllocation: 0,
    liquidity: 'high',
    timeHorizon: '5-10 years',
    pros: ['Low expense ratio', 'Market returns', 'Passive investing'],
    cons: ['Market risk', 'No alpha generation', 'Volatility']
  },
  {
    type: 'stocks',
    name: 'Large Cap Stocks',
    description: 'Established companies with market cap > ₹20,000 Cr',
    riskLevel: 'medium',
    expectedReturn: '12-15% p.a.',
    minInvestment: 1000,
    recommendedAllocation: 0,
    liquidity: 'high',
    timeHorizon: '5-10 years',
    pros: ['High liquidity', 'Dividend income', 'Capital appreciation'],
    cons: ['Market volatility', 'Requires research', 'Company-specific risk']
  },
  {
    type: 'stocks',
    name: 'Mid & Small Cap Stocks',
    description: 'Higher growth potential with higher risk',
    riskLevel: 'high',
    expectedReturn: '15-20% p.a.',
    minInvestment: 1000,
    recommendedAllocation: 0,
    liquidity: 'medium',
    timeHorizon: '7-10 years',
    pros: ['High growth potential', 'Multi-bagger opportunities', 'Market inefficiencies'],
    cons: ['High volatility', 'Lower liquidity', 'Higher risk']
  },
  {
    type: 'real_estate',
    name: 'REITs (Real Estate Investment Trusts)',
    description: 'Invest in real estate without buying property',
    riskLevel: 'medium',
    expectedReturn: '10-14% p.a.',
    minInvestment: 10000,
    recommendedAllocation: 0,
    liquidity: 'medium',
    timeHorizon: '5-10 years',
    pros: ['Regular income', 'Real estate exposure', 'Professional management'],
    cons: ['Market risk', 'Interest rate sensitivity', 'Lower liquidity']
  },
  {
    type: 'crypto',
    name: 'Cryptocurrency (Bitcoin, Ethereum)',
    description: 'High risk, high reward digital assets',
    riskLevel: 'high',
    expectedReturn: 'Variable (20-100%+ or loss)',
    minInvestment: 500,
    recommendedAllocation: 0,
    liquidity: 'high',
    timeHorizon: '3-5 years',
    pros: ['High growth potential', '24/7 trading', 'Decentralized'],
    cons: ['Extremely volatile', 'Regulatory uncertainty', 'High risk of loss']
  }
]

export function getRecommendations(
  riskTolerance: RiskTolerance,
  availableAmount: number,
  investmentGoal?: 'wealth_creation' | 'retirement' | 'short_term' | 'balanced'
): InvestmentOption[] {
  let recommendations = [...investmentDatabase]
  
  // Filter based on risk tolerance
  if (riskTolerance === 'conservative') {
    recommendations = recommendations.filter(inv => 
      inv.riskLevel === 'low' || (inv.riskLevel === 'medium' && inv.type === 'mutual_funds')
    )
    recommendations = assignAllocations(recommendations, [40, 30, 20, 10])
  } else if (riskTolerance === 'moderate') {
    recommendations = recommendations.filter(inv => 
      inv.riskLevel === 'low' || inv.riskLevel === 'medium'
    )
    recommendations = assignAllocations(recommendations, [20, 25, 25, 15, 15])
  } else if (riskTolerance === 'aggressive') {
    // Include all types
    recommendations = assignAllocations(recommendations, [10, 10, 15, 20, 20, 15, 5, 5])
  }
  
  // Adjust based on investment goal
  if (investmentGoal === 'retirement') {
    recommendations = recommendations.map(inv => {
      if (inv.type === 'mutual_funds' || inv.type === 'stocks') {
        return { ...inv, recommendedAllocation: inv.recommendedAllocation + 5 }
      }
      return inv
    })
  } else if (investmentGoal === 'short_term') {
    recommendations = recommendations.filter(inv => 
      inv.liquidity === 'high' || inv.liquidity === 'medium'
    )
  }
  
  // Filter by minimum investment
  recommendations = recommendations.filter(inv => 
    inv.minInvestment <= availableAmount
  )
  
  // Normalize allocations to 100%
  const totalAllocation = recommendations.reduce((sum, inv) => sum + inv.recommendedAllocation, 0)
  if (totalAllocation > 0) {
    recommendations = recommendations.map(inv => ({
      ...inv,
      recommendedAllocation: Math.round((inv.recommendedAllocation / totalAllocation) * 100)
    }))
  }
  
  return recommendations.sort((a, b) => b.recommendedAllocation - a.recommendedAllocation)
}

function assignAllocations(investments: InvestmentOption[], allocations: number[]): InvestmentOption[] {
  return investments.map((inv, index) => ({
    ...inv,
    recommendedAllocation: allocations[index] || 0
  }))
}

export function calculateRecommendedAmounts(
  recommendations: InvestmentOption[],
  totalAmount: number
): Map<string, number> {
  const amounts = new Map<string, number>()
  
  recommendations.forEach(inv => {
    const amount = (totalAmount * inv.recommendedAllocation) / 100
    amounts.set(inv.name, Math.round(amount))
  })
  
  return amounts
}

export function getRiskProfile(riskTolerance: RiskTolerance): {
  title: string
  description: string
  characteristics: string[]
} {
  const profiles = {
    conservative: {
      title: 'Conservative Investor',
      description: 'Prioritizes capital preservation and stable returns over high growth',
      characteristics: [
        'Low risk tolerance',
        'Prefers guaranteed returns',
        'Focuses on capital protection',
        'Suitable for near-term goals'
      ]
    },
    moderate: {
      title: 'Moderate Investor',
      description: 'Balanced approach between growth and stability',
      characteristics: [
        'Medium risk tolerance',
        'Mix of debt and equity',
        'Long-term wealth creation',
        'Can handle moderate volatility'
      ]
    },
    aggressive: {
      title: 'Aggressive Investor',
      description: 'Seeks maximum growth with higher risk acceptance',
      characteristics: [
        'High risk tolerance',
        'Equity-focused portfolio',
        'Long investment horizon',
        'Can handle market volatility'
      ]
    }
  }
  
  return profiles[riskTolerance]
}
