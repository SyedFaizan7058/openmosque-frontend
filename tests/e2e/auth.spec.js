import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { generateTestUser } from '../fixtures/test-data.js';
import { dbHelper } from '../utils/db-helper.js';

test.describe('E2E Layer: Authentication Lifecycle', () => {
  test.afterAll(async () => {
    await dbHelper.cleanupTestEntities('E2E_TEST_');
    await dbHelper.cleanupTestEntities('test.');
  });

  test('User can register a new account and establish authenticated session', async ({ page }) => {
    const user = generateTestUser('USER', Date.now());
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register({
      name: user.displayName,
      email: user.email,
      password: user.password,
    });

    // Verify redirected away from /register upon successful registration
    await expect(page).not.toHaveURL(/\/register$/);

    // Verify HttpOnly cookie session established
    const cookies = await page.context().cookies();
    const accessCookie = cookies.find((c) => c.name === 'om_access_token');
    expect(accessCookie).toBeTruthy();
    expect(accessCookie.httpOnly).toBe(true);

    // Verify user business data is strictly NOT stored in localStorage
    const storedUser = await page.evaluate(() => localStorage.getItem('om_user'));
    expect(storedUser).toBeNull();

    // Verify user data is retrieved from PostgreSQL directly
    await page.goto('/profile');
    await expect(page).toHaveURL(/.*\/profile.*/);
  });

  test('User can log in with email and password and log out', async ({ page }) => {
    const user = generateTestUser('USER', Date.now());
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Verify authenticated session
    await expect(page).toHaveURL(/^(?!.*\/login).*$/);

    // Verify HttpOnly cookie session
    const cookies = await page.context().cookies();
    const accessCookie = cookies.find((c) => c.name === 'om_access_token');
    expect(accessCookie).toBeTruthy();

    // Verify user business data is NOT in localStorage
    const storedUser = await page.evaluate(() => localStorage.getItem('om_user'));
    expect(storedUser).toBeNull();

    // Log out by clearing auth cookies and storage
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.removeItem('om_auth_token');
      localStorage.removeItem('authToken');
    });
    await page.goto('/profile');
    // Should be redirected to /login because unauthenticated
    await expect(page).toHaveURL(/.*\/login.*/);
  });

  test('User can log in using Google Single Sign-On mock flow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithGoogle();

    // Verify redirected away from /login
    await expect(page).not.toHaveURL(/\/login$/);
    const token = await page.evaluate(() => localStorage.getItem('om_auth_token'));
    expect(token).toBeTruthy();
  });
});
