import { Check, FileSearch, Loader2 } from "lucide-react";

export type Stage = { id: string; label: string };

export function ScanningStep({
  stages,
  activeIndex,
}: {
  stages: Stage[];
  activeIndex: number;
}) {
  const pct = Math.round((Math.min(activeIndex, stages.length) / stages.length) * 100);

  return (
    <section className="resume-processing animate-fade-in mx-auto grid max-w-4xl gap-8 p-5 sm:p-8 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:items-center md:gap-12">
      {/* Document with scan line */}
      <div className="mx-auto w-full max-w-[260px]">
        <div className="resume-document relative aspect-[4/5] overflow-hidden p-6">
          <div className="mb-5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <FileSearch className="h-4 w-4" /> Document preview
          </div>
          <div className="space-y-2.5">
            <div className="h-2.5 w-2/5 rounded-sm bg-foreground/25" />
            <div className="h-1.5 w-3/5 rounded-sm bg-foreground/12" />
            <div className="h-px w-full bg-border" />
            {[
              "w-full",
              "w-11/12",
              "w-4/5",
              "w-full",
              "w-3/5",
              "w-full",
              "w-10/12",
              "w-2/3",
              "w-full",
              "w-1/2",
            ].map((w, i) => (
              <div key={i} className={`h-1.5 rounded-sm bg-foreground/10 ${w}`} />
            ))}
          </div>
          <div
            className="resume-scan-line pointer-events-none absolute inset-x-0 h-px"
            style={{ animation: "resume-scan 2.4s ease-in-out infinite" }}
            aria-hidden
          />
        </div>
      </div>

      {/* Checklist */}
      <div>
        <p className="resume-kicker">Analysis in progress</p>
        <h2 className="mt-2 text-2xl font-semibold">Reviewing your resume</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Your document is being read and evaluated securely.</p>

        <div
          className="resume-progress mt-7 h-2 w-full overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Review progress"
        >
          <div
            className="resume-progress-fill h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(pct, 6)}%` }}
          />
        </div>
        <p className="mt-2 text-right text-xs font-medium tabular-nums text-muted-foreground">{pct}% complete</p>

        <ul className="mt-6 space-y-3">
          {stages.map((s, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            return (
              <li key={s.id} className={`resume-stage flex items-center gap-3 text-sm ${done ? "is-done" : active ? "is-active" : ""}`}>
                <span
                  className="resume-stage-icon grid h-6 w-6 shrink-0 place-items-center rounded-full border"
                >
                  {done ? (
                    <Check className="h-3 w-3" />
                  ) : active ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                </span>
                <span
                  className={
                    done || active ? "text-foreground" : "text-muted-foreground/70"
                  }
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
