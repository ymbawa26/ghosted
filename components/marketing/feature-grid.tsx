const cards = [
  {
    eyebrow: "Seriousness",
    title: "Is someone actually managing this opening?",
    text:
      "Freshness, structure, and specificity help separate active hiring efforts from neglected postings.",
  },
  {
    eyebrow: "Transparency",
    title: "Does the posting provide useful information?",
    text:
      "Ghosted rewards concrete details such as salary signals, role scope, location clarity, and reporting context.",
  },
  {
    eyebrow: "Requirement Inflation",
    title: "Are the asks realistic for the title?",
    text:
      "It checks for title-seniority mismatch, excessive experience demands, and overloaded skill lists.",
  },
  {
    eyebrow: "Applicant ROI",
    title: "Should most applicants spend time here?",
    text:
      "The app highlights low-value signals that can make a role real, but still not worth the application effort.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-content px-6 py-12 sm:px-8 lg:px-10 lg:py-20">
      <div className="grid gap-6 lg:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-panel border border-border bg-surface p-8 shadow-panel backdrop-blur"
          >
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-accent">
              {card.eyebrow}
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              {card.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              {card.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
