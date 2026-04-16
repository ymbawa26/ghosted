import type { AnalysisScores, ExtractedFeatures } from "@/lib/analysis/types";

type WarningCandidate = {
  text: string;
  severity: number;
};

export function generateTopWarnings(
  features: ExtractedFeatures,
  scores: AnalysisScores,
) {
  const candidates: WarningCandidate[] = [];

  if (!features.hasSalary) {
    candidates.push({ text: "Missing salary transparency", severity: 9 });
  }

  if (!features.hasClearResponsibilities) {
    candidates.push({ text: "Vague responsibilities", severity: 9 });
  }

  if (features.juniorTitleWithHighExperience) {
    candidates.push({
      text: "Entry-level or junior framing with inflated experience requirements",
      severity: 10,
    });
  }

  if (features.tooManyRequiredSkills) {
    candidates.push({
      text: "Too many required tools or skills for the likely seniority",
      severity: 8,
    });
  }

  if (
    typeof features.jobPostAgeDays === "number" &&
    features.jobPostAgeDays > 60
  ) {
    candidates.push({ text: "Stale-looking posting age", severity: 8 });
  }

  if (features.oldButUrgentMismatch) {
    candidates.push({
      text: "Urgent hiring language paired with an older posting date",
      severity: 8,
    });
  }

  if (features.contradictoryLocationLanguage) {
    candidates.push({
      text: "Contradictory remote, hybrid, or on-site wording",
      severity: 9,
    });
  }

  if (features.unclearBusinessContext) {
    candidates.push({
      text: "Limited team or business context",
      severity: 7,
    });
  }

  if (scores.clarity.score < 45 && features.vagueBuzzwordDensity >= 2.5) {
    candidates.push({
      text: "Buzzword-heavy language with limited specifics",
      severity: 7,
    });
  }

  return candidates
    .sort((left, right) => right.severity - left.severity)
    .slice(0, 5)
    .map((candidate) => candidate.text);
}
