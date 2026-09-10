import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080/api/v1';

test.describe('Backend End-to-End: Media, Notifications & Analytics', () => {
  const adminHeaders = {
    Authorization: 'Bearer mock-admin-token',
    'Content-Type': 'application/json',
  };

  const userHeaders = {
    Authorization: 'Bearer mock-contributor-token',
    'Content-Type': 'application/json',
  };

  test('1. Real media upload stores binary and serves statically', async ({ request }) => {
    const key = `test-run/test-image-${Date.now()}.png`;
    const dummyImageBytes = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);

    // Upload via PUT binary endpoint
    const uploadRes = await request.put(`${BASE_URL}/media/upload?key=${key}`, {
      headers: {
        'Content-Type': 'image/png',
      },
      data: dummyImageBytes,
    });
    expect(uploadRes.status()).toBe(200);
    const uploadJson = await uploadRes.json();
    expect(uploadJson.success).toBe(true);
    expect(uploadJson.data).toContain(`/media/files/${key}`);

    // Verify file is statically served by Spring MVC ResourceHandler
    const serveRes = await request.get(uploadJson.data);
    expect(serveRes.status()).toBe(200);
    expect(serveRes.headers()['content-type']).toContain('image/png');
    const servedBuffer = await serveRes.body();
    expect(servedBuffer.length).toBe(dummyImageBytes.length);
  });

  test('2. Iqamah schedule update triggers broadcast notification to favoriter', async ({ request }) => {
    // 1. Get first active mosque
    const listRes = await request.get(`${BASE_URL}/mosques?page=0&size=1`);
    expect(listRes.status()).toBe(200);
    const listJson = await listRes.json();
    const mosque = listJson.data.content[0];
    expect(mosque).toBeTruthy();

    // 2. User favorites the mosque
    const favRes = await request.post(`${BASE_URL}/users/me/favorites/${mosque.id}`, {
      headers: userHeaders,
    });
    expect(favRes.status()).toBe(200);

    // 3. Mosque Admin updates Iqamah congregation times
    const updateRes = await request.put(`${BASE_URL}/mosque-admin/mosques/${mosque.id}/iqamah-schedule`, {
      headers: adminHeaders,
      data: {
        fajrType: 'FIXED_TIME',
        fajrFixedTime: '05:50:00',
        dhuhrType: 'FIXED_TIME',
        dhuhrFixedTime: '13:30:00',
        asrType: 'FIXED_TIME',
        asrFixedTime: '17:20:00',
        maghribType: 'FIXED_TIME',
        maghribFixedTime: '19:42:00',
        ishaType: 'FIXED_TIME',
        ishaFixedTime: '21:15:00',
      },
    });
    expect(updateRes.status()).toBe(200);

    // 4. User queries notifications - must receive IQAMAH_CHANGE
    const notifsRes = await request.get(`${BASE_URL}/users/me/notifications`, {
      headers: userHeaders,
    });
    expect(notifsRes.status()).toBe(200);
    const notifsJson = await notifsRes.json();
    const iqamahNotif = notifsJson.data.content.find((n) => n.type === 'IQAMAH_CHANGE');
    expect(iqamahNotif).toBeTruthy();
    expect(iqamahNotif.title).toContain(mosque.name);

    // 5. User marks notification as read
    const patchRes = await request.patch(`${BASE_URL}/users/me/notifications/${iqamahNotif.id}/read`, {
      headers: userHeaders,
    });
    expect(patchRes.status()).toBe(200);
    const patchJson = await patchRes.json();
    expect(patchJson.data.read).toBe(true);
  });

  test('3. Admin stats and Actuator endpoints are healthy and active', async ({ request }) => {
    // Admin stats
    const statsRes = await request.get(`${BASE_URL}/admin/stats`, {
      headers: adminHeaders,
    });
    expect(statsRes.status()).toBe(200);
    const statsJson = await statsRes.json();
    expect(statsJson.data.totalMosques).toBeGreaterThan(0);
    expect(statsJson.data.totalUsers).toBeGreaterThan(0);

    // Actuator health
    const healthRes = await request.get('http://localhost:8080/actuator/health');
    const healthJson = await healthRes.json();
    expect(healthJson.components.db.status).toBe('UP');
    expect(healthJson.components.diskSpace.status).toBe('UP');
  });
});
