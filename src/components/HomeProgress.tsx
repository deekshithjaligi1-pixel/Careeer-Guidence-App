import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  ScanSearch,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { getAllLevels } from "@/lib/dsa-curriculum";

// Each module keeps its own accent so the cards are easy to tell apart;
// gold stays the brand colour for primary actions.
const TONES = {
  dsa: "#f2b544",
  assess: "#60a5fa",
  interview: "#a78bfa",
  resume: "#34d399",
} as const;

type Activity = { at: string; label: string; score: number | null; tone: string; icon: LucideIcon };

type Progress = {
  lessonsDone: number;
  problemsSolved: number;
  assessments: number;
  bestAssessment: number | null;
  latestAssessment: number | null;
  interviews: number;
  avgInterview: number | null;
  hasResume: boolean;
  latestAts: number | null;
  reviews: number;
  completedKeys: Set<string>;
  recent: Activity[];
};

async function loadProgress(userId: string): Promise<Progress> {
  const [a, i, d, s, rv, rs] = await Promise.all([
    supabase
      .from("skill_assessments")
      .select("technology, difficulty, score, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false }),
    supabase
      .from("mock_interviews")
      .select("interview_type, difficulty, score, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false }),
    supabase
      .from("dsa_level_progress")
      .select("topic_id, level_id")
      .eq("user_id", userId)
      .eq("completed", true),
    supabase
      .from("dsa_solved_problems")
      .select("problem_id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("resume_reviews")
      .select("file_name, overall_score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("resumes").select("id").eq("user_id", userId).limit(1),
  ]);

  const assessments = a.data ?? [];
  const interviews = i.data ?? [];
  const reviews = rv.data ?? [];
  const scores = (xs: { score: number | null }[]) => xs.map((x) => Number(x.score ?? 0));
  const avg = (xs: number[]) =>
    xs.length ? Math.round(xs.reduce((t, x) => t + x, 0) / xs.length) : null;

  const recent: Activity[] = [
    ...assessments.map((x) => ({
      at: x.completed_at,
      label: `${x.technology} assessment · ${x.difficulty}`,
      score: x.score,
      tone: TONES.assess,
      icon: BrainCircuit,
    })),
    ...interviews.map((x) => ({
      at: x.completed_at,
      label: `${x.interview_type} mock interview · ${x.difficulty}`,
      score: x.score,
      tone: TONES.interview,
      icon: MessagesSquare,
    })),
    ...reviews.map((x) => ({
      at: x.created_at,
      label: `Resume review · ${x.file_name ?? "resume"}`,
      score: x.overall_score,
      tone: TONES.resume,
      icon: ScanSearch,
    })),
  ]
    .sort((x, y) => y.at.localeCompare(x.at))
    .slice(0, 4);

  return {
    lessonsDone: d.data?.length ?? 0,
    problemsSolved: s.count ?? 0,
    assessments: assessments.length,
    bestAssessment: assessments.length ? Math.max(...scores(assessments)) : null,
    latestAssessment: assessments.length ? Number(assessments[0].score ?? 0) : null,
    interviews: interviews.length,
    avgInterview: avg(scores(interviews)),
    hasResume: (rs.data?.length ?? 0) > 0,
    latestAts: reviews.length ? Number(reviews[0].overall_score ?? 0) : null,
    reviews: reviews.length,
    completedKeys: new Set((d.data ?? []).map((r) => `${r.topic_id}_${r.level_id}`)),
    recent,
  };
}

export function HomeProgress() {
  const { user } = useAuthUser();
  const [data, setData] = useState<Progress | null>(null);

  useEffect(() => {
    if (!user) {
      setData(null);
      return;
    }
    void loadProgress(user.id).then(setData);
  }, [user]);

  if (!user) return null;

  const allLevels = getAllLevels();
  const next = data
    ? allLevels.find((l) => !data.completedKeys.has(`${l.topicId}_${l.level.id}`))
    : undefined;
  const name = user.user_metadata?.full_name || user.email?.split("@")[0];
  const isNew = data && data.lessonsDone + data.assessments + data.interviews + data.reviews === 0;

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 pb-16">
      <div className="rounded-3xl glass border border-primary/20 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Your progress
            </span>
            <h3
              className="mt-1 text-2xl font-bold tracking-tight md:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome back, {name}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {!data
                ? "Loading your progress…"
                : isNew
                  ? "You're all set. Pick any module below to start — everything you do is saved here."
                  : `${data.lessonsDone} lessons, ${data.assessments} tests and ${data.interviews} interviews completed so far.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {next && (
              <Link
                to="/learning-hub/dsa/$topicId/$levelId"
                params={{ topicId: next.topicId, levelId: next.level.id }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-gold)" }}
              >
                {data && data.lessonsDone > 0 ? "Continue learning" : "Start learning"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/50"
            >
              <LayoutDashboard className="h-4 w-4" />
              Full dashboard
            </Link>
          </div>
        </div>

        {/* Module cards */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ModuleCard
            tone={TONES.dsa}
            icon={BookOpen}
            title="DSA Learning"
            value={data ? `${data.lessonsDone}` : "—"}
            unit={`/ ${allLevels.length} lessons`}
            percent={data ? (data.lessonsDone / allLevels.length) * 100 : 0}
            note={data ? `${data.problemsSolved} practice problems solved` : ""}
            action={
              next ? (
                <Link
                  to="/learning-hub/dsa/$topicId/$levelId"
                  params={{ topicId: next.topicId, levelId: next.level.id }}
                >
                  Next: {next.level.title}
                </Link>
              ) : (
                <Link to="/learning-hub/dsa">Review the roadmap</Link>
              )
            }
          />
          <ModuleCard
            tone={TONES.assess}
            icon={BrainCircuit}
            title="Skill Assessments"
            value={data ? `${data.assessments}` : "—"}
            unit={data?.assessments === 1 ? "test taken" : "tests taken"}
            percent={data?.latestAssessment ?? 0}
            note={
              data?.latestAssessment != null
                ? `Latest ${data.latestAssessment}% · best ${data.bestAssessment}%`
                : "No tests yet"
            }
            action={
              <Link to="/skill-assessment">
                {data?.assessments ? "Take another test" : "Take your first test"}
              </Link>
            }
          />
          <ModuleCard
            tone={TONES.interview}
            icon={MessagesSquare}
            title="Mock Interviews"
            value={data ? `${data.interviews}` : "—"}
            unit={data?.interviews === 1 ? "session" : "sessions"}
            percent={data?.avgInterview ?? 0}
            note={
              data?.avgInterview != null ? `Average score ${data.avgInterview}%` : "No sessions yet"
            }
            action={
              <Link to="/mock-interview">
                {data?.interviews ? "Practise again" : "Start your first interview"}
              </Link>
            }
          />
          <ModuleCard
            tone={TONES.resume}
            icon={FileText}
            title="Resume"
            value={data?.latestAts != null ? `${data.latestAts}` : "—"}
            unit={data?.latestAts != null ? "ATS score" : "not reviewed"}
            percent={data?.latestAts ?? 0}
            note={
              data
                ? `${data.hasResume ? "Resume built" : "No resume built yet"} · ${data.reviews} ${data.reviews === 1 ? "review" : "reviews"}`
                : ""
            }
            action={
              data?.hasResume ? (
                <Link to="/resume-review">Get it reviewed</Link>
              ) : (
                <Link to="/resume-builder">Build your resume</Link>
              )
            }
          />
        </div>

        {/* Recent activity */}
        {data && data.recent.length > 0 && (
          <div className="mt-7 border-t border-border/60 pt-6">
            <h4 className="text-sm font-semibold">Recent activity</h4>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {data.recent.map((r, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface/40 px-3.5 py-3"
                >
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                    style={{ background: `${r.tone}1f`, color: r.tone }}
                  >
                    <r.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm capitalize">{r.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </span>
                  {r.score !== null && (
                    <span className="text-sm font-semibold tabular-nums" style={{ color: r.tone }}>
                      {Number(r.score)}%
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function ModuleCard({
  tone,
  icon: Icon,
  title,
  value,
  unit,
  percent,
  note,
  action,
}: {
  tone: string;
  icon: LucideIcon;
  title: string;
  value: string;
  unit: string;
  percent: number;
  note: string;
  action: ReactNode;
}) {
  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface/50 p-5"
      style={{
        backgroundImage: `radial-gradient(260px 120px at 0% 0%, ${tone}14, transparent 70%)`,
      }}
    >
      <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: tone }} />
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: `${tone}1f`, color: tone }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium text-foreground/90">{title}</span>
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tabular-nums">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: tone }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{note}</p>
      <div
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium [&_a]:hover:underline"
        style={{ color: tone }}
      >
        {action}
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
