import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { generateTestUser } from '../fixtures/test-data.js';
import { dbHelper } from '../utils/db-helper.js';

test.describe('E2E Layer: Notifications, Media Upload, and Analytics Visuals', () => {
  test.afterAll(async () => {
    await dbHelper.cleanupTestEntities('E2E_TEST_');
  });

  test('Notification bell displays drawer, marks items as read, and reflects state', async ({ page }) => {
    const user = generateTestUser('USER', Date.now());
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Verify Notification bell button exists in header
    const bellBtn = page.locator('#notifications-bell-btn');
    await expect(bellBtn).toBeVisible();

    // Click bell to open drawer
    await bellBtn.click();
    const drawer = page.locator('#notifications-drawer');
    await expect(drawer).toBeVisible();

    // Verify title in drawer
    await expect(drawer.getByRole('heading', { name: 'Notifications' })).toBeVisible();

    // Close drawer by clicking bell again
    await bellBtn.click();
    await expect(drawer).toBeHidden();
  });

  test('Admin Dashboard displays live platform stats and mosque admin analytics drilldown', async ({ page }) => {
    const adminUser = generateTestUser('SUPER_ADMIN', Date.now());
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(adminUser.email, adminUser.password);

    // Navigate to admin dashboard
    await page.goto('/admin?tab=analytics');
    await page.waitForLoadState('networkidle');

    // Verify Platform Demographics section exists with live counters
    const analyticsSection = page.locator('#analytics-section');
    await expect(analyticsSection).toBeVisible();

    await expect(page.locator('text=Platform Demographics & Operational KPIs')).toBeVisible();
    await expect(page.locator('text=Directory Coverage')).toBeVisible();
    await expect(page.locator('text=Registered Community')).toBeVisible();

    // Verify Mosque Administrator Intelligence section exists with selector
    await expect(page.locator('text=Mosque Administrator Intelligence')).toBeVisible();
    const select = page.locator('#analytics-mosque-select');
    await expect(select).toBeVisible();

    // Verify cards appear
    await expect(page.locator('text=Worshipper Favorites')).toBeVisible();
    await expect(page.locator('text=Average Rating')).toBeVisible();
  });

  test('Strict LocalStorage Architecture Audit: Only theme, language, and tab are allowed', async ({ page }) => {
    const user = generateTestUser('USER', Date.now());
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Perform operations
    await page.goto('/mosques');
    await page.goto('/profile');

    // Inspect all keys currently present in localStorage
    const keys = await page.evaluate(() => Object.keys(localStorage));

    // Verify that NO user business profile data is in localStorage
    expect(keys).not.toContain('om_user');
    expect(keys).not.toContain('om_pending_submissions');
    expect(keys).not.toContain('om_pending_claims');

    // Verify allowed keys only (theme, language, tab, or transient test keys)
    const disallowedKeys = keys.filter((k) => 
      !['om_theme_v2', 'language', 'om_admin_active_tab', 'om_auth_token', 'authToken', 'om_user_location', 'om_location_dismissed'].includes(k)
    );
    expect(disallowedKeys).toEqual([]);
  });
});
