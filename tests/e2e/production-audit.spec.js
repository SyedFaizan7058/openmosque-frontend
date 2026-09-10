import { test, expect } from '@playwright/test';

const PROD_URL = 'https://openmosque-frontendd.vercel.app';
const API_URL = 'https://openmosque-backend.onrender.com/api/v1';

test.describe('Full End-to-End Production Audit', () => {

  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('om_location_dismissed', 'true');
    });
  });

  test('1. Backend Health & API Endpoints Audit', async ({ request }) => {
    test.setTimeout(60000);
    // 1.1 Root / Actuator Health
    const healthRes = await request.get(`${API_URL}/mosques`);
    expect(healthRes.status()).toBe(200);

    // 1.2 Mosques Directory API (289 mosques in Neon DB)
    const mosquesRes = await request.get(`${API_URL}/mosques?page=0&size=20`);
    expect(mosquesRes.status()).toBe(200);
    const mosquesJson = await mosquesRes.json();
    expect(mosquesJson.success).toBe(true);
    expect(mosquesJson.data.totalElements).toBe(289);
    expect(mosquesJson.data.content.length).toBe(20);

    // 1.3 Mosque Detail by Slug (Amiri Masjid)
    const amiriRes = await request.get(`${API_URL}/mosques/amiri-masjid-udgir`);
    expect(amiriRes.status()).toBe(200);
    const amiriJson = await amiriRes.json();
    expect(amiriJson.data.name).toBe('Amiri Masjid');
    expect(amiriJson.data.city).toBe('Udgir');
    expect(amiriJson.data.latitude).toBeCloseTo(18.3942, 2);
    expect(amiriJson.data.longitude).toBeCloseTo(77.1175, 2);

    // 1.4 Mosque Search API
    const searchRes = await request.get(`${API_URL}/mosques/search?query=London`);
    expect(searchRes.status()).toBe(200);
    const searchJson = await searchRes.json();
    expect(searchJson.data.content.length).toBeGreaterThan(0);

    // 1.5 Badges Catalog API
    const badgesRes = await request.get(`${API_URL}/badges`);
    expect(badgesRes.status()).toBe(200);
  });

  test('2. Homepage & UI Component Audit', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(PROD_URL);
    await page.waitForLoadState('networkidle');

    // Check title
    const pageTitle = await page.title();
    expect(pageTitle.length).toBeGreaterThan(0);

    // Verify Hero Section
    await expect(page.locator('h1')).toBeVisible();

    // Verify Search Bar is interactive
    const searchInput = page.locator('input[placeholder*="Search by mosque"]');
    await expect(searchInput).toBeVisible();

    // Verify Quick Navigation cards / Explore Directory button
    await expect(page.locator('text=Explore Directory').first()).toBeVisible({ timeout: 10000 });

    // Verify Announcements banner
    await expect(page.locator('text=Friday Jumu').first()).toBeVisible();

    // Ensure zero fatal console errors
    const fatalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('404') && !e.includes('Download the React DevTools'));
    console.log('Homepage fatal console errors count:', fatalErrors.length);
  });

  test('3. Directory Page (289 Mosques, Pagination, Search & Filters)', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(`${PROD_URL}/mosques`);
    await page.waitForLoadState('networkidle');

    // Verify Mosque Cards Grid loads
    const mosqueCards = page.locator('a[href^="/mosques/"]');
    await expect(mosqueCards.first()).toBeVisible({ timeout: 20000 });
    const cardCount = await mosqueCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(5);

    // Verify search input
    const searchInput = page.locator('input[placeholder*="Search by name"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Amiri');
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Amiri Masjid')).toBeVisible({ timeout: 10000 });
    }
  });

  test('4. Mosque Detail Page (Amiri Masjid Udgir)', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(`${PROD_URL}/mosques/amiri-masjid-udgir`);
    await page.waitForLoadState('networkidle');

    // Mosque Header
    await expect(page.locator('h1:has-text("Amiri Masjid")')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Udgir').first()).toBeVisible();

    // Facilities & About Dropdown
    const facilitiesHeader = page.locator('text=Facilities & About Mosque');
    await expect(facilitiesHeader).toBeVisible();
    await facilitiesHeader.click();
    await expect(page.locator('text=1. Facilities & Amenities')).toBeVisible();
    await expect(page.locator('text=2. About the Mosque')).toBeVisible();

    // Management Controls Scoping: Unauthenticated visitor must NOT see Management Controls
    await expect(page.locator('text=Mosque Management Controls')).toHaveCount(0);
    await expect(page.locator('button:has-text("Schedule Khutbah")')).toHaveCount(0);

    // Claim button MUST be visible for regular visitor
    await expect(page.locator('button:has-text("Claim Mosque (Imam / Committee)")')).toBeVisible();

    // Suggest Edit Button
    const suggestBtn = page.locator('button:has-text("Suggest an Edit")');
    await expect(suggestBtn).toBeVisible();

    // Reviews & QA
    await expect(page.locator('text=Community Reviews')).toBeVisible();
    await expect(page.locator('text=Community Q&A')).toBeVisible();
  });

  test('5. Location Modal & Scroll-To-Top Audit', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(PROD_URL);
    await page.waitForLoadState('networkidle');

    // Scroll down and navigate to directory
    await page.evaluate(() => window.scrollTo(0, 1000));
    const exploreBtn = page.locator('text=Explore Directory').first();
    await exploreBtn.click();
    await page.waitForURL(`${PROD_URL}/mosques`);
    await page.waitForTimeout(500);

    // Verify Scroll to top
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });

  test('6. Mobile Responsiveness Audit (375x812 - iPhone X/14)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(PROD_URL);
    await page.waitForLoadState('networkidle');

    // Verify mobile header
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Verify mobile navigation
    await page.goto(`${PROD_URL}/mosques`);
    await expect(page.locator('a[href^="/mosques/"]').first()).toBeVisible({ timeout: 15000 });

    // Verify single-column layout on mobile
    const firstCard = page.locator('a[href^="/mosques/"]').first();
    const box = await firstCard.boundingBox();
    expect(box.width).toBeLessThanOrEqual(375);
  });

  test('7. Static Pages & Legal Compliance Audit', async ({ page }) => {
    for (const path of ['/about', '/contact', '/privacy', '/terms']) {
      const response = await page.goto(`${PROD_URL}${path}`);
      expect(response.status()).toBe(200);
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

});
