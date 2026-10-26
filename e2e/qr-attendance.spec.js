import { test, expect } from '@playwright/test';

test.describe('Module 4: QR Attendance', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Navigate to Attendance
    await page.goto('attendance', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Attendance', exact: true })).toBeVisible();
  });

  test('Admin can generate a QR code and revoke it', async ({ page }) => {
    // 1. Open Initiate Modal
    await page.getByRole('button', { name: 'Initiate Attendance' }).click();
    
    // 2. The modal should be visible
    const modal = page.locator('.attendance-initiate-modal');
    await expect(modal).toBeVisible();

    // 3. Switch to the QR Code tab
    await modal.getByRole('tab', { name: 'QR Code' }).click();
    
    // 4. Click Generate QR
    await page.getByRole('button', { name: 'Generate QR Code' }).click();

    // 5. Assert the QR code panel appeared (Wait up to 15s for backend to respond)
    const qrPanel = page.locator('.qr-panel');
    await expect(qrPanel.locator('.qr-box')).toBeVisible({ timeout: 15000 });
    await expect(qrPanel.getByText('QR expires in')).toBeVisible();

    // 6. Revoke the QR
    await page.getByRole('button', { name: 'Revoke QR', exact: true }).click();
    
    // 7. Assert it shows "QR Revoked" (Wait up to 15s for backend)
    await expect(qrPanel.getByText('QR Revoked')).toBeVisible({ timeout: 15000 });

    // 8. Close the modal using the exact class from your code
    await page.locator('.attendance-modal-footer').getByRole('button', { name: 'Close' }).click();
    await expect(modal).toBeHidden();
  });

  test('Employee scan page shows error without a valid token', async ({ page }) => {
    // 1. Navigate directly to the scan page without a token in the hash
    await page.goto('attendance/scan');
    
    // 2. Assert the error state is shown
    await expect(page.getByText('Could not mark attendance')).toBeVisible();
    await expect(page.getByText(/This QR code is not valid/i)).toBeVisible();
  });

});