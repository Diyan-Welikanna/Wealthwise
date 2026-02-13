import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateROI } from '@/utils/investmentCalculator'

export async function GET(request: NextRequest) {
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

    // Fetch user's portfolio
    const portfolio = await prisma.investmentPortfolio.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate totals and ROI
    let totalInvested = 0
    let currentValue = 0

    const portfolioWithMetrics = portfolio.map((inv: any) => {
      const invested = parseFloat(inv.totalInvested.toString())
      const current = parseFloat(inv.currentValue.toString())
      
      totalInvested += invested
      currentValue += current

      const roi = calculateROI(invested, current)

      return {
        id: inv.id,
        investmentType: inv.investmentType,
        name: inv.name,
        units: parseFloat(inv.units.toString()),
        buyPrice: parseFloat(inv.buyPrice.toString()),
        currentPrice: parseFloat(inv.currentPrice.toString()),
        totalInvested: invested,
        currentValue: current,
        purchaseDate: inv.purchaseDate,
        roi: roi.roi,
        profit: roi.profit,
        profitPercentage: roi.profitPercentage
      }
    })

    const overallROI = calculateROI(totalInvested, currentValue)

    return NextResponse.json({
      success: true,
      portfolio: portfolioWithMetrics,
      summary: {
        totalInvested,
        currentValue,
        totalProfit: overallROI.profit,
        overallROI: overallROI.roi,
        portfolioCount: portfolio.length
      }
    })
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio' },
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
    const { investmentType, name, units, buyPrice, currentPrice, purchaseDate } = body

    if (!investmentType || !name || !units || !buyPrice || !currentPrice || !purchaseDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const totalInvested = parseFloat(units) * parseFloat(buyPrice)
    const currentValue = parseFloat(units) * parseFloat(currentPrice)

    // Create portfolio entry
    const investment = await prisma.investmentPortfolio.create({
      data: {
        userId: user.id,
        investmentType,
        name,
        units: parseFloat(units),
        buyPrice: parseFloat(buyPrice),
        currentPrice: parseFloat(currentPrice),
        totalInvested,
        currentValue,
        purchaseDate: new Date(purchaseDate)
      }
    })

    // Create transaction record
    await prisma.investmentTransaction.create({
      data: {
        userId: user.id,
        portfolioId: investment.id,
        type: 'buy',
        units: parseFloat(units),
        pricePerUnit: parseFloat(buyPrice),
        totalAmount: totalInvested,
        date: new Date(purchaseDate)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Investment added to portfolio successfully',
      investment: {
        id: investment.id,
        name: investment.name,
        totalInvested
      }
    })
  } catch (error) {
    console.error('Error adding investment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add investment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Investment ID required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const investment = await prisma.investmentPortfolio.findFirst({
      where: { id: parseInt(id), userId: user.id }
    })

    if (!investment) {
      return NextResponse.json(
        { success: false, error: 'Investment not found' },
        { status: 404 }
      )
    }

    // Delete investment (transactions will cascade)
    await prisma.investmentPortfolio.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: 'Investment removed from portfolio'
    })
  } catch (error) {
    console.error('Error deleting investment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete investment' },
      { status: 500 }
    )
  }
}
