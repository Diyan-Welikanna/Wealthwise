import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRecommendations, getRiskProfile } from '@/utils/investmentRecommendations'
import { calculateInvestmentCapacity } from '@/utils/investmentCalculator'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        riskTolerance: true,
        budgets: true,
        incomes: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Get latest income
    const latestIncome = user.incomes[0]
    const income = latestIncome ? parseFloat(latestIncome.income.toString()) : 0

    // Get budget data
    let investmentPercentage = 15 // default
    if (user.budgets?.budget) {
      const budgetData = JSON.parse(user.budgets.budget)
      investmentPercentage = budgetData.investment?.percentage || 15
    }

    // Get total invested amount
    const portfolio = await prisma.investmentPortfolio.findMany({
      where: { userId: user.id }
    })

    const totalInvested = portfolio.reduce((sum: number, inv: any) => 
      sum + parseFloat(inv.totalInvested.toString()), 0
    )

    // Calculate investment capacity
    const capacity = calculateInvestmentCapacity(income, investmentPercentage, totalInvested)

    // Get recommendations
    const recommendations = getRecommendations(
      user.riskTolerance as 'conservative' | 'moderate' | 'aggressive',
      capacity.availableToInvest
    )

    // Get risk profile
    const riskProfile = getRiskProfile(user.riskTolerance as 'conservative' | 'moderate' | 'aggressive')

    return NextResponse.json({
      success: true,
      data: {
        capacity,
        recommendations,
        riskProfile,
        riskTolerance: user.riskTolerance
      }
    })
  } catch (error) {
    console.error('Error fetching investment recommendations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { riskTolerance } = body

    if (!['conservative', 'moderate', 'aggressive'].includes(riskTolerance)) {
      return NextResponse.json(
        { success: false, error: 'Invalid risk tolerance' },
        { status: 400 }
      )
    }

    // Update user's risk tolerance
    await prisma.user.update({
      where: { id: user.id },
      data: { riskTolerance }
    })

    return NextResponse.json({
      success: true,
      message: 'Risk tolerance updated successfully'
    })
  } catch (error) {
    console.error('Error updating risk tolerance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update risk tolerance' },
      { status: 500 }
    )
  }
}
