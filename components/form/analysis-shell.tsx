import { AnalysisForm } from "@/components/form/analysis-form";

export function AnalysisShell() {
  return (
    <section className="mx-auto max-w-content px-6 py-16 sm:px-8 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-xl">
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-accent">
            Analysis Input
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-slate-950 sm:text-5xl">
            Paste the posting. We&apos;ll evaluate the listing itself.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            Add the core details you know and paste the full job description.
            Ghosted uses this structured input to judge the quality of the
            posting, not the quality of the applicant.
          </p>
          <div className="mt-8 rounded-panel border border-border bg-[#10222b] p-6 text-slate-100 shadow-panel">
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.28em] text-slate-300">
              MVP Guardrails
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <li>Manual paste only. No scraping or LinkedIn automation.</li>
              <li>Ghosted evaluates postings, not the applicant.</li>
              <li>Results are careful, explainable, and non-defamatory.</li>
            </ul>
          </div>
          <div className="mt-6 rounded-panel border border-border bg-white/70 p-6 shadow-panel">
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.28em] text-accent">
              Validation Standards
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              <li>Required fields must be present and trimmed cleanly.</li>
              <li>Date posted cannot be future-dated.</li>
              <li>Descriptions must be long enough to support analysis.</li>
              <li>Very long pasted text is accepted up to a safe upper bound.</li>
            </ul>
          </div>
        </div>
        <AnalysisForm />
      </div>
    </section>
  );
}
