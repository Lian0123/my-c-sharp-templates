import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', timeout: 90_000, expect: { timeout: 20_000 }, fullyParallel: false,
  workers: 1, retries: 0,
  reporter: [['list'], ['html', { outputFolder: '../../artifacts/playwright', open: 'never' }], ['junit', { outputFile: '../../artifacts/playwright/results.xml' }]],
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:8080', timezoneId: 'Asia/Taipei', trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
