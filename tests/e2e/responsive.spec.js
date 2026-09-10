import { test, expect } from '@playwright/test';

test.describe('E2E Layer: Mobile Responsiveness & Viewport Verification', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // Mobile iPhone / Android viewport

  test('Directory renders appropriately on mobile viewport without horizontal scrolling', async ({ page }) => {
    await page.goto('/mosques');
    await page.waitForLoadState('networkidle');

    // Verify search input is responsive and visible
    const searchInput = page.locator('input[placeholder*="Search by mosque name"]');
    await expect(searchInput).toBeVisible();

    // Verify no unintended horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('Mosque Detail page stacks cleanly on mobile viewport', async ({ page }) => {
    await page.goto('/mosques/18558e48-a2aa-4219-9583-54cd9a84a76c');
    await page.waitForLoadState('networkidle');

    // Verify mosque title and prayer timetable are visible and rendered
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Daily Prayer & Iqamah Times').first()).toBeVisible();

    // Verify no unintended horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });
});
