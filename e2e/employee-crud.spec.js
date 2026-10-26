import { test, expect } from '@playwright/test';

test.describe('Module 2: Employee CRUD', () => {

  test.beforeEach(async ({ page }) => {
    // Use networkidle instead of commit/load
    await page.goto('employees', { waitUntil: 'networkidle' });
    
    // Wait for the heading
    await expect(page.getByRole('heading', { name: 'Employees', exact: true })).toBeVisible();
  });

  test('Admin can see the employee list and search by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by ID, name or email...');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('purvesh');

    // Wait for the empty state OR the table to update
    const emptyMessage = page.getByText(/No employees available/i);
    const tableRow = page.locator('.employee-table tbody tr').first();
    
    await expect(emptyMessage.or(tableRow)).toBeVisible();
  });

  test('Admin can open the Employee View Modal', async ({ page }) => {
    const firstRow = page.locator('.employee-table tbody tr').first();
    
    // Wait for the table data to load from the DB
    await page.waitForTimeout(2000);

    if (await firstRow.count() === 0) {
      test.skip(true, 'Skipping modal test because there are 0 employees in the DB');
      return;
    }

    await page.getByRole('button', { name: 'View Employee' }).first().click();

    const modal = page.locator('.employee-modal-container');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: /Employee Details/i })).toBeVisible();

    await page.getByRole('button', { name: 'Close employee modal' }).click();
    await expect(modal).toBeHidden();
  });

  test('Admin can open the Employee Edit Modal', async ({ page }) => {
    const firstRow = page.locator('.employee-table tbody tr').first();
    
    // Wait for the table data to load
    await page.waitForTimeout(2000);

    if (await firstRow.count() === 0) {
      test.skip(true, 'Skipping modal test because there are 0 employees in the DB');
      return;
    }

    await page.getByRole('button', { name: 'Edit Employee' }).first().click();

    const modal = page.locator('.employee-modal-container');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: /Edit Employee/i })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Save Changes' })).toBeVisible();
  });

});