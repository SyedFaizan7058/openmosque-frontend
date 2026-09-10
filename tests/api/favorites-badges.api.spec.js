import { test, expect } from '@playwright/test';
import { apiClient } from '../utils/api-client.js';
import { dbHelper } from '../utils/db-helper.js';

test.describe('API Layer: Mosque Favorites, Badges & Rate Limiting (PostgreSQL Persistence)', () => {
  const testUser = {
    email: 'user-favorites-tester@openmosque.org',
    displayName: 'Favorites E2E Tester',
    token: 'mock-user-favorites-tester',
    role: 'USER',
  };
  let liveMosques = [];
  let dbUser = null;

  test.beforeAll(async () => {
    // 1. Fetch real mosques from DB
    const res = await dbHelper.query(
      `SELECT id, name, slug FROM mosques WHERE is_deleted = false ORDER BY created_at ASC LIMIT 10`
    );
    liveMosques = res.rows;
    expect(liveMosques.length).toBeGreaterThanOrEqual(5);

    // 2. Trigger user creation by calling me endpoint
    const meRes = await apiClient.get('/users/me', testUser.token);
    expect([200, 201]).toContain(meRes.status);

    // 3. Find created user in DB
    dbUser = await dbHelper.findUserByEmail(testUser.email);
    expect(dbUser).toBeDefined();

    // Clean any prior test favorites for this user
    await dbHelper.query('DELETE FROM user_favorite_mosques WHERE user_id = $1', [dbUser.id]);
    await dbHelper.query('DELETE FROM user_badges WHERE user_id = $1', [dbUser.id]);
  });

  test.afterAll(async () => {
    if (dbUser) {
      await dbHelper.query('DELETE FROM user_favorite_mosques WHERE user_id = $1', [dbUser.id]);
      await dbHelper.query('DELETE FROM user_badges WHERE user_id = $1', [dbUser.id]);
      await dbHelper.query('DELETE FROM users WHERE id = $1', [dbUser.id]);
    }
  });

  test('Public badges endpoint returns 6 badges with Rate Limiting headers', async () => {
    const res = await apiClient.get('/badges');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThanOrEqual(6);

    // Verify rate limit headers
    expect(res.headers).toBeDefined();
    expect(res.headers['x-ratelimit-limit']).toBeDefined();
    expect(res.headers['x-ratelimit-remaining']).toBeDefined();
    const limit = parseInt(res.headers['x-ratelimit-limit'], 10);
    expect(limit).toBeGreaterThanOrEqual(100);
  });

  test('POST /users/me/favorites/{id} saves favorite in PostgreSQL and awards DEVOTED_PATRON badge', async () => {
    const mosqueToFavorite = liveMosques[0];
    const favRes = await apiClient.post(`/users/me/favorites/${mosqueToFavorite.id}`, {}, testUser.token);
    expect(favRes.status).toBe(200);
    expect(favRes.data.favorite).toBe(true);
    expect(favRes.data.mosqueId).toBe(mosqueToFavorite.id);

    // 1. Direct PostgreSQL Verification in user_favorite_mosques
    const favsInDb = await dbHelper.findUserFavorites(dbUser.id);
    expect(favsInDb.length).toBe(1);
    expect(favsInDb[0].mosque_id).toBe(mosqueToFavorite.id);

    // 2. Direct PostgreSQL Verification in user_badges (DEVOTED_PATRON awarded)
    const badgesInDb = await dbHelper.findUserBadges(dbUser.id);
    const devotedBadge = badgesInDb.find(b => b.code === 'DEVOTED_PATRON');
    expect(devotedBadge).toBeDefined();
    expect(devotedBadge.name).toBe('Devoted Patron');
  });

  test('GET /users/me/favorites returns the favorited mosque with metadata', async () => {
    const res = await apiClient.get('/users/me/favorites', testUser.token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBe(1);
    expect(res.data[0].mosqueId).toBe(liveMosques[0].id);
    expect(res.data[0].name).toBeDefined();
  });

  test('GET /mosques/{id}/favorite returns status favorite: true', async () => {
    const res = await apiClient.get(`/mosques/${liveMosques[0].id}/favorite`, testUser.token);
    expect(res.status).toBe(200);
    expect(res.data.favorite).toBe(true);
  });

  test('Award MOSQUE_EXPLORER badge when user favorites 5 distinct mosques', async () => {
    // Favorite 4 more mosques to reach 5
    for (let i = 1; i < 5; i++) {
      const res = await apiClient.post(`/users/me/favorites/${liveMosques[i].id}`, {}, testUser.token);
      expect(res.status).toBe(200);
    }

    // Direct PostgreSQL Verification of 5 favorites
    const favsInDb = await dbHelper.findUserFavorites(dbUser.id);
    expect(favsInDb.length).toBe(5);

    // Direct PostgreSQL Verification of MOSQUE_EXPLORER badge
    const badgesInDb = await dbHelper.findUserBadges(dbUser.id);
    const explorerBadge = badgesInDb.find(b => b.code === 'MOSQUE_EXPLORER');
    expect(explorerBadge).toBeDefined();
    expect(explorerBadge.name).toBe('Mosque Explorer');
  });

  test('DELETE /users/me/favorites/{id} executes hard delete in PostgreSQL while preserving badges', async () => {
    const mosqueToRemove = liveMosques[0];
    const delRes = await apiClient.delete(`/users/me/favorites/${mosqueToRemove.id}`, testUser.token);
    expect(delRes.status).toBe(200);
    expect(delRes.data.favorite).toBe(false);

    // 1. Direct PostgreSQL Verification: 4 rows remaining (Hard Delete of 1 row)
    const favsInDb = await dbHelper.findUserFavorites(dbUser.id);
    expect(favsInDb.length).toBe(4);
    expect(favsInDb.some(f => f.mosque_id === mosqueToRemove.id)).toBe(false);

    // 2. Verification that badges are preserved
    const badgesInDb = await dbHelper.findUserBadges(dbUser.id);
    const devotedBadge = badgesInDb.find(b => b.code === 'DEVOTED_PATRON');
    const explorerBadge = badgesInDb.find(b => b.code === 'MOSQUE_EXPLORER');
    expect(devotedBadge).toBeDefined();
    expect(explorerBadge).toBeDefined();
  });
});
