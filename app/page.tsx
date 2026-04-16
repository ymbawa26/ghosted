import Link from "next/link";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Hero } from "@/components/marketing/hero";

const promisePoints = [
  "Evaluates the posting itself, not the applicant",
  "Flags low-transparency, stale, inflated, and vague listings",
  "Uses explainable scoring instead of opaque AI guesses",
];

export default function HomePage() {
  return (
    <div className="grid-overlay">
      <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-content flex-col justify-center px-6 py-16 sm:px-8 lg:px-10">
        <Hero />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-panel border border-border bg-surface p-8 shadow-panel backdrop-blur">
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-accent">
              What Ghosted Does
            </p>
            <ul className="mt-6 space-y-4 text-base leading-7 text-slate-700">
              {promisePoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-accent" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-panel border border-border bg-[#10222b] p-8 text-slate-100 shadow-panel">
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate-300">
              Why It Exists
            </p>
            <p className="mt-5 text-2xl font-semibold text-balance">
              Most tools judge applicants. Ghosted judges job postings.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Use Ghosted to decide whether a role looks well-scoped,
              transparent, current, and worth the effort of applying.
            </p>
            <Link
              href="/analyze"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-[#f1ede4] px-5 py-3 text-sm font-semibold text-[#10222b] transition hover:bg-white"
            >
              Analyze a Job Post
            </Link>
          </div>
        </div>
      </section>
      <FeatureGrid />
    </div>
  );
}
