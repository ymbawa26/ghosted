import type { AnalysisScores } from "@/lib/analysis/types";

export function getInterpretation(scores: AnalysisScores) {
  if (
    scores.applicantRoi.score >= 75 &&
    scores.seriousness.score >= 68 &&
    scores.transparency.score >= 65 &&
    scores.clarity.score >= 65 &&
    scores.requirementInflation.score <= 45
  ) {
    return "Looks promising";
  }

  if (scores.applicantRoi.score >= 60 && scores.requirementInflation.score <= 60) {
    return "Proceed carefully";
  }

  if (
    scores.requirementInflation.score >= 65 ||
    scores.clarity.score < 50 ||
    scores.transparency.score < 50
  ) {
    return "Likely high-friction";
  }

  if (scores.seriousness.score < 45 || scores.transparency.score < 40) {
    return "Apply only if strongly interested";
  }

  return "Low transparency and likely low efficiency";
}

export function getSummaryVerdict(scores: AnalysisScores, warnings: string[]) {
  const interpretation = getInterpretation(scores);

  switch (interpretation) {
    case "Looks promising":
      return "This posting looks reasonably serious and transparent, with fewer signs of inflated or low-value application effort.";
    case "Proceed carefully":
      return `This posting has enough substance to review further, but ${warnings[0]?.toLowerCase() ?? "a few weaker signals"} may reduce confidence.`;
    case "Likely high-friction":
      return `This posting shows warning signs that could make the application process inefficient, especially around ${
        warnings[0]?.toLowerCase() ?? "scope and clarity"
      }.`;
    case "Apply only if strongly interested":
      return "The role may still be real, but the posting gives limited confidence that most applicants will get an efficient or well-scoped process.";
    default:
      return "The posting appears low-transparency and may be low-value for applicants unless you already have a strong reason to pursue it.";
  }
}
