"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readLatestAnalysis } from "@/lib/analysis/session";
import type { AnalysisResult, ScoreBreakdown, ScoreKey } from "@/lib/analysis/types";

const scoreOrder: Array<{ key: ScoreKey; label: string }> = [
  { key: "seriousness", label: "Seriousness" },
  { key: "transparency", label: "Transparency" },
  { key: "requirementInflation", label: "Requirement Inflation" },
  { key: "clarity", label: "Clarity" },
  { key: "applicantRoi", label: "Applicant ROI" },
];

function getScoreTone(scoreKey: ScoreKey, score: number) {
  if (scoreKey === "requirementInflation") {
    if (score >= 70) {
      return {
        accent: "text-warning",
        badge: "bg-orange-50 text-warning border-warning/20",
        meter: "bg-warning",
      };
    }

    if (score >= 45) {
      return {
        accent: "text-slate-700",
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        meter: "bg-slate-500",
      };
    }

    return {
      accent: "text-success",
      badge: "bg-green-50 text-success border-success/20",
      meter: "bg-success",
    };
  }

  if (score >= 75) {
    return {
      accent: "text-success",
      badge: "bg-green-50 text-success border-success/20",
      meter: "bg-success",
    };
  }

  if (score >= 55) {
    return {
      accent: "text-accent",
      badge: "bg-cyan-50 text-accent border-cyan-100",
      meter: "bg-accent",
    };
  }

  if (score >= 35) {
    return {
      accent: "text-warning",
      badge: "bg-orange-50 text-warning border-warning/20",
      meter: "bg-warning",
    };
  }

  return {
    accent: "text-red-700",
    badge: "bg-red-50 text-red-700 border-red-100",
    meter: "bg-red-700",
  };
}

function ScoreCard({
  label,
  scoreKey,
  detail,
}: {
  label: string;
  scoreKey: ScoreKey;
  detail: ScoreBreakdown;
}) {
  const tone = getScoreTone(scoreKey, detail.score);

  return (
    <article className="rounded-panel border border-border bg-surface p-6 shadow-panel backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{label}</h2>
          {scoreKey === "requirementInflation" ? (
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
              Higher means more inflation risk
            </p>
          ) : null}
        </div>
        <div
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${tone.badge}`}
        >
          {detail.score}
        </div>
      </div>
      <div className="mt-5 h-2 rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${tone.meter}`}
          style={{ width: `${detail.score}%` }}
        />
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-700">{detail.explanation}</p>
      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Contributing Signals
          </p>
          {detail.contributingSignals.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {detail.contributingSignals.map((signal) => (
                <li key={signal}>- {signal}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              No major positive signals dominated this score.
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Warnings
          </p>
          {detail.warnings.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {detail.warnings.map((warning) => (
                <li key={warning}>- {warning}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              No major warning signals dominated this score.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export function ResultsView() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAnalysis(readLatestAnalysis());
      setHasLoaded(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!hasLoaded) {
    return (
      <section className="mx-auto max-w-content px-6 py-16 sm:px-8 lg:px-10">
        <div className="rounded-panel border border-border bg-surface p-8 shadow-panel backdrop-blur">
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-accent">
            Loading
          </p>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            Pulling the most recent Ghosted analysis into view.
          </p>
        </div>
      </section>
    );
  }

  if (!analysis) {
    return (
      <section className="mx-auto max-w-content px-6 py-16 sm:px-8 lg:px-10">
        <div className="rounded-panel border border-border bg-surface p-8 shadow-panel backdrop-blur">
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-accent">
            No Analysis Yet
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-slate-950 sm:text-5xl">
            Run an analysis to see the score breakdown.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            Ghosted stores the latest result in this browser session for the MVP.
            Paste a job post on the analysis page and you&apos;ll land back here with
            the full scorecard.
          </p>
          <Link
            href="/analyze"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#10222b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173340]"
          >
            Analyze a Job Post
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-content px-6 py-16 sm:px-8 lg:px-10">
      <div className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr]">
        <aside className="space-y-6">
          <div className="rounded-panel border border-border bg-[#10222b] p-8 text-slate-100 shadow-panel">
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate-300">
              Overview
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-white">
              {analysis.overview.jobTitle}
            </h1>
            <p className="mt-2 text-lg text-slate-300">
              {analysis.overview.companyName} | {analysis.overview.location}
            </p>
            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-[#f3efe7]">
              {analysis.overview.interpretation}
            </div>
            <p className="mt-6 text-sm leading-7 text-slate-300">
              {analysis.overview.summaryVerdict}
            </p>
          </div>

          <div className="rounded-panel border border-border bg-surface p-8 shadow-panel backdrop-blur">
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.28em] text-accent">
              Top Warning Flags
            </p>
            {analysis.warnings.length > 0 ? (
              <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
                {analysis.warnings.map((warning) => (
                  <li key={warning}>- {warning}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm leading-7 text-slate-700">
                No top-tier warning flags dominated this analysis.
              </p>
            )}
          </div>

          <div className="rounded-panel border border-border bg-surface p-8 shadow-panel backdrop-blur">
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.28em] text-accent">
              Why This Matters
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              {analysis.whyThisMatters}
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              {analysis.methodologyNote}
            </p>
          </div>
        </aside>

        <div className="grid gap-6 md:grid-cols-2">
          {scoreOrder.map((scoreEntry) => (
            <ScoreCard
              key={scoreEntry.key}
              label={scoreEntry.label}
              scoreKey={scoreEntry.key}
              detail={analysis.scores[scoreEntry.key]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
