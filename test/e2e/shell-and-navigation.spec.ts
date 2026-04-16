import { expect, test } from "@playwright/test";

test("homepage loads and routes to methodology", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "See whether a job posting looks worth your time.",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Review Methodology" }).click();
  await expect(page).toHaveURL(/\/methodology$/);
  await expect(
    page.getByRole("heading", {
      name: "Serious analysis, honest limitations.",
    }),
  ).toBeVisible();
});

test("results page shows a graceful empty state without prior analysis", async ({
  page,
}) => {
  await page.goto("/results");

  await expect(page.getByText("Run an analysis to see the score breakdown.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Analyze a Job Post" })).toBeVisible();
});
