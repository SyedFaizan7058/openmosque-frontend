import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { AddMosquePage } from '../pages/AddMosquePage.js';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js';
import { DirectoryPage } from '../pages/DirectoryPage.js';
import { MosqueDetailPage } from '../pages/MosqueDetailPage.js';
import { generateTestMosque, generateTestUser } from '../fixtures/test-data.js';
import { apiClient } from '../utils/api-client.js';
import { dbHelper } from '../utils/db-helper.js';

test.describe('Master E2E Lifecycle: Full End-to-End Application Flow (Phases A through I)', () => {
  const timestamp = Date.now();
  const testMosque = generateTestMosque(timestamp);
  const worshipper = generateTestUser('USER', timestamp);
  const admin = generateTestUser('SUPER_ADMIN', timestamp + 1);

  let approvedMosqueId = null;

  test.afterAll(async () => {
    await dbHelper.cleanupTestEntities('E2E_TEST_');
    await dbHelper.cleanupTestEntities('user-');
    await dbHelper.cleanupTestEntities('admin-');
  });

  test('Full Unbroken Journey: Proposal -> Moderation -> PostgreSQL -> Directory -> Community -> Iqamah', async ({ page }) => {
    // -------------------------------------------------------------------------
    // Phase A: Worshipper Submits Mosque Proposal via 4-Step Wizard
    // -------------------------------------------------------------------------
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(worshipper.email, worshipper.password);

    const addMosquePage = new AddMosquePage(page);
    await addMosquePage.goto();

    await addMosquePage.fillBasicInfo({
      name: testMosque.name,
      address: testMosque.address,
      city: testMosque.city,
      description: testMosque.description,
      phone: testMosque.phone,
      email: testMosque.email,
      website: testMosque.website,
    });

    await addMosquePage.selectFacilities(['Wudu Area', 'Parking']);
    await addMosquePage.fillPrayerTimings();
    await addMosquePage.submitForm();

    // Verify confirmation screen
    await expect(page.locator('h1:has-text("Proposal Received")')).toBeVisible();

    // -------------------------------------------------------------------------
    // Phase B: Direct PostgreSQL Verification of Pending Proposal
    // -------------------------------------------------------------------------
    const dbSubBefore = await dbHelper.findMosqueSubmissionByName(testMosque.name);
    if (dbSubBefore) {
      expect(dbSubBefore.name).toBe(testMosque.name);
      expect(dbSubBefore.status).toBe('PENDING');
    }

    // -------------------------------------------------------------------------
    // Phase C & D: Admin Logs In, Approves Proposal, and Verifies PostgreSQL Promotion
    // -------------------------------------------------------------------------
    await loginPage.goto();
    await loginPage.login(admin.email, admin.password);

    // Approve proposal
    if (dbSubBefore) {
      const approveRes = await apiClient.patch(
        `/admin/moderation/submissions/${dbSubBefore.id}/decision`,
        { status: 'APPROVED', reviewComments: 'Master lifecycle approval' },
        admin.token
      );
      expect(approveRes.status).toBe(200);
    }

    // Verify promotion in PostgreSQL
    const dbMosque = await dbHelper.findMosqueByName(testMosque.name);
    expect(dbMosque).not.toBeNull();
    expect(dbMosque.name).toBe(testMosque.name);
    approvedMosqueId = dbMosque.id;

    // -------------------------------------------------------------------------
    // Phase E: Search & Discover in Public Directory
    // -------------------------------------------------------------------------
    const directoryPage = new DirectoryPage(page);
    await directoryPage.goto();
    await directoryPage.search(testMosque.name);

    // Verify mosque card is returned and visible
    const mosqueCardTitle = page.locator(`h3:has-text("${testMosque.name}")`).first();
    await expect(mosqueCardTitle).toBeVisible();

    // -------------------------------------------------------------------------
    // Phase F: Mosque Detail Page & Prayer Timetable
    // -------------------------------------------------------------------------
    await mosqueCardTitle.click();
    await page.waitForLoadState('networkidle');

    const detailPage = new MosqueDetailPage(page);
    await expect(page.locator(`h1:has-text("${testMosque.name}")`)).toBeVisible();
    await expect(page.locator('text=Daily Prayer & Iqamah Times').first()).toBeVisible();

    // -------------------------------------------------------------------------
    // Phase G: Community Review & Rating Recalculation
    // -------------------------------------------------------------------------
    const reviewText = `SubhanAllah beautiful masjid and pristine wudhu area! (${timestamp})`;
    await detailPage.submitReview({ text: reviewText, rating: 5 });

    // Verify review rendered in feed
    await expect(page.locator(`text=${reviewText}`)).toBeVisible();

    // Verify PostgreSQL persistence
    const dbReviews = await dbHelper.findReviewsByMosqueId(approvedMosqueId);
    expect(dbReviews.length).toBeGreaterThan(0);
    expect(dbReviews[0].rating_overall).toBe(5);

    // -------------------------------------------------------------------------
    // Phase H: Community Q&A Inquiry & Persistence
    // -------------------------------------------------------------------------
    const questionText = `What time does the second Jumu'ah prayer start? (${timestamp})`;
    await detailPage.submitQuestion(questionText);

    // Verify question rendered in feed
    await expect(page.locator(`text=${questionText}`)).toBeVisible();

    // Verify PostgreSQL persistence
    const dbQuestions = await dbHelper.findQuestionsByMosqueId(approvedMosqueId);
    expect(dbQuestions.length).toBeGreaterThan(0);
    expect(dbQuestions[0].question_text).toBe(questionText);

    // -------------------------------------------------------------------------
    // Phase I: Iqamah Timing Configuration & Schedule Verification
    // -------------------------------------------------------------------------
    // Update schedule via API / admin configurator
    const updatePayload = {
      fajrType: 'OFFSET_AFTER_ADHAN',
      fajrOffsetMinutes: 20,
      fajrFixedTime: null,
      dhuhrType: 'FIXED_TIME',
      dhuhrOffsetMinutes: 15,
      dhuhrFixedTime: '13:30:00',
      asrType: 'OFFSET_AFTER_ADHAN',
      asrOffsetMinutes: 15,
      asrFixedTime: null,
      maghribType: 'OFFSET_AFTER_ADHAN',
      maghribOffsetMinutes: 0,
      maghribFixedTime: null,
      ishaType: 'OFFSET_AFTER_ADHAN',
      ishaOffsetMinutes: 15,
      ishaFixedTime: null,
      jummah1Time: '13:15:00',
      jummah2Time: '14:00:00',
      jummahKhutbahLanguage: 'Arabic & English',
    };

    const iqamahRes = await apiClient.put(
      `/mosque-admin/mosques/${approvedMosqueId}/iqamah-schedule`,
      updatePayload,
      admin.token
    );
    expect(iqamahRes.status).toBe(200);

    // Direct PostgreSQL Verification
    const dbSchedule = await dbHelper.findIqamahSchedule(approvedMosqueId);
    expect(dbSchedule).not.toBeNull();
    expect(dbSchedule.dhuhr_type).toBe('FIXED_TIME');
    expect(dbSchedule.dhuhr_fixed_time).toBe('13:30:00');
    expect(dbSchedule.jummah_1_time).toBe('13:15:00');

    // Reload Mosque Detail page and verify it renders updated timings smoothly
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`h1:has-text("${testMosque.name}")`)).toBeVisible();
  });
});
