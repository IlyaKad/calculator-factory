import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

// Helper: click a digit button by its exact text within the number pad
async function clickDigit(page: import('@playwright/test').Page, digit: string) {
  // Use button role with exact name to avoid matching display text
  await page.getByRole('button', { name: digit, exact: true }).first().click()
}

test.describe('Basic Calculator UI', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test('shows the calculator with display and number pad', async ({ page }) => {
    await expect(page.getByText('Basic Calculator')).toBeVisible()
    await expect(page.getByTestId('display')).toBeVisible()
    await expect(page.getByTestId('display')).toHaveText('0')
  })

  test('performs addition: 7 + 8 = 15', async ({ page }) => {
    await clickDigit(page, '7')
    await page.getByTestId('op-+').click()
    await clickDigit(page, '8')
    await page.getByTestId('btn-equals').click()

    await expect(page.getByTestId('result')).toBeVisible()
    await expect(page.getByTestId('result')).toHaveText('15')
  })

  test('performs division: 20 / 4 = 5', async ({ page }) => {
    await clickDigit(page, '2')
    await clickDigit(page, '0')
    await page.getByTestId('op-/').click()
    await clickDigit(page, '4')
    await page.getByTestId('btn-equals').click()

    await expect(page.getByTestId('result')).toBeVisible()
    await expect(page.getByTestId('result')).toHaveText('5')
  })

  test('shows error on division by zero', async ({ page }) => {
    await clickDigit(page, '5')
    await page.getByTestId('op-/').click()
    await clickDigit(page, '0')
    await page.getByTestId('btn-equals').click()

    await expect(page.getByTestId('error')).toBeVisible()
    await expect(page.getByTestId('error')).toContainText('Division by zero')
  })

  test('reset clears the calculator', async ({ page }) => {
    await clickDigit(page, '5')
    await page.getByTestId('op-+').click()
    await clickDigit(page, '3')
    await page.getByTestId('btn-equals').click()
    await expect(page.getByTestId('result')).toBeVisible()

    await page.getByTestId('btn-reset').click()
    await expect(page.getByTestId('display')).toHaveText('0')
    await expect(page.getByTestId('result')).not.toBeVisible()
  })

  test('backspace removes last digit', async ({ page }) => {
    await clickDigit(page, '7')
    await clickDigit(page, '8')
    await expect(page.getByTestId('display')).toHaveText('78')
    await page.getByTestId('btn-back').click()
    await expect(page.getByTestId('display')).toHaveText('7')
  })

  test('screenshot on pass', async ({ page }) => {
    await clickDigit(page, '3')
    await page.getByTestId('op-*').click()
    await clickDigit(page, '9')
    await page.getByTestId('btn-equals').click()
    await expect(page.getByTestId('result')).toHaveText('27')
    await page.screenshot({ path: 'C:/Coding/calculator-factory/logs/basic-calculator-ui-screenshot.png' })
  })

})
