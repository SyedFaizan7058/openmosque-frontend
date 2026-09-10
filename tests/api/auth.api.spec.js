import { test, expect } from '@playwright/test';
import { apiClient } from '../utils/api-client.js';
import { dbHelper } from '../utils/db-helper.js';
import { generateTestUser } from '../fixtures/test-data.js';

test.describe('API Layer: Authentication & Authorization (RBAC)', () => {
  const normalUser = generateTestUser('USER', Date.now());
  const adminUser = generateTestUser('SUPER_ADMIN', Date.now() + 1);

  test.afterAll(async () => {
    await dbHelper.cleanupTestEntities('E2E_TEST_');
    await dbHelper.cleanupTestEntities('test.');
  });

  test('POST /users/sync creates or updates user in PostgreSQL database', async () => {
    const syncUser = generateTestUser('USER', Date.now() + 100);
    const syncPayload = {
      firebaseUid: syncUser.token,
      email: syncUser.email,
      displayName: syncUser.displayName,
      photoUrl: 'https://example.com/avatar.jpg',
    };

    const res = await apiClient.post('/users/sync', syncPayload);
    expect(res.status).toBe(200);

    // Direct PostgreSQL Verification
    const dbUser = await dbHelper.findUserByEmail(syncUser.email);
    expect(dbUser).not.toBeNull();
    expect(dbUser.email).toBe(syncUser.email);
    expect(dbUser.display_name).toBe(syncUser.displayName);
  });

  test('GET /users/me returns authenticated profile from PostgreSQL', async () => {
    const res = await apiClient.get('/users/me', normalUser.token);
    expect(res.status).toBe(200);
    expect(res.data.email).toBe(normalUser.email);
  });

  test('RBAC: Normal USER is forbidden (401/403) from accessing admin moderation queue', async () => {
    const res = await apiClient.get('/admin/moderation/submissions', normalUser.token);
    expect([401, 403]).toContain(res.status);
  });

  test('RBAC: Unauthenticated request (no token) receives 401/403 on protected endpoints', async () => {
    const res = await apiClient.get('/admin/moderation/submissions');
    expect([401, 403]).toContain(res.status);
  });

  test('RBAC: SUPER_ADMIN is authorized (200) to access admin moderation queue', async () => {
    const res = await apiClient.get('/admin/moderation/submissions', adminUser.token);
    expect(res.status).toBe(200);
  });
});
