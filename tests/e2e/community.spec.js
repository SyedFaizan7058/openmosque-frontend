import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { MosqueDetailPage } from '../pages/MosqueDetailPage.js';
import { generateTestMosque, generateTestUser, generateTestReview, generateTestQuestion } from '../fixtures/test-data.js';
import { apiClient } from '../utils/api-client.js';
import { dbHelper } from '../utils/db-helper.js';

test.describe('E2E Layer: Community Reviews, Ratings, and Q&A', () => {
  const timestamp = Date.now();
  const testMosque = generateTestMosque(timestamp);
  const user = generateTestUser('USER', timestamp);
  const admin = generateTestUser('SUPER_ADMIN', timestamp + 1);

  let mosqueId = null;

  test.beforeAll(async () => {
    // Submit and approve mosque for testing
    const subRes = await apiClient.post('/mosques/submissions', {
      name: testMosque.name,
      description: testMosque.description,
      address: testMosque.address,
      city: testMosque.city,
      country: testMosque.country,
      latitude: testMosque.latitude,
      longitude: testMosque.longitude,
      contactPhone: testMosque.phone,
      contactEmail: testMosque.email,
      facilityCodes: ['WUDU_AREA', 'PARKING'],
    }, user.token);

    const subId = subRes.data.id;
    await apiClient.patch(`/admin/moderation/submissions/${subId}/decision`, {
      status: 'APPROVED',
      reviewComments: 'Community E2E test setup',
    }, admin.token);

    const dbMosque = await dbHelper.findMosqueByName(testMosque.name);
    if (dbMosque) {
      mosqueId = dbMosque.id;
    }
  });

  test.afterAll(async () => {
    await dbHelper.cleanupTestEntities('E2E_TEST_');
  });

  test('Logged-in user can write a review and see it rendered in the feed', async ({ page }) => {
    // If no dynamic mosque ID was returned, use default first mosque
    const targetId = mosqueId || '18558e48-a2aa-4219-9583-54cd9a84a76c';

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    const detailPage = new MosqueDetailPage(page);
    await detailPage.goto(targetId);

    const reviewText = `MashaAllah excellent community atmosphere! (Test ${timestamp})`;
    await detailPage.submitReview({ text: reviewText, rating: 5 });

    // Assert review appears on page
    await expect(page.locator(`text=${reviewText}`)).toBeVisible();

    // Direct PostgreSQL Verification
    if (mosqueId) {
      const dbReviews = await dbHelper.findReviewsByMosqueId(mosqueId);
      expect(dbReviews.some(r => r.review_text.includes(reviewText))).toBe(true);
    }
  });

  test('Logged-in user can ask a community question and see it rendered', async ({ page }) => {
    const targetId = mosqueId || '18558e48-a2aa-4219-9583-54cd9a84a76c';

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    const detailPage = new MosqueDetailPage(page);
    await detailPage.goto(targetId);

    const questionText = `Are there wheelchair facilities available near the main gate? (${timestamp})`;
    await detailPage.submitQuestion(questionText);

    // Assert question appears in Q&A section
    await expect(page.locator(`text=${questionText}`)).toBeVisible();

    // Direct PostgreSQL Verification
    if (mosqueId) {
      const dbQuestions = await dbHelper.findQuestionsByMosqueId(mosqueId);
      expect(dbQuestions.some(q => q.question_text.includes(questionText))).toBe(true);
    }
  });
});
