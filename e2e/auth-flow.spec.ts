import { expect, test } from "@playwright/test";

test("signup -> login -> history -> logout", async ({ page }) => {
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD to run auth flow.");

  const email = process.env.E2E_AUTH_EMAIL!;
  const password = process.env.E2E_AUTH_PASSWORD!;

  await page.goto("/login");
  await page.getByRole("button", { name: /create_id/i }).click();
  await page.getByPlaceholder("NODE_ADDRESS@QUANTUM.NET").fill(email);
  await page.locator("input[type='password'], input[type='text']").nth(1).fill(password);
  await page.getByRole("button", { name: /register/i }).click();

  await page.goto("/login");
  await page.getByRole("button", { name: /login/i }).click();
  await page.getByPlaceholder("NODE_ADDRESS@QUANTUM.NET").fill(email);
  await page.locator("input[type='password'], input[type='text']").nth(1).fill(password);
  await page.getByRole("button", { name: /authorize/i }).click();

  await page.goto("/history");
  await expect(page.getByText(/Neural Archive/i)).toBeVisible();

  await page.getByTitle("Sign Out").click();
  await expect(page).toHaveURL(/\/$/);
});
