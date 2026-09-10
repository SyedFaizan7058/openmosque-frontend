export class AddMosquePage {
  constructor(page) {
    this.page = page;
    // Step 1: Basic Info
    this.nameInput = page.locator('#mosque-name');
    this.addressInput = page.locator('#mosque-address');
    this.cityInput = page.locator('#mosque-city');
    this.countryInput = page.locator('#mosque-country');
    this.descInput = page.locator('#mosque-desc');
    this.phoneInput = page.locator('#mosque-phone');
    this.emailInput = page.locator('#mosque-email');
    this.websiteInput = page.locator('#mosque-website');
    this.nextButton = page.locator('button:has-text("Next")');
    this.backButton = page.locator('button:has-text("Back")');
    this.submitButton = page.locator('button:has-text("Submit for Review")');
    this.successHeading = page.locator('h1:has-text("Proposal Received")');
  }

  async goto() {
    await this.page.goto('/mosques/add');
    await this.page.waitForLoadState('networkidle');
  }

  async fillBasicInfo({ name, address, city, country = 'India', description, phone, email, website }) {
    if (name) await this.nameInput.fill(name);
    if (address) await this.addressInput.fill(address);
    if (city) await this.cityInput.fill(city);
    if (await this.countryInput.isVisible()) {
      await this.countryInput.fill(country || 'India');
    }
    if (description) await this.descInput.fill(description);
    if (phone) await this.phoneInput.fill(phone);
    if (email) await this.emailInput.fill(email);
    if (website) await this.websiteInput.fill(website);
    await this.nextButton.click();
  }

  async selectFacilities(facilityNames = []) {
    for (const fac of facilityNames) {
      const facButton = this.page.locator(`button:has-text("${fac}")`);
      if (await facButton.isVisible()) {
        await facButton.click();
      }
    }
    await this.nextButton.click();
  }

  async fillPrayerTimings(timings = {}) {
    // Optional timings can be filled if provided
    await this.nextButton.click();
  }

  async submitForm() {
    await this.submitButton.click();
    await this.page.waitForSelector('h1:has-text("Proposal Received")', { timeout: 10000 });
  }

  async completeWizard(data) {
    await this.fillBasicInfo(data);
    await this.selectFacilities(data.facilities || ['Wheelchair Accessible', 'Wudhu Area']);
    await this.fillPrayerTimings(data.prayerTimes || {});
    await this.submitForm();
  }
}
