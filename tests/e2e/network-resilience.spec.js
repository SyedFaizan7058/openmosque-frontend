import { test, expect } from '@playwright/test';

test.describe('E2E Layer: Network Resilience & Fault Injection', () => {
  test('Application gracefully handles 500 Internal Server Error without crashing', async ({ page }) => {
    // Intercept backend search API and inject 500 Internal Server Error
    await page.route('**/api/v1/mosques/search*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Simulated backend outage' },
        }),
      });
    });

    await page.goto('/mosques');
    await page.waitForLoadState('networkidle');

    // Verify application does not crash with a blank white page or unhandled React crash
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verify header, search bar, and UI structure remain intact
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search by mosque name"]')).toBeVisible();
  });

  test('Application handles network failure/offline mode safely', async ({ page }) => {
    // Abort all network calls to prayer times API
    await page.route('**/api/v1/mosques/*/prayer-times*', (route) => route.abort('failed'));

    await page.goto('/mosques/18558e48-a2aa-4219-9583-54cd9a84a76c');
    await page.waitForLoadState('networkidle');

    // Ensure Error Boundary did not break the entire page
    await expect(page.locator('h1')).toBeVisible();
  });
});
