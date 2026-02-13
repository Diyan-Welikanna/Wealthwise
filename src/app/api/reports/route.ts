import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/reports
 * Generate financial report data
 * Query params: period (month/year), startDate, endDate
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    const now = new Date()
    let start: Date
    let end: Date

    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
    } else if (period === 'year') {
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    }

    // Fetch income data
    const income = await prisma.income.findMany({
      where: {
        userId: user.id,
        month: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { month: 'desc' },
    })

    // Fetch expense data
    const expenses = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        transactionType: 'expense',
        transactionDate: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { transactionDate: 'desc' },
      include: {
        category: true,
      },
    })

    // Fetch budget data
    const budgetRecord = await prisma.userBudget.findUnique({
      where: {
        userId: user.id,
      },
    })

    // Parse budget JSON
    let budgets: any[] = []
    if (budgetRecord && budgetRecord.budget) {
      const budgetJson = JSON.parse(budgetRecord.budget)
      const totalIncome = income.length > 0 ? Number(income[0].income) : 0
      budgets = Object.entries(budgetJson).map(([category, data]: [string, any]) => ({
        category,
        amount: (data.percentage / 100) * totalIncome,
      }))
    }

    // Calculate expense totals by category
    const categorySpending: { [key: string]: number } = {}
    expenses.forEach((expense: any) => {
      const catName = expense.category?.name || 'Uncategorized'
      if (!categorySpending[catName]) {
        categorySpending[catName] = 0
      }
      categorySpending[catName] += Number(expense.amount)
    })

    // Format budget data with actual spending
    const budgetComparison = budgets.map((budget: any) => ({
      category: budget.category,
      budgeted: Number(budget.amount),
      spent: categorySpending[budget.category] || 0,
    }))

    // Fetch investment data (optional)
    const investments = await prisma.investmentPortfolio.findMany({
      where: { userId: user.id },
    })

    const investmentSummary = investments.map((inv: any) => ({
      type: inv.investmentType,
      amount: Number(inv.investedAmount),
      currentValue: Number(inv.currentValue),
      roi: Number(inv.roi),
    }))

    // Calculate summary
    const totalIncome = income.reduce((sum: number, inc: any) => sum + Number(inc.income), 0)
    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0)
    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

    // Build report data
    const reportData = {
      period: period === 'year' ? 'Annual Report' : 'Monthly Report',
      startDate: start.toLocaleDateString('en-IN'),
      endDate: end.toLocaleDateString('en-IN'),
      user: {
        name: user.name,
        email: user.email,
      },
      summary: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate,
      },
      income: income.map((inc: any) => ({
        id: inc.id,
        source: 'Monthly Income',
        amount: Number(inc.income),
        date: inc.month.toISOString(),
      })),
      expenses: expenses.map((exp: any) => ({
        id: exp.id,
        amount: Number(exp.amount),
        category: exp.category?.name || 'Uncategorized',
        description: exp.description || '',
        date: exp.transactionDate.toISOString(),
      })),
      budgets: budgetComparison,
      investments: investmentSummary.length > 0 ? investmentSummary : undefined,
    }

    return NextResponse.json(reportData)

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
