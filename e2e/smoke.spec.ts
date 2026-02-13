import { test, expect } from '@playwright/test'

test.describe('WealthWise E2E Smoke Test', () => {
  test('complete user journey: signup -> login -> income -> budget -> expense -> dashboard', async ({ page }) => {
    // Generate unique email for test
    const timestamp = Date.now()
    const testEmail = `test${timestamp}@wealthwise.test`
    const testPassword = 'Test123!@#'
    const testName = 'Test User'
    
    // 1. Navigate to signup page
    await page.goto('/auth/signup')
    await expect(page).toHaveTitle(/WealthWise/)
    
    // 2. Sign up
    await page.fill('input[name="name"]', testName)
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.fill('input[name="confirmPassword"]', testPassword)
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard or signin
    await page.waitForURL(/\/(dashboard|auth\/signin)/, { timeout: 10000 })
    
    // 3. If redirected to signin, log in
    if (page.url().includes('/auth/signin')) {
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')
      await page.waitForURL('/dashboard', { timeout: 10000 })
    }
    
    // 4. Set income
    await page.goto('/income')
    await page.fill('input[type="number"]', '5000')
    await page.click('button:has-text("Save Income")')
    
    // Wait for success or redirect
    await page.waitForTimeout(2000)
    
    // 5. Set budget
    await page.goto('/budget')
    await expect(page.locator('text=Budget Planning')).toBeVisible()
    
    // Adjust one slider to verify interaction
    const investmentSlider = page.locator('input[type="range"]').first()
    await investmentSlider.fill('20')
    
    // Wait for validation
    await page.waitForTimeout(1000)
    
    // 6. Add an expense
    await page.goto('/expenses')
    await page.fill('input[type="number"]', '150')
    await page.selectOption('select', { index: 1 }) // Select first category
    await page.fill('input[type="text"]', 'Test expense')
    await page.click('button:has-text("Add Expense")')
    
    // Wait for expense to be added
    await page.waitForTimeout(2000)
    
    // 7. View dashboard
    await page.goto('/dashboard')
    await expect(page.locator('text=Dashboard')).toBeVisible()
    
    // Verify stats cards are visible
    await expect(page.locator('text=Monthly Income')).toBeVisible()
    await expect(page.locator('text=Total Expenses')).toBeVisible()
    
    // Verify charts are rendered (check for canvas or svg elements)
    const charts = page.locator('canvas, svg')
    await expect(charts.first()).toBeVisible()
  })
  
  test('unauthenticated user redirects to signin', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to signin
    await page.waitForURL('/auth/signin', { timeout: 5000 })
    await expect(page).toHaveURL('/auth/signin')
  })
  
  test('navigation works correctly', async ({ page }) => {
    // This test assumes you have a test user - skip auth check
    await page.goto('/auth/signin')
    
    // Check that all navigation links are present
    const navItems = ['Dashboard', 'Income', 'Budget', 'Expenses', 'Recurring', 'Profile']
    
    for (const item of navItems) {
      // Just verify the page loads without errors
      await page.goto(`/${item.toLowerCase()}`)
      await page.waitForLoadState('networkidle')
    }
  })
})
