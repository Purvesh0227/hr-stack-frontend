import { test as setup, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('login');
  
  await page.locator('input[type="email"]').fill('purvesh0207@gmail.com');
  await page.locator('input[type="password"]').fill('Admin@123');
  
  // Wait for the API response at the same time as clicking the button
  const [response] = await Promise.all([
    page.waitForResponse(res => res.url().includes('/employee/login')),
    // ADD { exact: true } HERE
    page.getByRole('button', { name: 'Sign in', exact: true }).click()
  ]);

  if (!response.ok()) {
    const body = await response.json();
    throw new Error(`Backend rejected login: ${response.status()} - ${JSON.stringify(body)}`);
  }

  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  await page.context().storageState({ path: authFile });
});