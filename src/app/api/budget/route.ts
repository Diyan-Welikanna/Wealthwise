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
    
    const budget = await prisma.userBudget.findUnique({
      where: {
        userId: userId,
      },
    })
    
    // Default budget if none exists
    const defaultBudget = {
      mortgage: { percentage: 25 },
      entertainment: { percentage: 15 },
      travel: { percentage: 10 },
      food: { percentage: 15 },
      health: { percentage: 10 },
      investment: { percentage: 15 },
      savings: { percentage: 10 },
    }
    
    return NextResponse.json({
      success: true,
      budget: budget ? JSON.stringify(budget.budget) : JSON.stringify(defaultBudget),
    })
  } catch (error) {
    console.error("Get budget error:", error)
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
    const { budget } = body
    
    if (!budget) {
      return NextResponse.json(
        { success: false, message: "Budget data is required" },
        { status: 400 }
      )
    }
    
    // Validate budget
    const budgetObj = typeof budget === 'string' ? JSON.parse(budget) : budget
    
    // Calculate total percentage
    const total = Object.values(budgetObj).reduce(
      (sum: number, cat: any) => sum + (cat.percentage || 0),
      0
    )
    
    if (total !== 100) {
      return NextResponse.json(
        { success: false, message: "Total budget must equal 100%" },
        { status: 400 }
      )
    }
    
    // Check investment minimum 10%
    if (budgetObj.investment?.percentage < 10) {
      return NextResponse.json(
        { success: false, message: "Investment must be at least 10%" },
        { status: 400 }
      )
    }
    
    // Check savings minimum 5%
    if (budgetObj.savings?.percentage < 5) {
      return NextResponse.json(
        { success: false, message: "Savings must be at least 5%" },
        { status: 400 }
      )
    }
    
    // Upsert budget
    await prisma.userBudget.upsert({
      where: {
        userId: userId,
      },
      update: {
        budget: budgetObj,
      },
      create: {
        userId: userId,
        budget: budgetObj,
      },
    })
    
    return NextResponse.json({
      success: true,
      message: "Budget updated successfully",
    })
  } catch (error) {
    console.error("Update budget error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
