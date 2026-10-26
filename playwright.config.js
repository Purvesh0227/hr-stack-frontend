// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173/hr-stack-frontend/',
    trace: 'on-first-retry',
    navigationTimeout: 60000, 
    ignoreHTTPSErrors: true,
  },

  projects: [
    { 
      name: 'setup', 
      testMatch: /.*\.setup\.js/ 
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/hr-stack-frontend/',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});