import { test, expect } from '@playwright/test';
import { apiClient } from '../utils/api-client.js';
import { dbHelper } from '../utils/db-helper.js';
import { generateTestMosque, generateTestUser, generateTestReview, generateTestQuestion } from '../fixtures/test-data.js';

test.describe('API Layer: Community Features, Reviews, Ratings, and Q&A', () => {
  const timestamp = Date.now();
  const testMosque = generateTestMosque(timestamp);
  const user = generateTestUser('USER', timestamp);
  const admin = generateTestUser('SUPER_ADMIN', timestamp + 1);

  let mosqueId = null;
  let questionId = null;

  test.beforeAll(async () => {
    // 1. Submit and approve mosque for testing community features
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
      facilityCodes: ['WUDU_AREA'],
    }, user.token);

    const subId = subRes.data.id;
    await apiClient.patch(`/admin/moderation/submissions/${subId}/decision`, {
      status: 'APPROVED',
      reviewComments: 'Community API test fixture approval',
    }, admin.token);

    const dbMosque = await dbHelper.findMosqueByName(testMosque.name);
    expect(dbMosque).not.toBeNull();
    mosqueId = dbMosque.id;
  });

  test.afterAll(async () => {
    await dbHelper.cleanupTestEntities('E2E_TEST_');
  });

  test('POST /mosques/{id}/reviews persists review and recalculates rating in PostgreSQL', async () => {
    const reviewData = {
      ratingOverall: 5,
      ratingCleanliness: 5,
      ratingFacilities: 5,
      ratingWomensArea: 5,
      ratingParking: 4,
      reviewText: 'Exceptional facilities and very clean wudhu area.',
    };

    const res = await apiClient.post(`/mosques/${mosqueId}/reviews`, reviewData, user.token);
    expect([200, 201]).toContain(res.status);

    // Direct PostgreSQL Verification
    const dbReviews = await dbHelper.findReviewsByMosqueId(mosqueId);
    expect(dbReviews.length).toBeGreaterThan(0);
    expect(dbReviews[0].rating_overall).toBe(5);
    expect(dbReviews[0].review_text).toContain('Exceptional facilities');

    // Verify rating summary endpoint
    const ratingRes = await apiClient.get(`/mosques/${mosqueId}/ratings`);
    expect(ratingRes.status).toBe(200);
    expect(ratingRes.data.averageOverall).toBe(5.0);
  });

  test('POST /mosques/{id}/questions saves inquiry to PostgreSQL', async () => {
    const questionData = {
      questionText: 'Is there a wheelchair accessible ramp at the sisters entrance?',
    };

    const res = await apiClient.post(`/mosques/${mosqueId}/questions`, questionData, user.token);
    expect([200, 201]).toContain(res.status);
    questionId = res.data.id;

    // Direct PostgreSQL Verification
    const dbQuestions = await dbHelper.findQuestionsByMosqueId(mosqueId);
    expect(dbQuestions.length).toBeGreaterThan(0);
    expect(dbQuestions[0].question_text).toContain('wheelchair accessible ramp');
  });

  test('POST /community/questions/{questionId}/answers records reply in PostgreSQL', async () => {
    expect(questionId).toBeDefined();

    const answerData = {
      answerText: 'Yes, the ramp is located on the East gate with dedicated parking.',
    };

    const res = await apiClient.post(
      `/community/questions/${questionId}/answers`,
      answerData,
      admin.token
    );
    expect([200, 201]).toContain(res.status);

    // Direct PostgreSQL Verification of answers
    const dbAnswersRes = await dbHelper.query(
      `SELECT id, question_id, answer_text, is_official_mosque_admin FROM mosque_answers WHERE question_id = $1`,
      [questionId]
    );
    expect(dbAnswersRes.rows.length).toBeGreaterThan(0);
    expect(dbAnswersRes.rows[0].answer_text).toContain('ramp is located on the East gate');
    expect(dbAnswersRes.rows[0].is_official_mosque_admin).toBe(true);
  });
});
