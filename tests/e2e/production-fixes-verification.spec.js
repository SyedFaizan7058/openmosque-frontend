import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8080/api/v1';

test.describe('Production Fixes & Live Updates Verification', () => {

  test('1. Review Edit and Delete (CRUD in PostgreSQL)', async ({ request }) => {
    const timestamp = Date.now();
    const testUserToken = `mock-user-${timestamp}`;

    // 1. Get mosque list
    const mosquesRes = await request.get(`${API_URL}/mosques`);
    expect(mosquesRes.ok()).toBeTruthy();
    const json = await mosquesRes.json();
    const mosques = json.data?.content || json.data || json;
    const mosque = mosques[0];
    expect(mosque).toBeDefined();

    // 2. Post a review
    const postRes = await request.post(`${API_URL}/mosques/${mosque.id}/reviews`, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        ratingOverall: 4,
        ratingCleanliness: 5,
        ratingFacilities: 4,
        ratingWomensArea: 5,
        ratingParking: 4,
        reviewText: `Initial automated review ${timestamp} for testing CRUD`
      }
    });
    expect([200, 201]).toContain(postRes.status());
    const postJson = await postRes.json();
    const createdReview = postJson.data || postJson;
    expect(createdReview.id).toBeDefined();

    // 3. Edit review (PUT /mosques/{mosqueId}/reviews/{reviewId})
    const editRes = await request.put(`${API_URL}/mosques/${mosque.id}/reviews/${createdReview.id}`, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        ratingOverall: 5,
        ratingCleanliness: 5,
        ratingFacilities: 5,
        ratingWomensArea: 5,
        ratingParking: 5,
        reviewText: `Updated review content ${timestamp} persisted in database`
      }
    });
    expect(editRes.ok()).toBeTruthy();
    const editJson = await editRes.json();
    const updatedReview = editJson.data || editJson;
    expect(updatedReview.ratingOverall).toBe(5);
    expect(updatedReview.reviewText).toBe(`Updated review content ${timestamp} persisted in database`);

    // 4. Delete review (DELETE /mosques/{mosqueId}/reviews/{reviewId})
    const deleteRes = await request.delete(`${API_URL}/mosques/${mosque.id}/reviews/${createdReview.id}`, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`
      }
    });
    expect([200, 204]).toContain(deleteRes.status());
  });

  test('2. Amiri Masjid coordinates & details verified in PostgreSQL', async ({ request }) => {
    const res = await request.get(`${API_URL}/mosques/search?query=Amiri`);
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    const list = json.data?.content || json.data || json;
    const amiri = list.find(m => m.name.toLowerCase().includes('amiri'));
    expect(amiri).toBeDefined();
    expect(amiri.latitude).toBeCloseTo(18.3942, 2);
    expect(amiri.longitude).toBeCloseTo(77.1175, 2);
    expect(amiri.city.toLowerCase()).toBe('udgir');
  });

  test('3. Backend RBAC: User profile returns claimedMosqueIds', async ({ request }) => {
    const res = await request.get(`${API_URL}/users/me`, {
      headers: {
        'Authorization': 'Bearer mock-user-contributor'
      }
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    const user = json.data || json;
    expect(Array.isArray(user.claimedMosqueIds)).toBeTruthy();
  });

  test('4. Backend RBAC: Unauthorized user or unapproved admin cannot edit mosque prayer config', async ({ request }) => {
    const mosquesRes = await request.get(`${API_URL}/mosques`);
    const json = await mosquesRes.json();
    const mosques = json.data?.content || json.data || json;
    const mosque = mosques[0];

    const putRes = await request.put(`${API_URL}/mosque-admin/mosques/${mosque.id}/prayer-config`, {
      headers: {
        'Authorization': 'Bearer mock-user-contributor',
        'Content-Type': 'application/json'
      },
      data: {
        calculationMethod: 'ISNA',
        juristicSchool: 'HANAFI',
        fajrAngle: 15.0,
        ishaAngle: 15.0
      }
    });
    // Forbidden because user role is USER (or not approved claim for this mosque)
    expect(putRes.status()).toBe(403);
  });

  test('5. UI: Directory loads without hardcoded city filters and displays mosques', async ({ page }) => {
    await page.goto(`${BASE_URL}/directory`);
    await expect(page.locator('text=Popular:')).toHaveCount(0);
    const cards = page.locator('.grid a[href^="/mosques/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('6. UI: Suggest Edit triggers Google Sign-In prompt modal for unauthenticated user', async ({ page }) => {
    await page.goto(`${BASE_URL}/mosques/amiri-masjid-udgir`);
    // Close location modal if prompted
    const closeLocationModalBtn = page.locator('button[aria-label="Close"], button:has-text("Skip"), button:has-text("Cancel")');
    if (await closeLocationModalBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeLocationModalBtn.first().click();
    }

    const suggestBtn = page.locator('button:has-text("Suggest an Edit")');
    await expect(suggestBtn).toBeVisible({ timeout: 10000 });
    await suggestBtn.click({ force: true });

    await expect(page.locator('text=Sign In to Suggest Corrections')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
  });

  test('7. UI: Route navigation scrolls to top (0,0)', async ({ page }) => {
    await page.goto(`${BASE_URL}/directory`);
    await page.waitForSelector('.grid a[href^="/mosques/"]');
    await page.evaluate(() => window.scrollTo(0, 800));
    const scrollPosBefore = await page.evaluate(() => window.scrollY);
    expect(scrollPosBefore).toBeGreaterThan(50);

    const firstCard = page.locator('.grid a[href^="/mosques/"]').first();
    await firstCard.click();
    await page.waitForURL(/\/mosques\/.+/);
    await page.waitForTimeout(300);

    const scrollPosAfter = await page.evaluate(() => window.scrollY);
    expect(scrollPosAfter).toBe(0);
  });

  test('8. UI: Mosque Management Controls and Admin Actions are ONLY visible to that mosque\'s approved admin', async ({ page }) => {
    // 1. Unauthenticated visitor: Controls must NOT appear
    await page.goto(`${BASE_URL}/mosques/amiri-masjid-udgir`);
    await page.waitForTimeout(1000);

    await expect(page.locator('text=Mosque Management Controls')).toHaveCount(0);
    await expect(page.locator('button:has-text("Schedule Khutbah")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Add Program")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Edit Mosque Info (Admin)")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Claim Mosque (Imam / Committee)")')).toBeVisible({ timeout: 10000 });

    // 2. Logged-in as a Mosque Admin for a DIFFERENT mosque
    await page.route('**/api/v1/users/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'user-diff-admin',
            email: 'otheradmin@example.com',
            role: 'MOSQUE_ADMIN',
            claimedMosqueIds: ['99999999-9999-9999-9999-999999999999']
          }
        })
      });
    });

    await page.evaluate(() => {
      localStorage.setItem('om_auth_token', 'mock-token-diff-admin');
    });
    await page.reload();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=Mosque Management Controls')).toHaveCount(0);
    await expect(page.locator('button:has-text("Schedule Khutbah")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Add Program")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Edit Mosque Info (Admin)")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Claim Mosque (Imam / Committee)")')).toBeVisible();

    // 3. Logged-in as the approved Mosque Admin for THIS mosque
    await page.route('**/api/v1/users/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'user-this-admin',
            email: 'amiriadmin@example.com',
            role: 'MOSQUE_ADMIN',
            claimedMosqueIds: ['amiri-masjid-udgir']
          }
        })
      });
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Now Mosque Management Controls and Admin Edit button MUST be visible!
    await expect(page.locator('text=Mosque Management Controls')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Schedule Khutbah")')).toBeVisible();
    await expect(page.locator('button:has-text("Add Program")')).toBeVisible();
    await expect(page.locator('button:has-text("Edit Mosque Info (Admin)")')).toBeVisible();
    // And Claim button must be hidden since user is already admin of this mosque
    await expect(page.locator('button:has-text("Claim Mosque (Imam / Committee)")')).toHaveCount(0);
  });
});
