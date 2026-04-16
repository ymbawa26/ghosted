import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How Ghosted uses structured, explainable signals to assess job-post quality.",
};

const sections = [
  {
    title: "Explainable by design",
    body:
      "Ghosted is built around deterministic signals such as freshness, salary transparency, rough compensation positioning, role scope, requirement breadth, repost clues, AI-style filler language, and wording clarity. Every score is tied to signals that can be shown back to the user.",
  },
  {
    title: "Focused on the posting, not the person",
    body:
      "Ghosted does not evaluate applicant fit, resumes, interview ability, or likelihood of getting hired. It only assesses the quality and usefulness of the posting itself.",
  },
  {
    title: "Careful language",
    body:
      "Ghosted does not claim a job is fake. It highlights warning signs commonly associated with low-transparency, stale, inflated, or low-value postings.",
  },
  {
    title: "MVP limitations",
    body:
      "This first version relies on structured rule-based analysis of manually pasted job text. Rough compensation comparisons are heuristic and should be treated as directional only. It should be treated as decision support, not certainty or legal/compliance advice.",
  },
];

export default function MethodologyPage() {
  return (
    <section className="mx-auto max-w-content px-6 py-16 sm:px-8 lg:px-10">
      <div className="max-w-3xl">
        <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-accent">
          Methodology
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:text-5xl">
          Serious analysis, honest limitations.
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-700">
          Ghosted helps applicants interpret posting quality using structured,
          explainable signals. It does not guarantee outcomes, and it does not
          make accusations about employers.
        </p>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-panel border border-border bg-surface p-8 shadow-panel backdrop-blur"
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              {section.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              {section.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
