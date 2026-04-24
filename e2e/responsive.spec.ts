import { expect, test } from "@playwright/test";

const analysisId = "22222222-2222-2222-2222-222222222222";

for (const viewport of [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]) {
  test(`full flow responsive ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);

    await page.route("**/api/v1/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ analysis_id: analysisId, match_score: 70 }),
      });
    });
    await page.route(`**/api/v1/analysis/${analysisId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: analysisId,
          match_score: 70,
          score_label: "Good Match",
          matched_keywords: ["python"],
          missing_keywords: ["aws"],
          suggestions: ["Add AWS"],
          entities: {},
          resume_word_count: 180,
          processing_time_ms: 145,
          resume_filename: "resume.pdf",
        }),
      });
    });

    await page.goto("/analyze");
    await page.locator("input[type='file']").setInputFiles({
      name: "resume.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
    await page.getByPlaceholder("Paste the job description here...").fill("python react fastapi ".repeat(5));
    await page.getByRole("button", { name: /initialize match engine/i }).click();

    await expect(page).toHaveURL(new RegExp(`/results/${analysisId}`));
    await expect(page.getByText(/Match Intelligence Report/i)).toBeVisible();
  });
}
