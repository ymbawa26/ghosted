import { extractJobPostFeatures } from "@/lib/analysis/feature-extraction";
import { METHODOLOGY_NOTE, WHY_THIS_MATTERS } from "@/lib/analysis/explanations";
import { scoreJobPost } from "@/lib/analysis/scoring";
import type { AnalysisResult, JobPostInput } from "@/lib/analysis/types";
import {
  getAuthenticityNote,
  getInterpretation,
  getSummaryVerdict,
} from "@/lib/analysis/verdict";
import { generateTopWarnings } from "@/lib/analysis/warnings";

export function analyzeJobPost(input: JobPostInput): AnalysisResult {
  const extractedFeatures = extractJobPostFeatures(input);
  const scores = scoreJobPost(extractedFeatures);
  const warnings = generateTopWarnings(extractedFeatures, scores);
  const interpretation = getInterpretation(scores);
  const summaryVerdict = getSummaryVerdict(scores, warnings);

  return {
    overview: {
      jobTitle: input.jobTitle,
      companyName: input.companyName,
      location: input.location,
      summaryVerdict,
      interpretation,
      authenticityNote: getAuthenticityNote(scores, extractedFeatures),
      compensationNote: extractedFeatures.compensationNote,
    },
    scores,
    warnings,
    whyThisMatters: WHY_THIS_MATTERS,
    methodologyNote: METHODOLOGY_NOTE,
    extractedFeatures,
  };
}
