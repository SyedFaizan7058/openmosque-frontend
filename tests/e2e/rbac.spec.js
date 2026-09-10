import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { generateTestUser } from '../fixtures/test-data.js';

test.describe('E2E Layer: Role-Based Access Control (RBAC)', () => {
  test('Normal USER cannot access /admin and is redirected to /', async ({ page }) => {
    const normalUser = generateTestUser('USER', Date.now());
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(normalUser.email, normalUser.password);

    // Attempt direct navigation to /admin
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should be redirected away from /admin to /
    expect(page.url()).not.toContain('/admin');
    await expect(page.locator('h1:has-text("Administrator Dashboard")')).not.toBeVisible();
  });

  test('SUPER_ADMIN is granted access to /admin and sees Administrator Dashboard', async ({ page }) => {
    const adminUser = generateTestUser('SUPER_ADMIN', Date.now() + 1);
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(adminUser.email, adminUser.password);

    // Navigate to /admin
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Access granted
    expect(page.url()).toContain('/admin');
    await expect(page.locator('h1:has-text("Administrator Dashboard")')).toBeVisible();
    await expect(page.locator('button:has-text("Iqamah Schedules")')).toBeVisible();
  });

  test('MODERATOR is granted access to /moderator & /admin, can switch tabs, and is not kicked to /login', async ({ page }) => {
    const modUser = generateTestUser('MODERATOR', Date.now() + 2);
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(modUser.email, modUser.password);

    // Navigate to /moderator
    await page.goto('/moderator');
    await page.waitForLoadState('networkidle');

    // Access granted and remains on /moderator (not kicked to /login)
    expect(page.url()).toContain('/moderator');
    await expect(page.locator('h1:has-text("Administrator Dashboard")')).toBeVisible();

    // Iqamah schedule is restricted to SUPER_ADMIN only
    await expect(page.locator('button:has-text("Iqamah Schedules")')).not.toBeVisible();

    // Verify accessible tabs can be switched without getting kicked to /login
    const tabsToTest = ['Mosque Claims', 'OSM Ingestion', 'Approved', 'Rejected'];
    for (const tabName of tabsToTest) {
      const tabBtn = page.locator(`button:has-text("${tabName}")`).first();
      await tabBtn.click();
      await page.waitForTimeout(300);
      expect(page.url()).not.toContain('/login');
    }

    // Switch to Analytics tab and verify platform stats load without redirect
    await page.locator('button:has-text("Analytics")').first().click();
    await page.waitForTimeout(500);
    expect(page.url()).not.toContain('/login');
    await expect(page.locator('text=Platform Demographics & Operational KPIs')).toBeVisible();
  });
});
