export function SiteFooter() {
  return (
    <footer className="border-t border-black/5">
      <div className="mx-auto flex max-w-content flex-col gap-3 px-6 py-8 text-sm text-slate-600 sm:px-8 lg:px-10 lg:flex-row lg:items-center lg:justify-between">
        <p>Ghosted evaluates job postings, not applicants.</p>
        <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.24em] text-slate-500">
          Explainable posting intelligence
        </p>
      </div>
    </footer>
  );
}
