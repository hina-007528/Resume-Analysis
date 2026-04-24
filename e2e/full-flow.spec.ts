import { expect, test } from "@playwright/test";

const analysisId = "11111111-1111-1111-1111-111111111111";

test("analyze -> results -> download", async ({ page }) => {
  await page.route("**/api/v1/analyze", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        analysis_id: analysisId,
        match_score: 84.5,
        score_label: "Excellent Match",
        matched_keywords: ["python"],
        missing_keywords: ["aws"],
        suggestions: ["Add AWS"],
        entities: { ORG: [] },
        word_count: 120,
        processing_time_ms: 120,
      }),
    });
  });

  await page.route(`**/api/v1/analysis/${analysisId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: analysisId,
        match_score: 84.5,
        score_label: "Excellent Match",
        matched_keywords: ["python", "react"],
        missing_keywords: ["aws"],
        suggestions: ["Add AWS"],
        entities: { ORG: [] },
        resume_word_count: 180,
        processing_time_ms: 145,
        resume_filename: "resume.pdf",
      }),
    });
  });

  await page.route(`**/api/v1/report/${analysisId}`, async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Neural_Report_${analysisId}.pdf`,
      },
      body: "%PDF-1.4\n%%EOF",
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

  const scoreText = await page.locator("text=/\\d+\\.?\\d*%/").first().textContent();
  const scoreValue = Number((scoreText || "0").replace("%", ""));
  expect(scoreValue).toBeGreaterThanOrEqual(0);
  expect(scoreValue).toBeLessThanOrEqual(100);

  await expect(page.getByText(/Matched Assets/i)).toBeVisible();
  await expect(page.getByText(/Missing Criticals/i)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /download/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("Neural_Report");
});
