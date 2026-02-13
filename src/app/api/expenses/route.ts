import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const userId = parseInt(session.user.id)
    
    // Get all transactions for the user
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        transactionType: 'expense',
      },
      include: {
        category: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    })
    
    // Get all categories to initialize grouping
    const allCategories = await prisma.category.findMany()
    
    // Group expenses by category
    const expensesByCategory: any = {}
    allCategories.forEach(cat => {
      expensesByCategory[cat.name.toLowerCase()] = []
    })
    
    transactions.forEach((transaction) => {
      const categoryName = transaction.category.name.toLowerCase()
      if (expensesByCategory[categoryName]) {
        expensesByCategory[categoryName].push({
          id: transaction.id,
          amount: parseFloat(transaction.amount.toString()),
          date: transaction.transactionDate.toISOString().split('T')[0],
          description: transaction.description || '',
        })
      }
    })
    
    return NextResponse.json({
      success: true,
      expenses: JSON.stringify(expensesByCategory),
    })
  } catch (error) {
    console.error("Get expenses error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const userId = parseInt(session.user.id)
    const body = await req.json()
    const { category, amount, date, description } = body
    
    if (!category || !amount || !date) {
      return NextResponse.json(
        { success: false, message: "Category, amount, and date are required" },
        { status: 400 }
      )
    }
    
    // Get category ID
    const categoryRecord = await prisma.category.findFirst({
      where: {
        name: category,
      },
    })
    
    if (!categoryRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid category" },
        { status: 400 }
      )
    }
    
    // Create expense
    const expense = await prisma.transaction.create({
      data: {
        userId: userId,
        categoryId: categoryRecord.id,
        amount: parseFloat(amount),
        transactionDate: new Date(date),
        description: description || null,
        transactionType: 'expense',
      },
    })
    
    return NextResponse.json({
      success: true,
      message: "Expense added successfully",
      expenseId: expense.id,
    })
  } catch (error) {
    console.error("Create expense error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const userId = parseInt(session.user.id)
    const body = await req.json()
    const { expenseId } = body
    
    if (!expenseId) {
      return NextResponse.json(
        { success: false, message: "Expense ID is required" },
        { status: 400 }
      )
    }
    
    // Verify ownership and delete
    const expense = await prisma.transaction.findFirst({
      where: {
        id: parseInt(expenseId),
        userId: userId,
      },
    })
    
    if (!expense) {
      return NextResponse.json(
        { success: false, message: "Expense not found" },
        { status: 404 }
      )
    }
    
    await prisma.transaction.delete({
      where: {
        id: parseInt(expenseId),
      },
    })
    
    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully",
    })
  } catch (error) {
    console.error("Delete expense error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
