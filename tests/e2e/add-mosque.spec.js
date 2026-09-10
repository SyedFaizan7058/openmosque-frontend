import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { AddMosquePage } from '../pages/AddMosquePage.js';
import { generateTestMosque, generateTestUser } from '../fixtures/test-data.js';
import { dbHelper } from '../utils/db-helper.js';

test.describe('E2E Layer: Mosque Proposal Submission Flow', () => {
  const testMosque = generateTestMosque(Date.now());
  const user = generateTestUser('USER', Date.now());

  test.afterAll(async () => {
    await dbHelper.cleanupTestEntities('E2E_TEST_');
  });

  test('User completes 4-step wizard and proposal persists to PostgreSQL', async ({ page }) => {
    // Authenticate user
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    const addMosquePage = new AddMosquePage(page);
    await addMosquePage.goto();

    // Step 1: Basic Information
    await addMosquePage.fillBasicInfo({
      name: testMosque.name,
      address: testMosque.address,
      city: testMosque.city,
      country: testMosque.country,
      description: testMosque.description,
      phone: testMosque.phone,
      email: testMosque.email,
      website: testMosque.website,
    });

    // Step 2: Facilities
    await addMosquePage.selectFacilities(['Wudu Area', 'Parking']);

    // Step 3: Prayer Timings
    await addMosquePage.fillPrayerTimings();

    // Step 4: Submit for Review
    await addMosquePage.submitForm();

    // Verify UI confirmation banner
    await expect(page.locator('h1:has-text("Proposal Received")')).toBeVisible();

    // Direct PostgreSQL Verification: check mosque_submissions table
    const dbSubmission = await dbHelper.findMosqueSubmissionByName(testMosque.name);
    expect(dbSubmission).not.toBeNull();
    expect(dbSubmission.name).toBe(testMosque.name);
    expect(dbSubmission.status).toBe('PENDING');
  });
});
