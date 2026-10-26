import { test, expect } from '@playwright/test';

test.describe('Module 6: Admins Directory', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('admins', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Administrators', exact: true })).toBeVisible();
  });

  test('Admin can open the Add Admin modal and validate form', async ({ page }) => {
    // 1. Click Add Admin
    await page.getByRole('button', { name: 'Add Admin' }).click();

    // 2. Assert Modal opened (using the exact classes from your code)
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Add Admin' })).toBeVisible();

    // 3. Fill the form with a fake email
    await modal.locator('input[name="firstName"]').fill('Test');
    await modal.locator('input[name="lastName"]').fill('Admin');
    await modal.locator('input[name="email"]').fill(`testadmin${Date.now()}@example.com`);
    await modal.locator('input[name="mobile"]').fill('9876543210');
    await modal.locator('input[name="password"]').fill('Test@1234');

    // 4. Assert the Save button is enabled
    const saveBtn = modal.getByRole('button', { name: 'Add Admin', exact: true });
    await expect(saveBtn).toBeEnabled();

    // 5. Click Cancel to avoid DB pollution
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).toBeHidden();
  });

  test('Admin table renders empty state or data', async ({ page }) => {
    const emptyState = page.getByText('No administrators available.');
    const tableRow = page.locator('.employee-table tbody tr').first();
    
    // Wait for either to appear
    await expect(emptyState.or(tableRow)).toBeVisible();
  });

});