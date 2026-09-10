import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { MosqueDetailPage } from '../pages/MosqueDetailPage.js';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js';
import { generateTestMosque, generateTestUser } from '../fixtures/test-data.js';
import { apiClient } from '../utils/api-client.js';
import { dbHelper } from '../utils/db-helper.js';

test.describe('E2E Layer: Mosque Claiming, Friday Khutbahs & Community Events', () => {
  const timestamp = Date.now();
  const testMosque = generateTestMosque(timestamp);
  const claimantUser = generateTestUser('USER', timestamp);
  const adminUser = generateTestUser('SUPER_ADMIN', timestamp + 1);

  let mosqueId = null;

  test.beforeAll(async () => {
    // 1. Submit and approve a test mosque so it exists live in PostgreSQL
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
    }, claimantUser.token);

    const sub = await dbHelper.findMosqueSubmissionByName(testMosque.name);
    if (sub) {
      await apiClient.patch(`/admin/moderation/submissions/${sub.id}/decision`, {
        status: 'APPROVED',
        reviewComments: 'Approved for community admin test',
      }, adminUser.token);
    }

    const liveMosque = await dbHelper.findMosqueByName(testMosque.name);
    expect(liveMosque).not.toBeNull();
    mosqueId = liveMosque.id;
  });

  test.afterAll(async () => {
    await dbHelper.cleanupTestEntities('E2E_TEST_');
    await dbHelper.cleanupTestEntities('user-');
    await dbHelper.cleanupTestEntities('admin-');
  });

  test('Claim Workflow: Committee member claims mosque, Super Admin approves, and user role upgrades in PostgreSQL', async ({ page }) => {
    // Step 1: Claimant logs in
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(claimantUser.email, claimantUser.password);

    // Step 2: Navigate to Mosque Detail page
    await page.goto(`/mosques/${mosqueId}`);
    await page.waitForLoadState('networkidle');

    // Step 3: Open Claim Modal
    const claimBtn = page.locator('button:has-text("Claim Mosque")');
    await expect(claimBtn).toBeVisible();
    await claimBtn.click();

    // Step 4: Fill and submit claim form
    await page.fill('#claim-fullname', 'Imam Farooq');
    await page.fill('#claim-phone', '+44 7123 456789');
    await page.fill('#claim-email', claimantUser.email);
    await page.fill('#claim-position', 'Head Imam');
    await page.fill('#claim-proof', 'https://charity-commission.gov.uk/proof-12345');
    
    // Submit claim
    await page.click('button:has-text("Submit Claim")');
    await page.waitForTimeout(1500);

    // Step 5: Direct PostgreSQL verification of mosque_claim_requests
    const dbClaim = await dbHelper.findClaimRequestByMosqueId(mosqueId);
    expect(dbClaim).not.toBeNull();
    expect(dbClaim.position_in_mosque).toBe('Head Imam');
    expect(dbClaim.status).toBe('PENDING');

    // Step 6: Super Admin logs in to review claim
    await loginPage.goto();
    await loginPage.login(adminUser.email, adminUser.password);

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Click "Mosque Claims" tab
    const claimsTab = page.locator('button:has-text("Mosque Claims")');
    await expect(claimsTab).toBeVisible();
    await claimsTab.click();

    // Step 7: Find the claim row for our claimant and approve
    const claimRow = page.locator('tr', { hasText: 'Imam Farooq' });
    await expect(claimRow).toBeVisible();
    await claimRow.locator('button:has-text("Approve & Grant Admin")').click();
    await page.waitForTimeout(1500);

    // Step 8: Direct PostgreSQL verification of status and role upgrade
    const dbClaimAfter = await dbHelper.findClaimRequestByMosqueId(mosqueId);
    expect(dbClaimAfter.status).toBe('APPROVED');

    const upgradedUser = await dbHelper.findUserByEmail(claimantUser.email);
    expect(upgradedUser).not.toBeNull();
    expect(upgradedUser.role).toBe('MOSQUE_ADMIN');
  });

  test('Khutbah & Event Scheduling: Admin publishes sermon and program, verified on UI and in PostgreSQL', async ({ page }) => {
    // Step 1: Admin logs in
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(adminUser.email, adminUser.password);

    // Step 2: Navigate to Mosque Detail page
    await page.goto(`/mosques/${mosqueId}`);
    await page.waitForLoadState('networkidle');

    // Step 3: Admin controls bar should be visible
    const scheduleKhutbahBtn = page.locator('button:has-text("Schedule Khutbah")');
    await expect(scheduleKhutbahBtn).toBeVisible();
    await scheduleKhutbahBtn.click();

    // Step 4: Fill Khutbah form
    const khutbahTopic = `E2E_TEST_KHUTBAH_${timestamp}`;
    await page.fill('input[placeholder*="Cultivating Gratitude"]', khutbahTopic);
    await page.fill('input[placeholder*="Sheikh Abdul Rahman"]', 'Sheikh Ahmad Al-Hassan');
    await page.click('button:has-text("Publish Khutbah")');
    await page.waitForTimeout(1000);

    // Verify rendered on UI
    await expect(page.locator(`text=${khutbahTopic}`)).toBeVisible();

    // Direct PostgreSQL verification of mosque_khutbahs
    const khutbahs = await dbHelper.findKhutbahsByMosqueId(mosqueId);
    const matchingKhutbah = khutbahs.find(k => k.topic === khutbahTopic);
    expect(matchingKhutbah).toBeDefined();
    expect(matchingKhutbah.khatib_name).toBe('Sheikh Ahmad Al-Hassan');

    // Step 5: Schedule Community Event / Program
    const addProgramBtn = page.locator('button:has-text("Add Program")');
    await expect(addProgramBtn).toBeVisible();
    await addProgramBtn.click();

    const eventTitle = `E2E_TEST_EVENT_${timestamp}`;
    await page.fill('input[placeholder*="Weekly Tafseer"]', eventTitle);
    await page.fill('textarea[placeholder*="Join us for an inspiring session"]', 'Comprehensive exploration of Surah Al-Kahf.');
    await page.fill('input[placeholder*="Dr. Bilal Philips"]', 'Ustadh Tariq');
    await page.click('button:has-text("Schedule Event")');
    await page.waitForTimeout(1000);

    // Verify rendered on UI
    await expect(page.locator(`text=${eventTitle}`)).toBeVisible();

    // Direct PostgreSQL verification of mosque_events
    const events = await dbHelper.findEventsByMosqueId(mosqueId);
    const matchingEvent = events.find(e => e.title === eventTitle);
    expect(matchingEvent).toBeDefined();
    expect(matchingEvent.speaker_name).toBe('Ustadh Tariq');
  });
});
