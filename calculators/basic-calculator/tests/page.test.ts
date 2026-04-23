import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3001'

test.describe('Basic Calculator UI', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test('happy path: addition 10 + 5 = 15', async ({ page }) => {
    await page.fill('#a', '10')
    await page.selectOption('#operator', '+')
    await page.fill('#b', '5')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=10 + 5 = 15')).toBeVisible()
    await expect(page.getByText('Result: 15', { exact: true })).toBeVisible()
  })

  test('happy path: division 10 / 5 = 2', async ({ page }) => {
    await page.fill('#a', '10')
    await page.selectOption('#operator', '/')
    await page.fill('#b', '5')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=10 / 5 = 2')).toBeVisible()
  })

  test('happy path: percentage 500 pct 20 = 100', async ({ page }) => {
    await page.fill('#a', '500')
    await page.selectOption('#operator', 'pct')
    await page.fill('#b', '20')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=500 pct 20 = 100')).toBeVisible()
  })

  test('error state: division by zero shows error', async ({ page }) => {
    await page.fill('#a', '10')
    await page.selectOption('#operator', '/')
    await page.fill('#b', '0')
    await page.click('button[type="submit"]')
    await expect(page.locator('p[role="alert"]')).toBeVisible()
    await expect(page.locator('p[role="alert"]')).toContainText('Division by zero')
  })

  test('reset: clears result and resets form', async ({ page }) => {
    await page.fill('#a', '10')
    await page.selectOption('#operator', '+')
    await page.fill('#b', '5')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=10 + 5 = 15')).toBeVisible()
    await page.click('button:has-text("Reset")')
    await expect(page.locator('text=10 + 5 = 15')).not.toBeVisible()
    await expect(page.locator('#a')).toHaveValue('0')
    await expect(page.locator('#b')).toHaveValue('0')
  })

})
