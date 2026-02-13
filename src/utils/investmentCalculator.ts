/**
 * Investment Calculator Utility
 * Calculates available investment amount based on budget and expenses
 */

export interface InvestmentCapacity {
  totalIncome: number
  investmentBudget: number
  investmentPercentage: number
  currentlyInvested: number
  availableToInvest: number
  monthlyInvestmentCapacity: number
}

export function calculateInvestmentCapacity(
  income: number,
  investmentPercentage: number,
  totalInvested: number = 0
): InvestmentCapacity {
  const investmentBudget = (income * investmentPercentage) / 100
  const availableToInvest = investmentBudget - totalInvested
  
  return {
    totalIncome: income,
    investmentBudget,
    investmentPercentage,
    currentlyInvested: totalInvested,
    availableToInvest: Math.max(0, availableToInvest),
    monthlyInvestmentCapacity: investmentBudget
  }
}

export function calculateROI(
  totalInvested: number,
  currentValue: number
): { roi: number; profit: number; profitPercentage: number } {
  const profit = currentValue - totalInvested
  const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0
  
  return {
    roi: profitPercentage,
    profit,
    profitPercentage
  }
}

export function calculateExpectedReturn(
  amount: number,
  annualReturnRate: number,
  years: number
): number {
  // Simple compound interest formula: A = P(1 + r/n)^(nt)
  // For annual compounding: A = P(1 + r)^t
  return amount * Math.pow(1 + annualReturnRate / 100, years)
}

export function calculateSIP(
  monthlyAmount: number,
  annualReturnRate: number,
  years: number
): { totalInvested: number; estimatedReturns: number; totalValue: number } {
  const months = years * 12
  const monthlyRate = annualReturnRate / 12 / 100
  
  // SIP formula: FV = P × ((1 + r)^n - 1) / r × (1 + r)
  const futureValue = monthlyAmount * 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
    (1 + monthlyRate)
  
  const totalInvested = monthlyAmount * months
  const estimatedReturns = futureValue - totalInvested
  
  return {
    totalInvested,
    estimatedReturns,
    totalValue: futureValue
  }
}
