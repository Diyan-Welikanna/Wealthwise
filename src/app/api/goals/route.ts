import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const goals = await (prisma as any).goal.findMany({
      where: { userId: user.id },
      orderBy: { deadline: 'asc' },
    })

    // Calculate progress percentage for each goal
    const goalsWithProgress = goals.map((goal: any) => ({
      ...goal,
      progress: (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
      remaining: Number(goal.targetAmount) - Number(goal.currentAmount),
    }))

    return NextResponse.json(goalsWithProgress)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, targetAmount, currentAmount, deadline, category, description } = body

    if (!name || !targetAmount || !deadline || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const goal = await (prisma as any).goal.create({
      data: {
        userId: user.id,
        name,
        targetAmount,
        currentAmount: currentAmount || 0,
        deadline: new Date(deadline),
        category,
        description,
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
