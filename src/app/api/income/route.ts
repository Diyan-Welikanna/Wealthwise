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
    
    // Get latest income for current month
    const latestIncome = await prisma.income.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        month: 'desc',
      },
    })
    
    return NextResponse.json({
      success: true,
      income: latestIncome?.income.toString() || "0",
    })
  } catch (error) {
    console.error("Get income error:", error)
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
    const { income } = body
    
    if (!income || isNaN(parseFloat(income))) {
      return NextResponse.json(
        { success: false, message: "Invalid income value" },
        { status: 400 }
      )
    }
    
    // Get current month
    const currentMonth = new Date()
    currentMonth.setDate(1) // Set to first day of month
    
    // Update or create income for current month
    const existingIncome = await prisma.income.findFirst({
      where: {
        userId: userId,
        month: currentMonth,
      },
    })
    
    if (existingIncome) {
      await prisma.income.update({
        where: {
          id: existingIncome.id,
        },
        data: {
          income: parseFloat(income),
        },
      })
    } else {
      await prisma.income.create({
        data: {
          userId: userId,
          income: parseFloat(income),
          month: currentMonth,
        },
      })
    }
    
    return NextResponse.json({
      success: true,
      message: "Income updated successfully",
    })
  } catch (error) {
    console.error("Update income error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
