import { test, expect } from "@playwright/test";

test("has h1", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  const locater = page.locator("h1");
  await expect(locater).toHaveText(/Login/);
});
