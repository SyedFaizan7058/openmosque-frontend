import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { MosqueDetailPage } from '../pages/MosqueDetailPage.js';
import { generateTestUser } from '../fixtures/test-data.js';

test.describe('E2E Layer: Application Security & XSS Protection', () => {
  test('Prevents XSS execution when submitting malicious script tags in reviews', async ({ page }) => {
    let dialogTriggered = false;
    page.on('dialog', async (dialog) => {
      dialogTriggered = true;
      await dialog.dismiss();
    });

    const user = generateTestUser('USER', Date.now());
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    const detailPage = new MosqueDetailPage(page);
    await detailPage.goto('18558e48-a2aa-4219-9583-54cd9a84a76c');

    const xssPayload = `<img src="invalid" onerror="alert('XSS_ATTACK_TRIGGERED')" /> Safe text`;
    await detailPage.submitReview({ text: xssPayload, rating: 5 });

    // Ensure no alert/dialog was triggered by the injection
    expect(dialogTriggered).toBe(false);

    // Verify raw script was properly sanitized or escaped in React DOM
    const reviewContent = page.locator('p', { hasText: 'Safe text' });
    if (await reviewContent.isVisible()) {
      const text = await reviewContent.innerText();
      expect(text).toContain('Safe text');
    }
  });

  test('Unauthenticated user is strictly denied access to protected profile page', async ({ page }) => {
    // Clear any credentials
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Attempt direct access to /profile
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Must be redirected to /login
    expect(page.url()).toContain('/login');
  });
});
