import { useState } from "react";
import { Check, Copy, Info, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  type CategoryKey,
  type ReqStatus,
  type ResumeReview,
} from "@/lib/resume-review-types";

const STATUS_LABEL: Record<ReqStatus, string> = {
  verified: "Verified",
  related: "Related",
  not_found: "Not found",
  unclear: "Unclear",
};

const STATUS_CLASS: Record<ReqStatus, string> = {
  verified: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  related: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  not_found: "border-border bg-surface-2 text-muted-foreground",
  unclear: "border-border bg-surface-2 text-muted-foreground",
};

function StatusPill({ status }: { status: ReqStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function Section({
  title,
  children,
  hint,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-8 sm:pt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
      aria-label="Copy suggested text"
    >
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

export function ReportView({
  review,
  onNewReview,
}: {
  review: ResumeReview;
  onNewReview: () => void;
}) {
  const reviewed = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const reqs = review.jobMatch?.requirements ?? [];
  const counts = {
    total: reqs.length,
    verified: reqs.filter((r) => r.status === "verified").length,
    related: reqs.filter((r) => r.status === "related").length,
    missing: reqs.filter((r) => r.status === "not_found" || r.status === "unclear").length,
  };

  return (
    <div className="animate-fade-in space-y-8 sm:space-y-10">
      {/* Header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <p className="resume-kicker">Analysis complete</p>
          <h1 className="mt-2 truncate text-2xl font-semibold sm:text-3xl">Resume Review</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {review.candidate.name ?? review.resumeFileName}
            {review.candidate.title ? ` · ${review.candidate.title}` : ""} · Reviewed {reviewed}
          </p>
        </div>
        <Button className="resume-secondary-button shrink-0" variant="outline" onClick={onNewReview}>
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Review another</span>
        </Button>
      </header>

      {/* Score + summary */}
      <div className="resume-panel grid gap-6 p-5 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:p-7">
        <div className="shrink-0 border-b border-border pb-5 sm:border-r sm:border-b-0 sm:pb-0 sm:pr-6">
          <p className="resume-kicker">Resume score</p>
          <p className="mt-2 text-4xl font-semibold tabular-nums">
            {review.overallScore}
            <span className="text-sm font-normal text-muted-foreground"> / 100</span>
          </p>
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-primary" /> Overall summary</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{review.summary}</p>
        </div>
      </div>

      {/* Resume health */}
      <Section title="Resume Health">
        <div className="space-y-3">
          {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((k) => {
            const v = review.categoryScores[k];
            return (
              <div key={k} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[190px_minmax(0,1fr)_44px]">
                <span className="text-sm">{CATEGORY_LABELS[k]}</span>
                <div className="resume-progress col-span-2 h-2 overflow-hidden rounded-full sm:col-span-1">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ${v >= 80 ? "bg-emerald-500" : v >= 60 ? "resume-progress-fill" : "bg-red-500"}`}
                    style={{ width: `${v}%` }}
                  />
                </div>
                <span className="text-sm tabular-nums text-muted-foreground sm:text-right">{v}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Strengths */}
      {review.strengths.length ? (
        <Section title="Strengths">
          <ul className="space-y-2">
            {review.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Improvements */}
      {review.improvements.length ? (
        <Section title="Areas to Improve">
          <div className="space-y-4">
            {review.improvements.map((im, i) => (
              <div key={i} className="resume-file-row p-4 sm:p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {im.category}
                </p>
                <p className="mt-1.5 text-sm font-medium">{im.issue}</p>
                {im.why ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">Why it matters: {im.why}</p>
                ) : null}
                {im.recommendation ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Recommendation: {im.recommendation}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Job match */}
      {review.jobMatch && reqs.length ? (
        <Section
          title="Job Match"
          hint={review.jobMatch.role ? `Role: ${review.jobMatch.role}` : undefined}
        >
          <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Requirements checked", counts.total],
              ["Verified", counts.verified],
              ["Related", counts.related],
              ["Not found", counts.missing],
            ].map(([label, value]) => (
              <div key={label as string} className="resume-file-row px-4 py-3">
                <p className="text-xl font-semibold tabular-nums">{value as number}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{label as string}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Requirement</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Resume evidence</th>
                </tr>
              </thead>
              <tbody>
                {reqs.map((r, i) => (
                  <tr key={i} className="border-b border-border/60 align-top">
                    <td className="py-3 pr-4">{r.requirement}</td>
                    <td className="py-3 pr-4">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {r.evidence ? `"${r.evidence}"` : (r.note ?? "Not found in resume.")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {counts.missing ? (
            <div className="resume-file-row mt-6 p-4 sm:p-5">
              <p className="text-sm font-medium">Missing or unverified requirements</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {reqs
                  .filter((r) => r.status === "not_found" || r.status === "unclear")
                  .map((r, i) => (
                    <li key={i}>• {r.requirement}</li>
                  ))}
              </ul>
              <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                These were not found in the resume. That does not mean the skill is absent — adding
                it explicitly, if you have it, would make it verifiable.
              </p>
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* Rewrites */}
      {review.rewrites.length ? (
        <Section title="Suggested Improvements">
          <div className="space-y-4">
            {review.rewrites.map((rw, i) => (
              <div key={i} className="resume-file-row p-4 sm:p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{rw.current}</p>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Suggested
                    </p>
                    <p className="mt-1 text-sm">{rw.suggested}</p>
                  </div>
                  <CopyButton text={rw.suggested} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Skills */}
      {review.skillGroups.length ? (
        <Section title="Skills found in your resume">
          <div className="space-y-3">
            {review.skillGroups.map((g) => (
              <div key={g.group} className="sm:grid sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                <p className="text-sm font-medium">{g.group}</p>
                <p className="mt-1 text-sm text-muted-foreground sm:mt-0">{g.skills.join(", ")}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Section notes */}
      {review.sectionNotes.length ? (
        <Section title="Detailed review">
          <div className="space-y-3">
            {review.sectionNotes.map((s, i) => (
              <div key={i} className="sm:grid sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                <p className="text-sm font-medium">{s.section}</p>
                <p className="mt-1 text-sm text-muted-foreground sm:mt-0">{s.note}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
