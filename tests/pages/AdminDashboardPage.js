export class AdminDashboardPage {
  constructor(page) {
    this.page = page;
    this.pendingTab = page.locator('button:has-text("Pending Reviews")');
    this.approvedTab = page.locator('button:has-text("Approved")');
    this.rejectedTab = page.locator('button:has-text("Rejected")');
    this.iqamahTab = page.locator('button:has-text("Iqamah Schedules")');
    this.osmTab = page.locator('button:has-text("OSM Ingestion")');
    this.submissionsTable = page.locator('table');
  }

  async goto() {
    await this.page.goto('/admin');
    await this.page.waitForLoadState('networkidle');
  }

  async selectTab(tabName) {
    const tab = this.page.locator(`button:has-text("${tabName}")`);
    await tab.click();
    await this.page.waitForTimeout(300);
  }

  async getRowForMosque(mosqueName) {
    return this.page.locator('tr', { hasText: mosqueName });
  }

  async approveMosque(mosqueName) {
    const row = await this.getRowForMosque(mosqueName);
    const approveBtn = row.locator('button:has-text("Approve")');
    await approveBtn.click();
    await this.page.waitForTimeout(500);
  }

  async rejectMosque(mosqueName) {
    const row = await this.getRowForMosque(mosqueName);
    const rejectBtn = row.locator('button:has-text("Reject")');
    await rejectBtn.click();
    await this.page.waitForTimeout(500);
  }
}
