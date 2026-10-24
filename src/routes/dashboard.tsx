import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Award,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Flame,
  FileText,
  Loader2,
  MessagesSquare,
  ScanSearch,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuthUser } from "@/hooks/useAuthUser";
import { dsaTopics, getAllLevels } from "@/lib/dsa-curriculum";
import { AuthModal } from "@/components/AuthModal";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — Nexora" }] }),
  component: DashboardPage,
});

type DashboardData = {
  assessments: Tables<"skill_assessments">[];
  assessmentResults: Pick<Tables<"assessment_results">, "weak_topics" | "strengths">[];
  interviews: Tables<"mock_interviews">[];
  interviewReports: Pick<Tables<"interview_reports">, "strengths" | "weaknesses">[];
  dsaLevels: Tables<"dsa_level_progress">[];
  dsaAttempts: Tables<"dsa_quiz_attempts">[];
  solved: Tables<"dsa_solved_problems">[];
  reviews: Pick<Tables<"resume_reviews">, "id" | "file_name" | "overall_score" | "created_at">[];
  resumes: Pick<Tables<"resumes">, "id" | "updated_at">[];
};

async function loadDashboard(userId: string): Promise<DashboardData> {
  const own = <T,>(q: { data: T[] | null; error: unknown }) => {
    if (q.error) console.warn("Dashboard query failed", q.error);
    return q.data ?? [];
  };
  const [a, ar, i, ir, dl, da, s, rv, rs] = await Promise.all([
    supabase.from("skill_assessments").select("*").eq("user_id", userId).order("completed_at"),
    supabase.from("assessment_results").select("weak_topics, strengths").eq("user_id", userId),
    supabase.from("mock_interviews").select("*").eq("user_id", userId).order("completed_at"),
    supabase.from("interview_reports").select("strengths, weaknesses").eq("user_id", userId),
    supabase.from("dsa_level_progress").select("*").eq("user_id", userId),
    supabase.from("dsa_quiz_attempts").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("dsa_solved_problems").select("*").eq("user_id", userId),
    supabase
      .from("resume_reviews")
      .select("id, file_name, overall_score, created_at")
      .eq("user_id", userId)
      .order("created_at"),
    supabase.from("resumes").select("id, updated_at").eq("user_id", userId),
  ]);
  return {
    assessments: own(a),
    assessmentResults: own(ar),
    interviews: own(i),
    interviewReports: own(ir),
    dsaLevels: own(dl),
    dsaAttempts: own(da),
    solved: own(s),
    reviews: own(rv),
    resumes: own(rs),
  };
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
const avg = (xs: number[]) =>
  xs.length ? Math.round(xs.reduce((s, x) => s + x, 0) / xs.length) : null;

// Count how often each string appears across JSON arrays of strings/objects.
function tally(lists: unknown[], limit = 6) {
  const counts = new Map<string, number>();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const label =
        typeof item === "string"
          ? item
          : item && typeof item === "object"
            ? String(
                (item as Record<string, unknown>).topic ??
                  (item as Record<string, unknown>).title ??
                  (item as Record<string, unknown>).name ??
                  "",
              )
            : "";
      if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((x, y) => y[1] - x[1]).slice(0, limit);
}

// Consecutive days (ending today or yesterday) with any activity.
function streak(dates: string[]) {
  const days = new Set(dates.map((d) => new Date(d).toDateString()));
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (days.has(cursor.toDateString())) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

function DashboardPage() {
  const { user, loading: authLoading } = useAuthUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setData(null);
      return;
    }
    void loadDashboard(user.id).then(setData);
  }, [user]);

  const view = useMemo(() => {
    if (!data) return null;
    const allLevels = getAllLevels();
    const completedLevels = data.dsaLevels.filter((l) => l.completed);
    const dsaPercent = allLevels.length
      ? Math.round((completedLevels.length / allLevels.length) * 100)
      : 0;

    const activityDates = [
      ...data.assessments.map((x) => x.completed_at),
      ...data.interviews.map((x) => x.completed_at),
      ...data.dsaAttempts.map((x) => x.created_at),
      ...data.solved.map((x) => x.solved_at),
      ...data.reviews.map((x) => x.created_at),
    ];

    const byTech = new Map<string, number[]>();
    for (const a of data.assessments) {
      const list = byTech.get(a.technology) ?? [];
      list.push(Number(a.score ?? 0));
      byTech.set(a.technology, list);
    }

    const recent = [
      ...data.assessments.map((x) => ({
        at: x.completed_at,
        icon: BrainCircuit,
        text: `${x.technology} assessment (${x.difficulty})`,
        score: x.score,
      })),
      ...data.interviews.map((x) => ({
        at: x.completed_at,
        icon: MessagesSquare,
        text: `${x.interview_type} mock interview (${x.difficulty})`,
        score: x.score,
      })),
      ...data.dsaAttempts.map((x) => ({
        at: x.created_at,
        icon: BookOpen,
        text: `DSA quiz · ${dsaTopics.find((t) => t.id === x.topic_id)?.title ?? x.topic_id} ${x.passed ? "passed" : "attempted"}`,
        score: x.score,
      })),
      ...data.reviews.map((x) => ({
        at: x.created_at,
        icon: ScanSearch,
        text: `Resume review · ${x.file_name ?? "resume"}`,
        score: x.overall_score,
      })),
    ]
      .sort((x, y) => y.at.localeCompare(x.at))
      .slice(0, 8);

    const nextLevel = allLevels.find(
      (l) =>
        !data.dsaLevels.some(
          (d) => d.topic_id === l.topicId && d.level_id === l.level.id && d.completed,
        ),
    );

    return {
      dsaPercent,
      completedLevels: completedLevels.length,
      totalLevels: allLevels.length,
      streak: streak(activityDates),
      lastActive: activityDates.sort().at(-1) ?? null,
      assessmentTrend: data.assessments.map((a) => ({
        date: fmtDate(a.completed_at),
        score: Number(a.score ?? 0),
        tech: a.technology,
      })),
      techRows: [...byTech.entries()].map(([tech, scores]) => ({
        tech,
        attempts: scores.length,
        best: Math.max(...scores),
        latest: scores[scores.length - 1],
      })),
      weakTopics: tally(data.assessmentResults.map((r) => r.weak_topics)),
      interviewTrend: data.interviews.map((x) => ({
        date: fmtDate(x.completed_at),
        score: Number(x.score ?? 0),
      })),
      interviewStrengths: tally(
        data.interviewReports.map((r) => r.strengths),
        4,
      ),
      interviewWeaknesses: tally(
        data.interviewReports.map((r) => r.weaknesses),
        4,
      ),
      topicBars: dsaTopics.map((t) => ({
        topic: t.title,
        percent: t.levels.length
          ? Math.round(
              (t.levels.filter((lvl) =>
                completedLevels.some((d) => d.topic_id === t.id && d.level_id === lvl.id),
              ).length /
                t.levels.length) *
                100,
            )
          : 0,
      })),
      quizAccuracy: avg(data.dsaAttempts.map((x) => Number(x.score))),
      reviewTrend: data.reviews.map((x) => ({
        date: fmtDate(x.created_at),
        score: Number(x.overall_score ?? 0),
      })),
      recent,
      nextLevel,
    };
  }, [data]);

  if (authLoading) return <CenteredSpinner />;

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Your progress dashboard</h1>
        <p className="mt-3 text-muted-foreground">
          Sign in to see your scores, progress and activity across every Nexora feature.
        </p>
        <button
          onClick={() => setAuthOpen(true)}
          className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-gold)" }}
        >
          Sign In
        </button>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </main>
    );
  }

  if (!data || !view) return <CenteredSpinner />;

  const name = user.user_metadata?.full_name || user.email?.split("@")[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Welcome back, {name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {view.lastActive
            ? `Last active ${fmtDate(view.lastActive)}`
            : "No activity yet — pick a module to get started."}
        </p>
      </header>

      {/* Overview */}
      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat icon={Flame} label="Day streak" value={view.streak} />
        <Stat icon={BrainCircuit} label="Assessments" value={data.assessments.length} />
        <Stat icon={MessagesSquare} label="Interviews" value={data.interviews.length} />
        <Stat icon={BookOpen} label="DSA complete" value={`${view.dsaPercent}%`} />
        <Stat icon={CheckCircle2} label="Problems solved" value={data.solved.length} />
        <Stat
          icon={ScanSearch}
          label="Latest ATS score"
          value={
            data.reviews.length
              ? Number(data.reviews[data.reviews.length - 1].overall_score ?? 0)
              : "—"
          }
        />
      </section>

      {view.nextLevel && (
        <Link
          to="/learning-hub/dsa/$topicId/$levelId"
          params={{ topicId: view.nextLevel.topicId, levelId: view.nextLevel.level.id }}
          className="mt-4 flex items-center justify-between gap-4 rounded-2xl glass p-4 transition hover:border-primary/50"
        >
          <div>
            <p className="text-xs text-muted-foreground">Continue learning</p>
            <p className="mt-0.5 font-medium">
              {view.nextLevel.topic.title} · {view.nextLevel.level.title}
            </p>
          </div>
          <span className="text-sm font-semibold text-primary">Resume →</span>
        </Link>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Skill assessments */}
        <Panel
          title="Skill assessments"
          icon={BrainCircuit}
          empty={!data.assessments.length}
          emptyHref="/skill-assessment"
        >
          <TrendChart data={view.assessmentTrend} />
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-1.5 font-medium">Technology</th>
                <th className="py-1.5 text-right font-medium">Attempts</th>
                <th className="py-1.5 text-right font-medium">Best</th>
                <th className="py-1.5 text-right font-medium">Latest</th>
              </tr>
            </thead>
            <tbody>
              {view.techRows.map((r) => (
                <tr key={r.tech} className="border-t border-border/50">
                  <td className="py-2">{r.tech}</td>
                  <td className="py-2 text-right tabular-nums">{r.attempts}</td>
                  <td className="py-2 text-right tabular-nums">{r.best}%</td>
                  <td className="py-2 text-right tabular-nums">{r.latest}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {view.weakTopics.length > 0 && (
            <ChipList title="Topics to work on" items={view.weakTopics} />
          )}
        </Panel>

        {/* Mock interviews */}
        <Panel
          title="Mock interviews"
          icon={MessagesSquare}
          empty={!data.interviews.length}
          emptyHref="/mock-interview"
        >
          <TrendChart data={view.interviewTrend} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ChipList title="Strengths" items={view.interviewStrengths} />
            <ChipList title="To improve" items={view.interviewWeaknesses} />
          </div>
        </Panel>

        {/* DSA */}
        <Panel title="DSA learning hub" icon={BookOpen} empty={false}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <MiniStat label="Levels done" value={`${view.completedLevels}/${view.totalLevels}`} />
            <MiniStat
              label="Quiz accuracy"
              value={view.quizAccuracy !== null ? `${view.quizAccuracy}%` : "—"}
            />
            <MiniStat label="Problems solved" value={data.solved.length} />
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={view.topicBars} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  unit="%"
                />
                <YAxis
                  type="category"
                  dataKey="topic"
                  width={130}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  interval={0}
                />
                <Tooltip content={<ChartTip unit="%" />} cursor={{ fill: "var(--glass)" }} />
                <Bar
                  dataKey="percent"
                  fill="var(--primary)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Resume */}
        <Panel title="Resume" icon={FileText} empty={false}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <MiniStat label="Resume built" value={data.resumes.length ? "Yes" : "No"} />
            <MiniStat label="Reviews" value={data.reviews.length} />
            <MiniStat
              label="Best ATS"
              value={
                data.reviews.length
                  ? Math.max(...data.reviews.map((r) => Number(r.overall_score ?? 0)))
                  : "—"
              }
            />
          </div>
          {data.reviews.length ? (
            <TrendChart data={view.reviewTrend} className="mt-4" />
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              <Link to="/resume-review" className="text-primary hover:underline">
                Review your resume
              </Link>{" "}
              to start tracking your ATS score.
            </p>
          )}
        </Panel>
      </div>

      {/* Recent activity */}
      <section className="mt-6 rounded-2xl glass p-5 md:p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <Award className="h-4 w-4 text-primary" /> Recent activity
        </h2>
        {view.recent.length ? (
          <ul className="mt-4 divide-y divide-border/50">
            {view.recent.map((r, idx) => (
              <li key={idx} className="flex items-center gap-3 py-2.5 text-sm">
                <r.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{r.text}</span>
                {r.score !== null && (
                  <span className="tabular-nums text-muted-foreground">{Number(r.score)}%</span>
                )}
                <span className="w-16 text-right text-xs text-muted-foreground">
                  {fmtDate(r.at)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Nothing yet.</p>
        )}
      </section>
    </main>
  );
}

function CenteredSpinner() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl glass p-4">
      <Icon className="h-4 w-4 text-primary" />
      <div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-surface/60 p-3">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  empty,
  emptyHref,
  children,
}: {
  title: string;
  icon: LucideIcon;
  empty: boolean;
  emptyHref?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl glass p-5 md:p-6">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h2>
      <div className="mt-4">
        {empty ? (
          <p className="text-sm text-muted-foreground">
            No attempts yet.{" "}
            {emptyHref && (
              <a href={emptyHref} className="text-primary hover:underline">
                Start one →
              </a>
            )}
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function ChipList({ title, items }: { title: string; items: [string, number][] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map(([label, count]) => (
          <span key={label} className="rounded-full border border-border/60 px-2.5 py-1 text-xs">
            {label}
            {count > 1 && <span className="ml-1 text-muted-foreground">×{count}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

type ChartTipProps = {
  active?: boolean;
  label?: string;
  unit?: string;
  payload?: { value: number; payload: { tech?: string; topic?: string } }[];
};

function ChartTip({ active, payload, label, unit = "" }: ChartTipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <div className="text-muted-foreground">{p.payload.tech ?? label ?? p.payload.topic}</div>
      <div className="mt-0.5 font-semibold tabular-nums">
        {p.value}
        {unit}
      </div>
    </div>
  );
}

function TrendChart({
  data,
  className = "",
}: {
  data: { date: string; score: number }[];
  className?: string;
}) {
  return (
    <div className={`h-48 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTip />} cursor={{ stroke: "var(--border)" }} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--primary)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
