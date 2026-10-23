import { Check, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { leetcodeUrl, type RoadmapProblem } from "@/lib/dsa-roadmap";

type Difficulty = "Easy" | "Medium" | "Hard" | "Beginner" | "Intermediate" | "Advanced";

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  Hard: "text-rose-400 bg-rose-500/10 border-rose-500/25",
  Advanced: "text-rose-400 bg-rose-500/10 border-rose-500/25",
};

export function DifficultyBadge({ value }: { value: Difficulty }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${DIFFICULTY_CLASS[value]}`}
    >
      {value}
    </span>
  );
}

export function ProgressBar({ percent, className = "" }: { percent: number; className?: string }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-surface-2 ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: "var(--gradient-gold)" }}
      />
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </h4>
  );
}

export function SolvedCheckbox({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`Mark "${label}" as ${checked ? "unsolved" : "solved"}`}
      onClick={onToggle}
      className={`grid h-5 w-5 shrink-0 cursor-pointer place-items-center rounded-md border transition ${
        checked
          ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-400"
          : "border-border bg-surface hover:border-primary/60"
      }`}
    >
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </button>
  );
}

export function ProblemList({
  problems,
  isSolved,
  onToggle,
}: {
  problems: RoadmapProblem[];
  isSolved: (id: string) => boolean;
  onToggle: (id: string) => void;
}) {
  if (problems.length === 0) return null;

  return (
    <ul className="divide-y divide-border/50 overflow-hidden rounded-xl border border-border/60 bg-surface/50">
      {problems.map((problem) => {
        const solved = isSolved(problem.id);
        return (
          <li key={problem.id} className="flex items-center gap-3 px-3 py-2.5">
            <SolvedCheckbox
              checked={solved}
              label={problem.title}
              onToggle={() => onToggle(problem.id)}
            />
            <a
              href={leetcodeUrl(problem.id)}
              target="_blank"
              rel="noopener noreferrer"
              className={`min-w-0 flex-1 truncate text-sm transition hover:text-primary ${
                solved ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {problem.title}
            </a>
            <DifficultyBadge value={problem.difficulty} />
            <a
              href={leetcodeUrl(problem.id)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${problem.title} on LeetCode`}
              className="text-muted-foreground transition hover:text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
