export class MosqueDetailPage {
  constructor(page) {
    this.page = page;
    this.mosqueTitle = page.locator('h1');
    this.favoriteButton = page.locator('button[aria-label*="favorite" i], button:has(.lucide-heart)');
    this.writeReviewButton = page.locator('button:has-text("Write a Review")');
    this.reviewTextarea = page.locator('textarea[placeholder*="Share helpful feedback"]');
    this.submitReviewButton = page.locator('button:has-text("Post Review")');
    this.reviewsList = page.locator('.divide-y > div');

    this.askQuestionButton = page.locator('button:has-text("Ask a Question")');
    this.questionTextarea = page.locator('textarea[placeholder*="dedicated parking"]');
    this.submitQuestionButton = page.locator('button:has-text("Submit Question")');
    this.questionsList = page.locator('div:has(> .lucide-message-square)');

    this.configureIqamahButton = page.locator('button:has-text("Configure Iqamah Times")');
    this.saveScheduleButton = page.locator('button:has-text("Save Schedule")');
  }

  async goto(idOrSlug) {
    await this.page.goto(`/mosques/${idOrSlug}`);
    await this.page.waitForLoadState('networkidle');
  }

  async toggleFavorite() {
    await this.favoriteButton.click();
    await this.page.waitForTimeout(300);
  }

  async submitReview({ text, rating = 5 }) {
    if (await this.writeReviewButton.isVisible()) {
      await this.writeReviewButton.click();
    }
    await this.reviewTextarea.fill(text);
    await this.submitReviewButton.click();
    await this.page.waitForTimeout(800);
  }

  async submitQuestion(text) {
    if (await this.askQuestionButton.isVisible()) {
      await this.askQuestionButton.click();
    }
    await this.questionTextarea.fill(text);
    await this.submitQuestionButton.click();
    await this.page.waitForTimeout(800);
  }

  async answerQuestion(questionText, answerText) {
    const questionCard = this.page.locator('div', { hasText: questionText }).first();
    const replyBtn = questionCard.locator('button:has-text("Reply with an answer")');
    await replyBtn.click();
    const replyTextarea = questionCard.locator('textarea');
    await replyTextarea.fill(answerText);
    const postAnswerBtn = questionCard.locator('button:has-text("Post Answer")');
    await postAnswerBtn.click();
    await this.page.waitForTimeout(800);
  }

  async openIqamahConfig() {
    await this.configureIqamahButton.click();
    await this.page.waitForSelector('text=Iqamah Congregation Timings', { timeout: 5000 });
  }

  async saveIqamahSchedule() {
    await this.saveScheduleButton.click();
    await this.page.waitForSelector('text=Iqamah schedule successfully updated', { timeout: 8000 });
  }
}
