import { expect, test } from "@playwright/test";

async function fillCommonFields(page: import("@playwright/test").Page) {
  await page.getByLabel("Job title").fill("Senior Product Designer");
  await page.getByLabel("Company name").fill("Northstar Health");
  await page.getByLabel("Location").fill("Boston, MA");
  await page.getByLabel("Salary range text").fill("$145,000 - $168,000 base");
  await page.getByLabel("Work mode").selectOption("hybrid");
}

test("submits a strong posting and renders the results view", async ({ page }) => {
  await page.goto("/analyze");

  await fillCommonFields(page);
  await page
    .getByLabel("Full job description")
    .fill(`About the role
Northstar Health is building workflow software for multi-site care teams. This design role sits on our clinician platform team and reports to the Director of Product Design.

Responsibilities
- Design end-to-end experiences for scheduling, documentation, and staffing tools.
- Partner with product managers, engineers, and operations leaders to define roadmap priorities.
- Run discovery interviews, synthesize insights, and improve core workflows with measurable outcomes.
- Maintain our design system and contribute reusable interaction patterns.

Qualifications
- 5+ years of product design experience in complex software environments.
- Strong experience with Figma, prototyping, and cross-functional collaboration.

Preferred qualifications
- Experience in healthcare, B2B SaaS, or regulated environments.
        - Familiarity with analytics, experimentation, and service design.`);

  await page.locator("form").evaluate((formElement) => {
    (formElement as HTMLFormElement).requestSubmit();
  });

  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByText("Looks promising")).toBeVisible();
  await expect(page.getByText("Seriousness")).toBeVisible();
  await expect(page.getByText("Applicant ROI")).toBeVisible();
});

test("submits an inflated junior posting and surfaces warning flags", async ({
  page,
}) => {
  await page.goto("/analyze");

  await page.getByLabel("Job title").fill("Junior Product Designer");
  await page.getByLabel("Company name").fill("Velocity Foundry");
  await page.getByLabel("Location").fill("Remote");
  await page.getByLabel("Work mode").selectOption("remote");
  await page
    .getByLabel("Full job description")
    .fill(`We are seeking a junior designer to own strategy across the company and lead executive stakeholder alignment.

Requirements
- 5+ years of experience.
- Expert knowledge of Figma, Sketch, Framer, Photoshop, Illustrator, After Effects, React, Next.js, TypeScript, Python, SQL, Tableau, GA4, HubSpot, Salesforce, Jira, Notion, AWS, Docker, Kubernetes, and GraphQL.
- Comfortable mentoring teams and setting design vision.`);

  await page.locator("form").evaluate((formElement) => {
    (formElement as HTMLFormElement).requestSubmit();
  });

  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByText("Likely high-friction")).toBeVisible();
  await expect(
    page.locator("li").filter({
      hasText:
        "Entry-level or junior framing with inflated experience requirements",
    }),
  ).toBeVisible();
  await expect(
    page
      .locator("li")
      .filter({
        hasText: "Too many required tools or skills for the likely seniority",
      }),
  ).toBeVisible();
});

test("handles a long pasted job description without breaking the flow", async ({
  page,
}) => {
  await page.goto("/analyze");

  await fillCommonFields(page);
  await page
    .getByLabel("Full job description")
    .fill(
      `About the role
Northstar Health is hiring for a cross-functional product design role.

Responsibilities
- Design and improve end-to-end workflows for scheduling, documentation, and communication.
- Partner with product, engineering, operations, and research stakeholders.

Qualifications
- 5+ years of experience with complex product environments.

Preferred qualifications
- Experience in regulated industries.

${"Detailed context about workflows, tooling, users, and collaboration. ".repeat(200)}`,
    );

  await page.locator("form").evaluate((formElement) => {
    (formElement as HTMLFormElement).requestSubmit();
  });

  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByText("Applicant ROI")).toBeVisible();
  await expect(page.getByText("Why This Matters")).toBeVisible();
});
