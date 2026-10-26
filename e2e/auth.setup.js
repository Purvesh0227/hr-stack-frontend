import { test as setup, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD. Copy .env.test.example to .env.test and fill it in.'
    );
  }

  await page.goto('login');

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  const [response] = await Promise.all([
    page.waitForResponse(res => res.url().includes('/employee/login')),
    page.getByRole('button', { name: 'Sign in', exact: true }).click(),
  ]);

  if (!response.ok()) {
    const body = await response.json();
    throw new Error(`Backend rejected login: ${response.status()} - ${JSON.stringify(body)}`);
  }

  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  await page.context().storageState({ path: authFile });
});