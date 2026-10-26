import { test, expect } from '@playwright/test';

test.describe('Module 7: Announcements', () => {

  test.beforeEach(async ({ page }) => {
    // Use networkidle to let the API call finish
    await page.goto('announcements', { waitUntil: 'networkidle' });
    
    // Fallback: wait for either the heading OR the error toast
    const heading = page.getByRole('heading', { name: 'Announcements', exact: true });
    const errorToast = page.locator('.notification-error');
    
    await expect(heading.or(errorToast)).toBeVisible({ timeout: 10000 });
  });

  test('Admin can open the New Announcement modal', async ({ page }) => {
    // 1. Click New Announcement
    await page.getByRole('button', { name: 'New Announcement' }).click();

    // 2. Assert Modal
    const modal = page.locator('.ann-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'New Announcement' })).toBeVisible();

    // 3. Fill the form
    await modal.locator('#ann-title').fill('E2E Test Announcement');
    await modal.locator('#ann-message').fill('This is a test message for the E2E suite.');
    
    // 4. Assert submit button is enabled
    const submitBtn = modal.getByRole('button', { name: 'Post announcement' });
    await expect(submitBtn).toBeEnabled();

    // 5. Close without saving
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).toBeHidden();
  });

  test('Announcement list renders or shows empty state', async ({ page }) => {
    // If the page loaded successfully, wait for either empty state or card
    const emptyState = page.locator('.ann-empty');
    const annCard = page.locator('.ann-card').first();
    
    await expect(emptyState.or(annCard)).toBeVisible({ timeout: 10000 });
  });

});