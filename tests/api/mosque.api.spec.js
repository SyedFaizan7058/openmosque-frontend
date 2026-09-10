import { test, expect } from '@playwright/test';
import { apiClient } from '../utils/api-client.js';
import { dbHelper } from '../utils/db-helper.js';
import { generateTestMosque, generateTestUser } from '../fixtures/test-data.js';

test.describe('API Layer: Mosque Lifecycle & PostgreSQL Persistence', () => {
  const timestamp = Date.now();
  const testMosque = generateTestMosque(timestamp);
  const user = generateTestUser('USER', timestamp);
  const admin = generateTestUser('SUPER_ADMIN', timestamp + 1);
  let submissionId = null;

  test.afterAll(async () => {
    await dbHelper.cleanupTestEntities('E2E_TEST_');
  });

  test('POST /mosques/submissions queues proposal and saves in PostgreSQL', async () => {
    const payload = {
      name: testMosque.name,
      description: testMosque.description,
      address: testMosque.address,
      city: testMosque.city,
      country: testMosque.country,
      latitude: testMosque.latitude,
      longitude: testMosque.longitude,
      contactPhone: testMosque.phone,
      contactEmail: testMosque.email,
      websiteUrl: testMosque.website,
      facilityCodes: ['WUDU_AREA', 'WOMENS_SECTION', 'PARKING'],
    };

    const res = await apiClient.post('/mosques/submissions', payload, user.token);
    expect([200, 201]).toContain(res.status);
    expect(res.data).toBeDefined();
    submissionId = res.data.id;

    // Direct PostgreSQL Verification of mosque_submissions table
    const dbSubmission = await dbHelper.findMosqueSubmissionByName(testMosque.name);
    expect(dbSubmission).not.toBeNull();
    expect(dbSubmission.name).toBe(testMosque.name);
    expect(dbSubmission.status).toBe('PENDING');
  });

  test('PATCH /admin/moderation/submissions/{id}/decision promotes proposal to live mosque in PostgreSQL', async () => {
    expect(submissionId).toBeDefined();

    const decisionPayload = {
      status: 'APPROVED',
      reviewComments: 'Automated test suite approval: verified legitimate Islamic center.',
    };

    const res = await apiClient.patch(
      `/admin/moderation/submissions/${submissionId}/decision`,
      decisionPayload,
      admin.token
    );
    expect(res.status).toBe(200);

    // Direct PostgreSQL Verification 1: Submission status updated to APPROVED
    const dbSub = await dbHelper.findMosqueSubmissionByName(testMosque.name);
    expect(dbSub.status).toBe('APPROVED');

    // Direct PostgreSQL Verification 2: Active row inserted into mosques table
    const dbMosque = await dbHelper.findMosqueByName(testMosque.name);
    expect(dbMosque).not.toBeNull();
    expect(dbMosque.name).toBe(testMosque.name);
    expect(dbMosque.city).toBe(testMosque.city);
    expect(Number(dbMosque.latitude)).toBeCloseTo(testMosque.latitude, 3);
    expect(Number(dbMosque.longitude)).toBeCloseTo(testMosque.longitude, 3);
  });

  test('GET /mosques/search indexes and returns newly approved mosque', async () => {
    const res = await apiClient.get(`/mosques/search?q=${encodeURIComponent(testMosque.name)}`);
    expect(res.status).toBe(200);
    const content = res.data?.content || res.data || [];
    const found = content.find((m) => m.name === testMosque.name);
    expect(found).toBeDefined();
    expect(found.name).toBe(testMosque.name);
  });
});
