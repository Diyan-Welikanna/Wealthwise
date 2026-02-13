import { validateBudgetTotal } from '../budgetTemplates'

describe('Budget Templates Utils', () => {
  describe('validateBudgetTotal', () => {
    it('should validate a budget that totals 100%', () => {
      const allocations = {
        mortgage: 30,
        food: 20,
        health: 10,
        entertainment: 10,
        travel: 10,
        investment: 10,
        savings: 10,
      }
      
      const result = validateBudgetTotal(allocations)
      
      expect(result.valid).toBe(true)
      expect(result.total).toBe(100)
      expect(result.difference).toBe(0)
    })
    
    it('should invalidate a budget that totals more than 100%', () => {
      const allocations = {
        mortgage: 40,
        food: 30,
        health: 20,
        entertainment: 15,
        travel: 10,
        investment: 10,
        savings: 10,
      }
      
      const result = validateBudgetTotal(allocations)
      
      expect(result.valid).toBe(false)
      expect(result.total).toBe(135)
      expect(result.difference).toBe(-35)
    })
    
    it('should invalidate a budget that totals less than 100%', () => {
      const allocations = {
        mortgage: 20,
        food: 15,
        health: 10,
        entertainment: 5,
        travel: 5,
        investment: 10,
        savings: 5,
      }
      
      const result = validateBudgetTotal(allocations)
      
      expect(result.valid).toBe(false)
      expect(result.total).toBe(70)
      expect(result.difference).toBe(30)
    })
    
    it('should handle floating point precision correctly', () => {
      const allocations = {
        mortgage: 30.5,
        food: 19.5,
        health: 10,
        entertainment: 10,
        travel: 10,
        investment: 10,
        savings: 10,
      }
      
      const result = validateBudgetTotal(allocations)
      
      expect(result.valid).toBe(true)
      expect(result.total).toBe(100)
    })
  })
})
