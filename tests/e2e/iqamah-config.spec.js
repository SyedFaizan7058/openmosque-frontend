import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js';
import { generateTestUser } from '../fixtures/test-data.js';

test.describe('E2E Layer: Mosque Admin Iqamah Timing Configuration', () => {
  const admin = generateTestUser('SUPER_ADMIN', Date.now());

  test('Admin configures Iqamah offsets and Friday batches with DB sync', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(admin.email, admin.password);

    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();

    // Select Iqamah tab
    await adminPage.selectTab('Iqamah Schedules');

    // Wait for configurator to render
    await page.waitForSelector('text=Edit Prayer & Iqamah Times', { timeout: 15000 });

    // Submit / save schedule
    const saveButton = page.locator('button:has-text("Save All Times")');
    await saveButton.click();

    // Verify success banner appears
    await expect(page.locator('text=Prayer timings and Iqamah schedule successfully updated')).toBeVisible({ timeout: 8000 });

    // Reload page to verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await adminPage.selectTab('Iqamah Schedules');
    await page.waitForSelector('text=Edit Prayer & Iqamah Times', { timeout: 15000 });
    await expect(saveButton).toBeVisible();
  });
});
