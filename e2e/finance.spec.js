import { test, expect } from '@playwright/test';

test.describe('Module 5: Finance', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Navigate to Finance
    await page.goto('finance', { waitUntil: 'domcontentloaded' });
    
    // 2. Wait for the page to load
    await expect(page.getByRole('heading', { name: 'Finance', exact: true })).toBeVisible();
  });

  test('Admin can open the Generate Salary Slip modal', async ({ page }) => {
    // 1. Click the Generate button
    await page.getByRole('button', { name: 'Generate Salary Slip' }).click();

    // 2. Assert the modal opened (using the exact class from Finance.jsx)
    const modal = page.locator('.finance-form-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Generate Salary Slip' })).toBeVisible();

    // 3. Verify the form fields are present
    await expect(modal.locator('#generate-emp-id')).toBeVisible();
    await expect(modal.locator('#generate-month')).toBeVisible();
    await expect(modal.locator('#generate-year')).toBeVisible();

    // 4. Close it using the exact close button in the modal header
    await modal.locator('.finance-modal-close').click();
    await expect(modal).toBeHidden();
  });

  test('Admin can open the Create Salary Structure modal', async ({ page }) => {
    // 1. Click the Create Structure button
    await page.getByRole('button', { name: 'Create Salary Structure' }).click();

    // 2. Assert the modal opened
    const modal = page.locator('.finance-form-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Create Salary Structure' })).toBeVisible();

    // 3. Check for specific fields and the PF Applicable checkbox
    await expect(modal.locator('#structure-emp-id')).toBeVisible();
    await expect(modal.locator('#structure-basic')).toBeVisible();
    await expect(modal.getByText('PF Applicable')).toBeVisible();

    // 4. Close it
    await modal.locator('.finance-modal-close').click();
    await expect(modal).toBeHidden();
  });

  test('Table renders empty state or actual data', async ({ page }) => {
    // Wait for either the empty state or the table to render
    const emptyState = page.locator('.finance-empty-state');
    const tableRow = page.locator('.employee-table tbody tr').first();
    
    // Whichever one appears first means the page loaded successfully
    await expect(emptyState.or(tableRow)).toBeVisible();
  });

});