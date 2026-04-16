import type { Metadata } from "next";
import { AnalysisShell } from "@/components/form/analysis-shell";

export const metadata: Metadata = {
  title: "Analyze a Job Post",
  description:
    "Paste a job posting into Ghosted and review the structured analysis inputs.",
};

export default function AnalyzePage() {
  return <AnalysisShell />;
}
