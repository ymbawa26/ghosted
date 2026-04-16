import Link from "next/link";

export function Hero() {
  return (
    <div className="max-w-4xl">
      <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.34em] text-accent">
        Public-facing Job-post Intelligence
      </p>
      <h1 className="mt-5 text-5xl font-semibold tracking-tight text-balance text-slate-950 sm:text-6xl lg:text-7xl">
        See whether a job posting looks worth your time.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
        Ghosted evaluates posting quality using structured signals for
        seriousness, transparency, requirement inflation, clarity, and
        applicant ROI.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/analyze"
          className="inline-flex items-center justify-center rounded-full bg-[#10222b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173340]"
        >
          Analyze a Job Post
        </Link>
        <Link
          href="/methodology"
          className="inline-flex items-center justify-center rounded-full border border-border bg-white/60 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
        >
          Review Methodology
        </Link>
      </div>
    </div>
  );
}
