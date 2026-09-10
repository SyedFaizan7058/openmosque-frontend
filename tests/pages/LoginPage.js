export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('#login-email');
    this.passwordInput = page.locator('#login-password');
    this.submitButton = page.locator('button[type="submit"]');
    this.googleButton = page.locator('button:has-text("Google")');
    this.errorMessage = page.locator('.text-red-600, .text-rose-600, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForTimeout(1000);
  }

  async loginWithGoogle() {
    await this.googleButton.click();
  }
}