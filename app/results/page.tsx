import type { Metadata } from "next";
import { ResultsShell } from "@/components/results/results-shell";

export const metadata: Metadata = {
  title: "Results",
  description:
    "Ghosted results page for scorecards, warnings, and explainable job-post analysis.",
};

export default function ResultsPage() {
  return <ResultsShell />;
}
