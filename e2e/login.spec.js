import { test, expect } from '@playwright/test';

test.describe('Module 1: Login Flow', () => {

  // Start each test logged out
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
  
    await page.goto('login', { waitUntil: 'domcontentloaded' });
  });

  test('shows error toast on invalid credentials', async ({ page }) => {
    await page.locator('input[type="email"]').fill('purvesh0207@gmail.com');
    await page.locator('input[type="password"]').fill('WrongPassword123');
    
    // 1. Set up a promise to wait for the backend to reject the login
    const responsePromise = page.waitForResponse(
      res => res.url().includes('/employee/login') && res.status() === 400
    );

    // 2. Click and wait for the backend response simultaneously
    await Promise.all([
      responsePromise,
      page.getByRole('button', { name: 'Sign in', exact: true }).click()
    ]);

    // 3. NOW check the UI (React has finished updating)
    const errorToast = page.locator('.notification-error');
    await expect(errorToast).toBeVisible();
    await expect(errorToast).toContainText(/Invalid email or password/i);
    
    // 4. Ensure we are still on login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('blocks submit if fields are empty', async ({ page }) => {
    // Use force: true so Playwright bypasses its own "is this clickable" check
    await page.getByRole('button', { name: 'Sign in', exact: true }).click({ force: true });

    await expect(page).toHaveURL(/.*\/login/);
    
    // Verify HTML5 native validation blocked it
    const emailInput = page.locator('input[type="email"]');
    const isValid = await emailInput.evaluate((el) => el.checkValidity());
    expect(isValid).toBe(false);
  });

  test('successfully logs in and redirects to dashboard', async ({ page }) => {
    await page.locator('input[type="email"]').fill('purvesh0207@gmail.com');
    await page.locator('input[type="password"]').fill('Admin@123');
    
    // 1. Set up a promise to wait for the backend to ACCEPT the login
    const responsePromise = page.waitForResponse(
      res => res.url().includes('/employee/login') && res.status() === 200
    );

    // 2. Click and wait for the backend response
    await Promise.all([
      responsePromise,
      page.getByRole('button', { name: 'Sign in', exact: true }).click()
    ]);

    await expect(page.getByRole('heading', { name: /welcome, purvesh/i })).toBeVisible({ timeout: 10000 });
    
    // 4. Verify token is saved
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).not.toBeNull();
  });

});