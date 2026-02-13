import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/currency/preference
 * Get user's currency preference
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user: any = await prisma.user.findUnique({
      where: { email: session.user.email },
      // @ts-ignore - currency field exists in schema but types not updated
      select: { currency: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ currency: user.currency })

  } catch (error) {
    console.error('Get currency preference error:', error)
    return NextResponse.json(
      { error: 'Failed to get currency preference' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/currency/preference
 * Update user's currency preference
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currency } = body

    if (!currency || currency.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid currency code (must be 3 characters)' },
        { status: 400 }
      )
    }

    const user: any = await prisma.user.update({
      where: { email: session.user.email },
      // @ts-ignore - currency field exists in schema but types not updated
      data: { currency: currency.toUpperCase() },
      // @ts-ignore - currency field exists in schema but types not updated
      select: { id: true, currency: true }
    })

    return NextResponse.json({
      message: 'Currency preference updated',
      currency: user.currency
    })

  } catch (error) {
    console.error('Update currency preference error:', error)
    return NextResponse.json(
      { error: 'Failed to update currency preference' },
      { status: 500 }
    )
  }
}
