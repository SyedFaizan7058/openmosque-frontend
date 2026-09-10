export class DirectoryPage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.locator('input[placeholder*="Search by mosque name"]');
    this.mosqueCards = page.locator('article, div[class*="rounded-2xl border"]');
    this.resultsCount = page.locator('text=/\\d+ Mosques? Found/i');
  }

  async goto(params = {}) {
    let url = '/mosques';
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    if (queryString) url += `?${queryString}`;
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async search(query) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  async filterByCity(cityName) {
    const cityButton = this.page.locator(`button:has-text("${cityName}")`);
    await cityButton.click();
    await this.page.waitForTimeout(500);
  }

  async clickMosqueCard(name) {
    const card = this.page.locator(`h3:has-text("${name}")`).first();
    await card.click();
    await this.page.waitForLoadState('networkidle');
  }
}
