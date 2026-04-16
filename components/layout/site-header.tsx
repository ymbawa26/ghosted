import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: "/results", label: "Results" },
  { href: "/methodology", label: "Methodology" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-[#f7f4ec]/85 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-[#10222b] text-sm font-semibold uppercase tracking-[0.22em] text-[#f1ede4]">
            G
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-950">
              Ghosted
            </p>
            <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-slate-500">
              Evaluate the job post
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-2 rounded-full border border-border bg-white/60 p-1 text-sm text-slate-700 shadow-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 transition hover:bg-[#10222b] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
