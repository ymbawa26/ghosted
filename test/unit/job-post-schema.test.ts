import {
  getJobPostFieldErrors,
  MAX_DESCRIPTION_LENGTH,
  MAX_SALARY_TEXT_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  validateJobPostInput,
} from "@/lib/validation/job-post-schema";

function makeDescription(length = MIN_DESCRIPTION_LENGTH + 20) {
  const seed =
    "This job post includes clear responsibilities, role context, and specific qualifications. ";

  return `${seed}${"A".repeat(length)}`.slice(0, length);
}

function makeValidInput() {
  return {
    jobTitle: "Product Designer",
    companyName: "Northstar Health",
    location: "Boston, MA",
    datePosted: "2026-04-01",
    salaryRangeText: "$115,000 - $135,000 base",
    workMode: "hybrid" as const,
    description: makeDescription(),
  };
}

describe("validateJobPostInput", () => {
  it("accepts a valid posting payload", () => {
    const result = validateJobPostInput(makeValidInput());

    expect(result.success).toBe(true);
  });

  it("rejects empty required fields", () => {
    const result = validateJobPostInput({
      ...makeValidInput(),
      jobTitle: " ",
      companyName: "",
      location: "   ",
      description: " ",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(getJobPostFieldErrors(result)).toEqual({
        jobTitle: "Job title is required.",
        companyName: "Company name is required.",
        location: "Location is required.",
        description: `Paste at least ${MIN_DESCRIPTION_LENGTH} characters from the job description so Ghosted has enough context to evaluate the posting.`,
      });
    }
  });

  it("rejects future dates", () => {
    const result = validateJobPostInput({
      ...makeValidInput(),
      datePosted: "2099-01-01",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(getJobPostFieldErrors(result)).toEqual({
        datePosted: "Date posted cannot be in the future.",
      });
    }
  });

  it("accepts empty optional fields", () => {
    const result = validateJobPostInput({
      ...makeValidInput(),
      datePosted: "",
      salaryRangeText: "",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.datePosted).toBeUndefined();
      expect(result.data.salaryRangeText).toBeUndefined();
    }
  });

  it("accepts long job descriptions within the limit", () => {
    const result = validateJobPostInput({
      ...makeValidInput(),
      description: makeDescription(MAX_DESCRIPTION_LENGTH),
    });

    expect(result.success).toBe(true);
  });

  it("rejects overly long salary text and descriptions", () => {
    const result = validateJobPostInput({
      ...makeValidInput(),
      salaryRangeText: "x".repeat(MAX_SALARY_TEXT_LENGTH + 1),
      description: makeDescription(MAX_DESCRIPTION_LENGTH + 1),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = getJobPostFieldErrors(result);
      expect(errors.salaryRangeText).toBe(
        `Must be ${MAX_SALARY_TEXT_LENGTH} characters or fewer.`,
      );
      expect(errors.description).toBe(
        `Job descriptions must be ${MAX_DESCRIPTION_LENGTH.toLocaleString()} characters or fewer.`,
      );
    }
  });
});
