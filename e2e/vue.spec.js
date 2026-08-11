import { test, expect } from '@playwright/test'

test('visits the app root and checks for importer UI', async ({ page }) => {
  await page.goto('/')
  
  // Check main title
  await expect(page.locator('h2')).toHaveText('Tailor Your Resume')
  
  // Check drop zone presence
  await expect(page.locator('.upload-title')).toHaveText('Drag & Drop your PDF resume here')
  
  // Check Job Description label
  await expect(page.locator('label:has-text("Target Job Description")')).toBeVisible()
})
