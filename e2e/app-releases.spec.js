import { test, expect } from '@playwright/test';

test.describe('Module 8: App Releases', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('app-releases', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'App Releases', exact: true })).toBeVisible();
  });

  test('Admin can create a new app release and see it in the table', async ({ page }) => {
    // 1. Click "New Release"
    await page.getByRole('button', { name: 'New Release' }).click();
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();

    // 2. Fill the form (using a unique version based on timestamp to prevent strict mode violations)
    const uniqueVersion = `9.9.${Date.now().toString().slice(-4)}`;
    await modal.getByPlaceholder("e.g. 1.0.0 (without 'v')").fill(uniqueVersion);
    await modal.locator('select').selectOption('RELEASED');
    await modal.locator('textarea').fill('Automated E2E test release');

    // 3. Save
    await modal.getByRole('button', { name: 'Save Release' }).click();
    await expect(modal).toBeHidden();
    await expect(page.locator('.notification-success')).toContainText('Release created');

    // 4. Verify row appears (using .first() to prevent strict mode issues if previous runs left data)
    const newRow = page.locator('tr', { hasText: uniqueVersion }).first();
    await expect(newRow).toBeVisible();
    await expect(newRow.getByText('RELEASED')).toBeVisible();

    // 5. Verify download button exists
    await expect(newRow.getByRole('button', { name: 'Download' })).toBeVisible();

    // 6. Cleanup: Delete the test release
    // Register dialog handler BEFORE clicking
    page.once('dialog', dialog => dialog.accept()); 
    await newRow.getByTitle('Delete Release').click();
    
    // Wait for the row to disappear
    await expect(page.locator('tr', { hasText: uniqueVersion })).not.toBeVisible({ timeout: 10000 });
  });

});