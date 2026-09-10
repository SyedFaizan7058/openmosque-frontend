import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { generateTestUser } from '../fixtures/test-data.js';

test.describe('Browser UI E2E: Mosque Favorites, Dynamic Badges & Profile Sync', () => {
  test.setTimeout(60000);
  const timestamp = Date.now();
  const testUser = generateTestUser('USER', timestamp);

  test('Worshipper favorites mosque -> Devoted Patron badge unlocks in profile -> Mosque appears in /favorites', async ({ page }) => {
    // 1. Log in via UI
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    // 2. Navigate to Directory to browse mosques
    await page.goto('/mosques');
    await page.waitForLoadState('networkidle');

    // 3. Locate the first MosqueCard and its favorite button
    const firstHeading = page.locator('main h3').first();
    await expect(firstHeading).toBeVisible({ timeout: 15000 });
    const mosqueTitle = await firstHeading.innerText();
    expect(mosqueTitle).toBeTruthy();

    const favButton = page.locator('button[aria-label*="favorite"]').first();
    await expect(favButton).toBeVisible();

    // 4. Click Favorite button
    await favButton.click();
    await page.waitForTimeout(1500);

    // Verify button state transitions to favorited (aria-label changed)
    await expect(favButton).toHaveAttribute('aria-label', /Remove from favorites/i, { timeout: 8000 });

    // 5. Navigate to /favorites page in the browser
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`h3:has-text("${mosqueTitle}")`)).toBeVisible({ timeout: 10000 });

    // 6. Navigate to /profile and check Badges tab
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Click "Badges & Achievements" tab
    const badgesTab = page.locator('button:has-text("Badges & Achievements")');
    await expect(badgesTab).toBeVisible();
    await badgesTab.click();

    // Verify DEVOTED_PATRON badge is rendered
    await expect(page.locator('text=Devoted Patron')).toBeVisible({ timeout: 10000 });

    // 7. Unfavorite from /favorites page
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    const unfavCard = page.locator(`a:has(h3:has-text("${mosqueTitle}"))`);
    const removeBtn = unfavCard.locator('button[aria-label*="favorite"]').first();
    await removeBtn.click();
    await page.waitForTimeout(1500);

    // Verify card is removed from favorites list
    await expect(page.locator(`h3:has-text("${mosqueTitle}")`)).not.toBeVisible({ timeout: 8000 });
  });
});
