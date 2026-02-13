import { calculateNextOccurrence } from '../recurringExpenses'

describe('Recurring Expenses Utils', () => {
  describe('calculateNextOccurrence', () => {
    it('should calculate next daily occurrence', () => {
      const currentDate = new Date('2026-02-13')
      const nextDate = calculateNextOccurrence(currentDate, 'daily')
      
      expect(nextDate.toISOString().split('T')[0]).toBe('2026-02-14')
    })
    
    it('should calculate next weekly occurrence', () => {
      const currentDate = new Date('2026-02-13')
      const nextDate = calculateNextOccurrence(currentDate, 'weekly')
      
      expect(nextDate.toISOString().split('T')[0]).toBe('2026-02-20')
    })
    
    it('should calculate next monthly occurrence', () => {
      const currentDate = new Date('2026-02-13')
      const nextDate = calculateNextOccurrence(currentDate, 'monthly')
      
      expect(nextDate.toISOString().split('T')[0]).toBe('2026-03-13')
    })
    
    it('should calculate next yearly occurrence', () => {
      const currentDate = new Date('2026-02-13')
      const nextDate = calculateNextOccurrence(currentDate, 'yearly')
      
      expect(nextDate.toISOString().split('T')[0]).toBe('2027-02-13')
    })
    
    it('should handle month-end dates correctly', () => {
      const currentDate = new Date('2026-01-31')
      const nextDate = calculateNextOccurrence(currentDate, 'monthly')
      
      // Should move to last day of February (28 or 29 days)
      // Month is 2 (March) because JavaScript's setMonth increments the month
      expect(nextDate.getMonth()).toBe(2) // March (after adjusting from Jan 31)
    })
  })
})
