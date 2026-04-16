"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveLatestAnalysis } from "@/lib/analysis/session";
import type { AnalysisResult } from "@/lib/analysis/types";
import {
  getJobPostFieldErrors,
  initialJobPostFormValues,
  MAX_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_RECOMMENDED,
  MIN_DESCRIPTION_LENGTH,
  type JobPostFormValues,
  type JobPostValidationErrors,
  validateJobPostInput,
} from "@/lib/validation/job-post-schema";

const fieldClassName =
  "w-full rounded-[1.35rem] border bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/15";

const workModes = [
  { value: "unspecified", label: "Unspecified" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on-site", label: "On-site" },
] as const;

export function AnalysisForm() {
  const router = useRouter();
  const [formValues, setFormValues] = useState<JobPostFormValues>(
    initialJobPostFormValues,
  );
  const [fieldErrors, setFieldErrors] = useState<JobPostValidationErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "error" | "success">(
    "idle",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const descriptionLength = formValues.description.trim().length;
  const hasRecommendedLength = descriptionLength >= MIN_DESCRIPTION_LENGTH;

  function updateField<K extends keyof JobPostFormValues>(
    fieldName: K,
    value: JobPostFormValues[K],
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined,
    }));
    setFormMessage(null);
    setFormStatus("idle");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormMessage(null);

    const validationResult = validateJobPostInput(formValues);

    if (!validationResult.success) {
      setFieldErrors(getJobPostFieldErrors(validationResult));
      setFormStatus("error");
      setFormMessage(
        "Please fix the highlighted fields so Ghosted has enough structured context to analyze the posting.",
      );
      setIsSubmitting(false);
      return;
    }

    setFieldErrors({});

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validationResult.data),
      });

      const payload = (await response.json()) as {
        message?: string;
        fieldErrors?: JobPostValidationErrors;
        analysis?: AnalysisResult;
      };

      if (!response.ok) {
        setFieldErrors(payload.fieldErrors ?? {});
        setFormStatus("error");
        setFormMessage(
          payload.message ??
            "Ghosted could not validate this input yet. Please review the fields and try again.",
        );
        return;
      }

      if (!payload.analysis) {
        setFormStatus("error");
        setFormMessage(
          "Ghosted completed the request, but the analysis payload was missing. Please try again.",
        );
        return;
      }

      saveLatestAnalysis(payload.analysis);
      router.push("/results");
    } catch {
      setFormStatus("error");
      setFormMessage(
        "The validation request failed unexpectedly. Please try again in a moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      className="rounded-panel border border-border bg-surface p-8 shadow-panel backdrop-blur"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="jobTitle" className="text-sm font-medium text-slate-800">
            Job title
          </label>
          <input
            id="jobTitle"
            name="jobTitle"
            autoComplete="off"
            value={formValues.jobTitle}
            onChange={(event) => updateField("jobTitle", event.target.value)}
            className={`${fieldClassName} ${
              fieldErrors.jobTitle ? "border-warning" : "border-border"
            }`}
            placeholder="Senior Product Designer"
          />
          {fieldErrors.jobTitle ? (
            <p className="text-sm text-warning">{fieldErrors.jobTitle}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="companyName"
            className="text-sm font-medium text-slate-800"
          >
            Company name
          </label>
          <input
            id="companyName"
            name="companyName"
            autoComplete="organization"
            value={formValues.companyName}
            onChange={(event) => updateField("companyName", event.target.value)}
            className={`${fieldClassName} ${
              fieldErrors.companyName ? "border-warning" : "border-border"
            }`}
            placeholder="Northstar Health"
          />
          {fieldErrors.companyName ? (
            <p className="text-sm text-warning">{fieldErrors.companyName}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium text-slate-800">
            Location
          </label>
          <input
            id="location"
            name="location"
            autoComplete="address-level2"
            value={formValues.location}
            onChange={(event) => updateField("location", event.target.value)}
            className={`${fieldClassName} ${
              fieldErrors.location ? "border-warning" : "border-border"
            }`}
            placeholder="Boston, MA"
          />
          {fieldErrors.location ? (
            <p className="text-sm text-warning">{fieldErrors.location}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="datePosted" className="text-sm font-medium text-slate-800">
            Date posted
          </label>
          <input
            id="datePosted"
            name="datePosted"
            type="date"
            value={formValues.datePosted}
            onChange={(event) => updateField("datePosted", event.target.value)}
            className={`${fieldClassName} ${
              fieldErrors.datePosted ? "border-warning" : "border-border"
            }`}
          />
          <p className="text-xs leading-5 text-slate-500">
            Optional, but useful for freshness signals.
          </p>
          {fieldErrors.datePosted ? (
            <p className="text-sm text-warning">{fieldErrors.datePosted}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="salaryRangeText"
            className="text-sm font-medium text-slate-800"
          >
            Salary range text
          </label>
          <input
            id="salaryRangeText"
            name="salaryRangeText"
            autoComplete="off"
            value={formValues.salaryRangeText}
            onChange={(event) => updateField("salaryRangeText", event.target.value)}
            className={`${fieldClassName} ${
              fieldErrors.salaryRangeText ? "border-warning" : "border-border"
            }`}
            placeholder="$115,000 - $135,000 base"
          />
          <p className="text-xs leading-5 text-slate-500">
            Optional. Ghosted only checks whether pay information is present and
            concrete.
          </p>
          {fieldErrors.salaryRangeText ? (
            <p className="text-sm text-warning">{fieldErrors.salaryRangeText}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="workMode" className="text-sm font-medium text-slate-800">
            Work mode
          </label>
          <select
            id="workMode"
            name="workMode"
            value={formValues.workMode}
            onChange={(event) =>
              updateField(
                "workMode",
                event.target.value as JobPostFormValues["workMode"],
              )
            }
            className={`${fieldClassName} ${
              fieldErrors.workMode ? "border-warning" : "border-border"
            }`}
          >
            {workModes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.workMode ? (
            <p className="text-sm text-warning">{fieldErrors.workMode}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-slate-800">
          Full job description
        </label>
        <textarea
          id="description"
          name="description"
          value={formValues.description}
          onChange={(event) => updateField("description", event.target.value)}
          className={`${fieldClassName} min-h-64 resize-y ${
            fieldErrors.description ? "border-warning" : "border-border"
          }`}
          placeholder="Paste the full posting text here, including responsibilities, qualifications, and any salary or location language."
        />
        <div className="flex flex-col gap-1 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Paste enough text for context. {MIN_DESCRIPTION_LENGTH} characters is
            the minimum, and {MAX_DESCRIPTION_RECOMMENDED.toLocaleString()} or
            fewer is ideal for readability.
          </span>
          <span
            className={
              hasRecommendedLength ? "text-success" : "text-slate-500"
            }
          >
            {descriptionLength.toLocaleString()} /{" "}
            {MAX_DESCRIPTION_LENGTH.toLocaleString()}
          </span>
        </div>
        {fieldErrors.description ? (
          <p className="text-sm text-warning">{fieldErrors.description}</p>
        ) : null}
      </div>

      {formMessage ? (
        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm leading-6 ${
            formStatus === "success"
              ? "border-success/20 bg-green-50 text-success"
              : "border-warning/20 bg-orange-50 text-warning"
          }`}
        >
          {formMessage}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-slate-600">
          No account required. Paste the posting, run the analysis, and Ghosted
          will carry the result into the results view automatically.
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-600">
          Ghosted evaluates the posting itself. It does not score the applicant.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-[#10222b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173340] disabled:cursor-not-allowed disabled:opacity-65"
        >
          {isSubmitting ? "Analyzing..." : "Analyze Job Post"}
        </button>
      </div>
    </form>
  );
}
