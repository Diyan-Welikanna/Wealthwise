// Currency conversion utility
// Uses exchange rate API to convert between currencies

const EXCHANGE_API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_API_KEY || ''
const BASE_CURRENCY = 'INR'

// Cache for exchange rates (refresh every hour)
let ratesCache: { [key: string]: number } | null = null
let lastFetch: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

/**
 * Fetch latest exchange rates from API
 */
async function fetchExchangeRates(): Promise<{ [key: string]: number }> {
  const now = Date.now()
  
  // Return cached rates if still fresh
  if (ratesCache && (now - lastFetch < CACHE_DURATION)) {
    return ratesCache
  }

  try {
    // Using exchangerate-api.com (free tier: 1500 requests/month)
    const url = EXCHANGE_API_KEY 
      ? `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/${BASE_CURRENCY}`
      : `https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.conversion_rates || data.rates) {
      ratesCache = data.conversion_rates || data.rates
      lastFetch = now
      return ratesCache!
    }

    throw new Error('Invalid API response')
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    
    // Fallback to hardcoded rates if API fails
    return {
      INR: 1,
      USD: 0.012,
      EUR: 0.011,
      GBP: 0.0095,
      JPY: 1.85,
      AUD: 0.019,
      CAD: 0.017,
      CHF: 0.011,
      CNY: 0.087,
      SEK: 0.13,
    }
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const rates = await fetchExchangeRates()

  // Convert to base currency (INR) first
  const inINR = fromCurrency === BASE_CURRENCY 
    ? amount 
    : amount / rates[fromCurrency]

  // Then convert to target currency
  const result = toCurrency === BASE_CURRENCY 
    ? inINR 
    : inINR * rates[toCurrency]

  return Math.round(result * 100) / 100 // Round to 2 decimal places
}

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1
  }

  const rates = await fetchExchangeRates()
  
  // Convert through base currency
  const toINR = fromCurrency === BASE_CURRENCY ? 1 : 1 / rates[fromCurrency]
  const fromINR = toCurrency === BASE_CURRENCY ? 1 : rates[toCurrency]
  
  return Math.round(toINR * fromINR * 10000) / 10000 // 4 decimal places
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbols: { [key: string]: string } = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'Fr',
    CNY: '¥',
    SEK: 'kr',
  }

  const symbol = symbols[currency] || currency
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return `${symbol}${formatted}`
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies() {
  return [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  ]
}

/**
 * Clear exchange rate cache (useful for testing)
 */
export function clearRatesCache() {
  ratesCache = null
  lastFetch = 0
}
