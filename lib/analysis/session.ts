import type { AnalysisResult } from "@/lib/analysis/types";

export const LATEST_ANALYSIS_STORAGE_KEY = "ghosted.latest-analysis";

export function saveLatestAnalysis(analysis: AnalysisResult) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    LATEST_ANALYSIS_STORAGE_KEY,
    JSON.stringify(analysis),
  );
}

export function readLatestAnalysis() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawAnalysis = window.sessionStorage.getItem(LATEST_ANALYSIS_STORAGE_KEY);

  if (!rawAnalysis) {
    return null;
  }

  try {
    return JSON.parse(rawAnalysis) as AnalysisResult;
  } catch {
    return null;
  }
}
