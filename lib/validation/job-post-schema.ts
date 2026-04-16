import { z } from "zod";
import type { JobPostInput } from "@/lib/analysis/types";

const MAX_SHORT_TEXT = 120;
export const MAX_SALARY_TEXT_LENGTH = 160;
export const MAX_DESCRIPTION_LENGTH = 50000;
export const MIN_DESCRIPTION_LENGTH = 80;
export const MAX_DESCRIPTION_RECOMMENDED = 12000;

export const workModeSchema = z.enum([
  "remote",
  "hybrid",
  "on-site",
  "unspecified",
]);

const requiredTrimmedString = (fieldLabel: string, maxLength = MAX_SHORT_TEXT) =>
  z
    .string()
    .trim()
    .min(1, `${fieldLabel} is required.`)
    .max(maxLength, `${fieldLabel} must be ${maxLength} characters or fewer.`);

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmedValue = value.trim();
      return trimmedValue.length === 0 ? undefined : trimmedValue;
    },
    z
      .string()
      .max(maxLength, `Must be ${maxLength} characters or fewer.`)
      .optional(),
  );

const optionalDateSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length === 0 ? undefined : trimmedValue;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")
    .refine((value) => {
      const parsedDate = new Date(`${value}T00:00:00.000Z`);

      if (Number.isNaN(parsedDate.getTime())) {
        return false;
      }

      const today = new Date();
      const todayUtc = Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
      );

      return parsedDate.getTime() <= todayUtc;
    }, "Date posted cannot be in the future.")
    .optional(),
);

export const jobPostSchema = z.object({
  jobTitle: requiredTrimmedString("Job title"),
  companyName: requiredTrimmedString("Company name"),
  location: requiredTrimmedString("Location"),
  datePosted: optionalDateSchema,
  salaryRangeText: optionalTrimmedString(MAX_SALARY_TEXT_LENGTH),
  workMode: workModeSchema,
  description: z
    .string()
    .trim()
    .min(
      MIN_DESCRIPTION_LENGTH,
      `Paste at least ${MIN_DESCRIPTION_LENGTH} characters from the job description so Ghosted has enough context to evaluate the posting.`,
    )
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Job descriptions must be ${MAX_DESCRIPTION_LENGTH.toLocaleString()} characters or fewer.`,
    ),
});

export type JobPostValidationErrors = Partial<Record<keyof JobPostInput, string>>;

export type JobPostFormValues = {
  jobTitle: string;
  companyName: string;
  location: string;
  datePosted: string;
  salaryRangeText: string;
  workMode: JobPostInput["workMode"];
  description: string;
};

export const initialJobPostFormValues: JobPostFormValues = {
  jobTitle: "",
  companyName: "",
  location: "",
  datePosted: "",
  salaryRangeText: "",
  workMode: "unspecified",
  description: "",
};

export function getJobPostFieldErrors(
  result: { success: false; error: z.ZodError },
): JobPostValidationErrors {
  const fieldErrors: JobPostValidationErrors = {};

  for (const issue of result.error.issues) {
    const fieldName = issue.path[0];

    if (typeof fieldName === "string" && !(fieldName in fieldErrors)) {
      fieldErrors[fieldName as keyof JobPostInput] = issue.message;
    }
  }

  return fieldErrors;
}

export function validateJobPostInput(input: unknown) {
  return jobPostSchema.safeParse(input);
}
