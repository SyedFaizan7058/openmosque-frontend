import { test, expect } from '@playwright/test';
import { apiClient } from '../utils/api-client.js';
import { dbHelper } from '../utils/db-helper.js';
import { generateTestMosque, generateTestUser } from '../fixtures/test-data.js';

test.describe('API Layer: Iqamah Schedule Configuration & DB Persistence', () => {
  const timestamp = Date.now();
  const testMosque = generateTestMosque(timestamp);
  const user = generateTestUser('USER', timestamp);
  const admin = generateTestUser('SUPER_ADMIN', timestamp + 1);

  let mosqueId = null;

  test.beforeAll(async () => {
    // 1. Submit and approve mosque
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
      facilityCodes: ['PARKING'],
    }, user.token);

    const subId = subRes.data.id;
    await apiClient.patch(`/admin/moderation/submissions/${subId}/decision`, {
      status: 'APPROVED',
      reviewComments: 'Iqamah API test fixture approval',
    }, admin.token);

    const dbMosque = await dbHelper.findMosqueByName(testMosque.name);
    expect(dbMosque).not.toBeNull();
    mosqueId = dbMosque.id;
  });

  test.afterAll(async () => {
    await dbHelper.cleanupTestEntities('E2E_TEST_');
  });

  test('PUT /mosque-admin/mosques/{id}/iqamah-schedule updates timings and persists to PostgreSQL', async () => {
    const updatePayload = {
      fajrType: 'OFFSET_AFTER_ADHAN',
      fajrOffsetMinutes: 25,
      fajrFixedTime: null,
      dhuhrType: 'FIXED_TIME',
      dhuhrOffsetMinutes: 15,
      dhuhrFixedTime: '13:45:00',
      asrType: 'OFFSET_AFTER_ADHAN',
      asrOffsetMinutes: 20,
      asrFixedTime: null,
      maghribType: 'OFFSET_AFTER_ADHAN',
      maghribOffsetMinutes: 0,
      maghribFixedTime: null,
      ishaType: 'OFFSET_AFTER_ADHAN',
      ishaOffsetMinutes: 15,
      ishaFixedTime: null,
      jummah1Time: '13:30:00',
      jummah2Time: '14:15:00',
      jummahKhutbahLanguage: 'Arabic & English',
    };

    const res = await apiClient.put(
      `/mosque-admin/mosques/${mosqueId}/iqamah-schedule`,
      updatePayload,
      admin.token
    );
    expect(res.status).toBe(200);

    // Direct PostgreSQL Verification
    const dbSchedule = await dbHelper.findIqamahSchedule(mosqueId);
    expect(dbSchedule).not.toBeNull();
    expect(dbSchedule.fajr_offset_minutes).toBe(25);
    expect(dbSchedule.dhuhr_type).toBe('FIXED_TIME');
    expect(dbSchedule.dhuhr_fixed_time).toBe('13:45:00');
    expect(dbSchedule.jummah_1_time).toBe('13:30:00');
    expect(dbSchedule.jummah_khutbah_language).toBe('Arabic & English');

    // Verify GET endpoint returns the newly saved schedule
    const getRes = await apiClient.get(
      `/mosque-admin/mosques/${mosqueId}/iqamah-schedule`,
      admin.token
    );
    expect(getRes.status).toBe(200);
    expect(getRes.data.fajrOffsetMinutes).toBe(25);
    expect(getRes.data.dhuhrFixedTime).toContain('13:45');
    expect(getRes.data.jummahKhutbahLanguage).toBe('Arabic & English');
  });
});
