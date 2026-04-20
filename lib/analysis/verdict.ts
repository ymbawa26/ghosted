import type { AnalysisScores, ExtractedFeatures } from "@/lib/analysis/types";

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
    return "Likely authentic, but mixed value";
  }

  if (
    scores.requirementInflation.score >= 65 ||
    scores.clarity.score < 50 ||
    scores.transparency.score < 50
  ) {
    return "Likely authentic, but high-friction";
  }

  if (scores.seriousness.score < 45 || scores.transparency.score < 40) {
    return "Hard to assess from the posting";
  }

  return "Low transparency and likely low efficiency";
}

export function getSummaryVerdict(scores: AnalysisScores, warnings: string[]) {
  const interpretation = getInterpretation(scores);

  switch (interpretation) {
    case "Looks promising":
      return "This posting looks reasonably serious and transparent, with fewer signs of inflated or low-value application effort.";
    case "Likely authentic, but mixed value":
      return `This posting has enough substance to review further, but ${warnings[0]?.toLowerCase() ?? "a few weaker signals"} may reduce confidence.`;
    case "Likely authentic, but high-friction":
      return `This posting shows warning signs that could make the application process inefficient, especially around ${
        warnings[0]?.toLowerCase() ?? "scope and clarity"
      }.`;
    case "Hard to assess from the posting":
      return "The role may still be real, but the posting leaves too little fresh or concrete information to judge with much confidence.";
    default:
      return "The posting appears low-transparency and may be low-value for applicants unless you already have a strong reason to pursue it.";
  }
}

export function getAuthenticityNote(
  scores: AnalysisScores,
  features: ExtractedFeatures,
) {
  if (
    scores.seriousness.score >= 70 &&
    !features.oldButUrgentMismatch &&
    !features.repostConcernSignal
  ) {
    return "Authenticity lean: this still reads more like a real, actively managed opening than a ghost listing.";
  }

  if (scores.seriousness.score >= 52) {
    return "Authenticity lean: this still leans more authentic than not, but the post quality is mixed.";
  }

  return "Authenticity lean: the role may still be authentic, but the posting leaves more uncertainty than ideal.";
}
