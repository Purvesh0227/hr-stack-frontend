import { test, expect } from '@playwright/test';

test.describe('Module 3: Attendance', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Navigate to Attendance
    await page.goto('attendance', { waitUntil: 'domcontentloaded' });
    
    // 2. Wait for the page to load
    await expect(page.getByRole('heading', { name: 'Attendance', exact: true })).toBeVisible();
  });

  test('Admin can open Initiate Attendance modal', async ({ page }) => {
    // 1. Click the Initiate button
    await page.getByRole('button', { name: 'Initiate Attendance' }).click();

    // 2. Assert the modal opened
    const modal = page.locator('.attendance-initiate-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Initiate Attendance' })).toBeVisible();
    
    // 3. Assert the "OTP" tab is active by default
    const otpTab = modal.getByRole('tab', { name: 'OTP' });
    await expect(otpTab).toHaveAttribute('aria-selected', 'true');

    // 4. Close the modal
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(modal).toBeHidden();
  });

  test('Admin can generate an OTP', async ({ page }) => {
    // 1. Open Initiate Modal
    await page.getByRole('button', { name: 'Initiate Attendance' }).click();
    const modal = page.locator('.attendance-initiate-modal');
    
    // 2. Click Generate OTP
    const generateBtn = page.getByRole('button', { name: 'Generate OTP' });
    await generateBtn.click();

    // 3. Wait for the success box to appear (this proves the backend responded)
    const otpBox = page.locator('.attendance-otp-box');
    await expect(otpSuccessBox.or(errorToast)).toBeVisible({ timeout: 30000 });

    // 4. Assert the countdown started
    await expect(otpBox.getByText('OTP Sent Successfully')).toBeVisible();
    await expect(otpBox.locator('.attendance-otp-countdown')).toBeVisible();

    // 5. Assert the button is now on cooldown
    await expect(generateBtn).toContainText('Generate OTP (');
  });

  test('Employee/Admin can open the Mark Attendance modal', async ({ page }) => {
    // 1. Click "Mark Attendance" at the top right of the page
    await page.getByRole('button', { name: 'Mark Attendance', exact: true }).click();

    // 2. Assert the Mark Attendance Modal opened
    const markModal = page.locator('.attendance-mark-modal');
    await expect(markModal).toBeVisible();
    await expect(markModal.getByRole('heading', { name: 'Mark Attendance' })).toBeVisible();

    // 3. Verify the OTP input field is there
    await expect(markModal.locator('.attendance-otp-input')).toBeVisible();

    // 4. Cancel the modal
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(markModal).toBeHidden();
  });

});