import { NextRequest, NextResponse } from 'next/server'
import { convertCurrency, getExchangeRate, getSupportedCurrencies } from '@/utils/currencyConverter'

/**
 * GET /api/currency/convert
 * Convert amount between currencies
 * Query params: amount, from, to
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const amount = searchParams.get('amount')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const action = searchParams.get('action') // 'convert' or 'rate' or 'currencies'

    // Get list of supported currencies
    if (action === 'currencies') {
      return NextResponse.json({
        currencies: getSupportedCurrencies()
      })
    }

    // Validate parameters
    if (!amount || !from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters: amount, from, to' },
        { status: 400 }
      )
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount < 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Get exchange rate only
    if (action === 'rate') {
      const rate = await getExchangeRate(from.toUpperCase(), to.toUpperCase())
      return NextResponse.json({
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        rate
      })
    }

    // Convert amount
    const converted = await convertCurrency(
      numAmount,
      from.toUpperCase(),
      to.toUpperCase()
    )

    return NextResponse.json({
      amount: numAmount,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      converted,
      rate: await getExchangeRate(from.toUpperCase(), to.toUpperCase())
    })

  } catch (error) {
    console.error('Currency conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    )
  }
}
