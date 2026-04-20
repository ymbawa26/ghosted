"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveLatestAnalysis } from "@/lib/analysis/session";
import type { AnalysisResult, LocationCountry } from "@/lib/analysis/types";
import {
  LOCATION_COUNTRIES,
  LOCATION_REGION_OPTIONS,
} from "@/lib/validation/location-options";
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

function getRegionLabel(country: LocationCountry) {
  switch (country) {
    case "United States":
      return "State";
    case "Canada":
      return "Province";
    case "Australia":
      return "State / territory";
    default:
      return "Region";
  }
}

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
  const regionOptions = LOCATION_REGION_OPTIONS[formValues.locationCountry];

  function updateField<K extends keyof JobPostFormValues>(
    fieldName: K,
    value: JobPostFormValues[K],
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
      ...(fieldName === "locationCountry"
        ? { locationRegion: "", locationCity: "" }
        : {}),
      ...(fieldName === "salaryNotListed" && value === true
        ? { salaryRangeText: "" }
        : {}),
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined,
      ...(fieldName === "locationCountry"
        ? { locationRegion: undefined, locationCity: undefined }
        : {}),
      ...(fieldName === "salaryNotListed"
        ? { salaryRangeText: undefined }
        : {}),
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
          <label
            htmlFor="locationCountry"
            className="text-sm font-medium text-slate-800"
          >
            Country
          </label>
          <select
            id="locationCountry"
            name="locationCountry"
            value={formValues.locationCountry}
            onChange={(event) =>
              updateField(
                "locationCountry",
                event.target.value as JobPostFormValues["locationCountry"],
              )
            }
            className={`${fieldClassName} ${
              fieldErrors.locationCountry ? "border-warning" : "border-border"
            }`}
          >
            {LOCATION_COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {fieldErrors.locationCountry ? (
            <p className="text-sm text-warning">{fieldErrors.locationCountry}</p>
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
            htmlFor="locationRegion"
            className="text-sm font-medium text-slate-800"
          >
            {getRegionLabel(formValues.locationCountry)}
          </label>
          {regionOptions ? (
            <select
              id="locationRegion"
              name="locationRegion"
              value={formValues.locationRegion}
              onChange={(event) => updateField("locationRegion", event.target.value)}
              className={`${fieldClassName} ${
                fieldErrors.locationRegion ? "border-warning" : "border-border"
              }`}
            >
              <option value="">Select {getRegionLabel(formValues.locationCountry).toLowerCase()}</option>
              {regionOptions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="locationRegion"
              name="locationRegion"
              autoComplete="address-level1"
              value={formValues.locationRegion}
              onChange={(event) => updateField("locationRegion", event.target.value)}
              className={`${fieldClassName} ${
                fieldErrors.locationRegion ? "border-warning" : "border-border"
              }`}
              placeholder="State, region, or province"
            />
          )}
          {fieldErrors.locationRegion ? (
            <p className="text-sm text-warning">{fieldErrors.locationRegion}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="locationCity"
            className="text-sm font-medium text-slate-800"
          >
            City
          </label>
          <input
            id="locationCity"
            name="locationCity"
            autoComplete="address-level2"
            value={formValues.locationCity}
            onChange={(event) => updateField("locationCity", event.target.value)}
            className={`${fieldClassName} ${
              fieldErrors.locationCity ? "border-warning" : "border-border"
            }`}
            placeholder="Boston"
          />
          <p className="text-xs leading-5 text-slate-500">
            Optional, but helpful for location-specific salary comparisons.
          </p>
          {fieldErrors.locationCity ? (
            <p className="text-sm text-warning">{fieldErrors.locationCity}</p>
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
            disabled={formValues.salaryNotListed}
          />
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={formValues.salaryNotListed}
              onChange={(event) =>
                updateField("salaryNotListed", event.target.checked)
              }
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            Salary was not listed in the post
          </label>
          <p className="text-xs leading-5 text-slate-500">
            Ghosted can also estimate whether a listed salary looks below,
            within, or above a rough market range.
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
        <div className="space-y-2 sm:col-span-2">
          <div className="rounded-[1.35rem] border border-border bg-white px-4 py-4">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={formValues.isReposted}
                onChange={(event) => updateField("isReposted", event.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              Mark this as reposted if you already know the listing has been renewed or posted again
            </label>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Ghosted will also check the pasted text itself for repost signals, so
              this is optional.
            </p>
          </div>
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
          will carry the result into the results view automatically. The scoring
          engine also checks the post for AI-style filler, repost clues,
          compensation realism, hiring-process clarity, and more.
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
