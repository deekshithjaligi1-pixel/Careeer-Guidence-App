import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  Bug,
  Check,
  ChevronRight,
  Code2,
  Cpu,
  Flame,
  Gauge,
  Layers,
  Lightbulb,
  Loader2,
  Map as MapIcon,
  Rocket,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import {
  Download,
  RefreshCw,
  PlayCircle,
  Route as RouteIcon,
  Clock,
  ShieldCheck,
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
  Brain,
} from "lucide-react";
import {
  evaluateAssessment,
  generateAssessment,
  type AssessmentQuestion,
} from "@/lib/assessment.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/skill-assessment")({
  head: () => ({
    meta: [
      { title: "AI Skill Assessment — CareerPilot AI" },
      {
        name: "description",
        content:
          "Adaptive AI assessments across Java, React, SQL, Python and more. MCQ, coding, debugging and scenario challenges with an instant performance report and personalized learning roadmap.",
      },
    ],
  }),
  component: SkillAssessmentPage,
});

type Phase = "setup" | "quiz" | "report";
type Difficulty = "easy" | "medium" | "hard";
type Mode = "mixed" | "mcq" | "coding" | "scenario" | "debugging" | "rapid";

type Tech = {
  id: string;
  badge: string;
  topics: string[];
  approx: string;
  coverage: number;
  accent: string;
};

const TECHS: Tech[] = [
  { id: "Java", badge: "JV", topics: ["OOP", "Collections", "Streams", "JVM", "Multithreading"], approx: "200+ concepts", coverage: 93, accent: "oklch(0.72 0.17 45)" },
  { id: "Spring Boot", badge: "SB", topics: ["DI", "JPA", "REST", "Security", "Actuator"], approx: "150+ concepts", coverage: 88, accent: "oklch(0.75 0.18 145)" },
  { id: "Python", badge: "PY", topics: ["Syntax", "OOP", "Generators", "Async", "Libs"], approx: "180+ concepts", coverage: 90, accent: "oklch(0.75 0.15 235)" },
  { id: "JavaScript", badge: "JS", topics: ["ES6+", "Async", "DOM", "Closures", "Modules"], approx: "220+ concepts", coverage: 85, accent: "oklch(0.85 0.16 95)" },
  { id: "React", badge: "Rx", topics: ["Hooks", "State", "Rendering", "Suspense", "Perf"], approx: "160+ concepts", coverage: 87, accent: "oklch(0.78 0.13 220)" },
  { id: "SQL", badge: "SQ", topics: ["Joins", "Indexes", "Windows", "CTEs", "Tuning"], approx: "120+ concepts", coverage: 91, accent: "oklch(0.7 0.17 300)" },
  { id: "MongoDB", badge: "Mo", topics: ["Documents", "Aggregation", "Indexing", "Sharding"], approx: "90+ concepts", coverage: 82, accent: "oklch(0.75 0.16 150)" },
  { id: "Node.js", badge: "Nd", topics: ["Event loop", "Streams", "APIs", "Perf"], approx: "140+ concepts", coverage: 83, accent: "oklch(0.76 0.17 140)" },
  { id: "C++", badge: "C+", topics: ["Pointers", "STL", "OOP", "Templates"], approx: "170+ concepts", coverage: 84, accent: "oklch(0.7 0.15 250)" },
  { id: "Data Structures", badge: "DS", topics: ["Arrays", "Trees", "Graphs", "Heaps"], approx: "150+ concepts", coverage: 89, accent: "oklch(0.72 0.14 260)" },
  { id: "Algorithms", badge: "Al", topics: ["Greedy", "DP", "Graphs", "Divide & conquer"], approx: "180+ concepts", coverage: 86, accent: "oklch(0.7 0.18 310)" },
  { id: "Git", badge: "Gt", topics: ["Branching", "Rebase", "Workflows"], approx: "60+ concepts", coverage: 78, accent: "oklch(0.72 0.18 40)" },
];

const DIFFS: {
  id: Difficulty;
  label: string;
  hint: string;
  sub: string;
  time: string;
  bestFor: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "easy", label: "Easy", hint: "Beginner · Fundamentals", sub: "Basic syntax and core ideas", time: "10–12 min", bestFor: "Best for beginners", icon: Sparkles },
  { id: "medium", label: "Medium", hint: "Placement · Problem solving", sub: "Interview concepts and applied logic", time: "15–20 min", bestFor: "Best for placements", icon: Flame },
  { id: "hard", label: "Hard", hint: "Company interview · Advanced", sub: "System design and edge cases", time: "25–35 min", bestFor: "Best for experienced", icon: Rocket },
];

const MODES: {
  id: Mode;
  label: string;
  desc: string;
  split: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "mixed", label: "Mixed", desc: "Balanced MCQ, code and scenario", split: "Balanced blend", icon: Layers },
  { id: "mcq", label: "MCQ", desc: "Conceptual multiple choice", split: "100% MCQ", icon: BrainCircuit },
  { id: "coding", label: "Coding", desc: "Code prediction & completion", split: "100% Coding", icon: Code2 },
  { id: "scenario", label: "Scenario", desc: "Real-world design problems", split: "100% Scenario", icon: Lightbulb },
  { id: "debugging", label: "Debugging", desc: "Spot and fix bugs in code", split: "100% Debugging", icon: Bug },
  { id: "rapid", label: "Rapid Fire", desc: "Short, quick MCQs", split: "Speed run", icon: Zap },
];

function computeMix(mode: Mode, count: number, diff: Difficulty) {
  const c = count;
  if (mode === "mcq" || mode === "rapid") return { mcq: c, code: 0, scenario: 0 };
  if (mode === "coding" || mode === "debugging") return { mcq: 0, code: c, scenario: 0 };
  if (mode === "scenario") return { mcq: 0, code: 0, scenario: c };
  const s = diff === "hard" ? 2 : 1;
  const code = Math.max(1, Math.round(c * (diff === "hard" ? 0.4 : diff === "medium" ? 0.3 : 0.2)));
  const mcq = Math.max(1, c - code - s);
  return { mcq, code, scenario: s };
}

function estimateDuration(count: number, diff: Difficulty, mode: Mode) {
  const perQ =
    mode === "rapid" ? 0.6 : mode === "coding" || mode === "debugging" ? 2.5 : mode === "scenario" ? 3 : 1.5;
  const diffMul = diff === "hard" ? 1.4 : diff === "medium" ? 1.1 : 0.9;
  return Math.max(3, Math.round(count * perQ * diffMul));
}

type Answer = { selectedIndex: number | null; text: string };

function SkillAssessmentPage() {
  const [phase, setPhase] = useState<Phase>("setup");

  const [tech, setTech] = useState<string>("Java");
  const [customTech, setCustomTech] = useState("");
  const [diff, setDiff] = useState<Difficulty>("medium");
  const [mode, setMode] = useState<Mode>("mixed");
  const [count, setCount] = useState<number>(10);
  const [adaptive, setAdaptive] = useState(true);
  const [aiExplanations, setAiExplanations] = useState(true);
  const [roadmap, setRoadmap] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [current, setCurrent] = useState(0);
  const [report, setReport] = useState<Awaited<ReturnType<typeof evaluateAssessment>> | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const gen = useServerFn(generateAssessment);
  const evalFn = useServerFn(evaluateAssessment);

  const activeTech = tech === "__custom" ? customTech.trim() || "Custom" : tech;
  const mix = useMemo(() => computeMix(mode, count, diff), [mode, count, diff]);
  const duration = useMemo(() => estimateDuration(count, diff, mode), [count, diff, mode]);

  useEffect(() => {
    if (phase !== "quiz") return;
    if (timeLeft <= 0) {
      void submit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  async function start() {
    setError(null);
    setLoading(true);
    try {
      const qs = await gen({
        data: {
          technology: activeTech,
          difficulty: diff,
          count,
          mix,
          mode,
          adaptive,
        },
      });
      if (!qs || qs.length === 0) throw new Error("No questions were generated. Try again.");
      setQuestions(qs);
      setAnswers({});
      setCurrent(0);
      setTimeLeft(duration * 60);
      setPhase("quiz");
    } catch (e) {
      setError(
        e instanceof Error
          ? `Couldn't generate the assessment: ${e.message}. Retry, or pick a different technology.`
          : "Failed to generate questions"
      );
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    setLoading(true);
    try {
      const payload = questions.map((q) => ({
        question: q,
        userAnswer: answers[q.id]?.text ?? "",
        selectedIndex: answers[q.id]?.selectedIndex ?? null,
      }));
      const res = await evalFn({
        data: { technology: activeTech, difficulty: diff, answers: payload },
      });
      setReport(res);
      setPhase("report");

      // Save assessment session and results to Supabase if authenticated
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (user) {
          const { data: assessRow } = await supabase
            .from("skill_assessments")
            .insert({
              user_id: user.id,
              technology: activeTech,
              difficulty: diff,
              score: res.overallScore,
              percentage: res.overallScore,
              total_questions: questions.length,
            })
            .select()
            .single();

          if (assessRow) {
            await supabase.from("assessment_results").insert({
              assessment_id: assessRow.id,
              user_id: user.id,
              strengths: res.strengths,
              weaknesses: res.weaknesses,
              weak_topics: res.weakTopics,
              recommendations: res.learningPath,
              detailed_report: res,
            });
          }
        }
      } catch (dbErr) {
        console.warn("Failed to persist assessment to Supabase:", dbErr);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to evaluate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden pt-24 pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />

      <AnimatePresence mode="wait">
        {phase === "setup" && (
          <Setup
            key="setup"
            tech={tech}
            setTech={setTech}
            customTech={customTech}
            setCustomTech={setCustomTech}
            activeTech={activeTech}
            diff={diff}
            setDiff={setDiff}
            mode={mode}
            setMode={setMode}
            count={count}
            setCount={setCount}
            adaptive={adaptive}
            setAdaptive={setAdaptive}
            aiExplanations={aiExplanations}
            setAiExplanations={setAiExplanations}
            roadmap={roadmap}
            setRoadmap={setRoadmap}
            mix={mix}
            duration={duration}
            loading={loading}
            error={error}
            onStart={start}
          />
        )}
        {phase === "quiz" && (
          <Quiz
            key="quiz"
            tech={activeTech}
            diff={diff}
            questions={questions}
            current={current}
            setCurrent={setCurrent}
            answers={answers}
            setAnswers={setAnswers}
            timeLeft={timeLeft}
            loading={loading}
            onSubmit={submit}
          />
        )}
        {phase === "report" && report && (
          <Report
            key="report"
            tech={activeTech}
            diff={diff}
            report={report}
            count={count}
            duration={duration}
            onRestart={() => {
              setPhase("setup");
              setReport(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Setup ---------------- */

function Setup(props: {
  tech: string;
  setTech: (v: string) => void;
  customTech: string;
  setCustomTech: (v: string) => void;
  activeTech: string;
  diff: Difficulty;
  setDiff: (v: Difficulty) => void;
  mode: Mode;
  setMode: (v: Mode) => void;
  count: number;
  setCount: (v: number) => void;
  adaptive: boolean;
  setAdaptive: (v: boolean) => void;
  aiExplanations: boolean;
  setAiExplanations: (v: boolean) => void;
  roadmap: boolean;
  setRoadmap: (v: boolean) => void;
  mix: { mcq: number; code: number; scenario: number };
  duration: number;
  loading: boolean;
  error: string | null;
  onStart: () => void;
}) {
  const {
    tech, setTech, customTech, setCustomTech, activeTech,
    diff, setDiff, mode, setMode, count, setCount,
    adaptive, setAdaptive, aiExplanations, setAiExplanations, roadmap, setRoadmap,
    mix, duration, loading, error, onStart,
  } = props;

  const QUESTION_OPTIONS = [5, 10, 15, 20, 25];
  const AI_FEATURES = [
    {
      key: "adaptive",
      label: "Adaptive Difficulty",
      desc: "AI adjusts question difficulty based on your live performance.",
      icon: Gauge,
      value: adaptive,
      onChange: setAdaptive,
      locked: false,
    },
    {
      key: "explanations",
      label: "AI Explanations",
      desc: "Detailed reasoning and model answers after every question.",
      icon: Lightbulb,
      value: aiExplanations,
      onChange: setAiExplanations,
      locked: false,
    },
    {
      key: "roadmap",
      label: "Learning Roadmap",
      desc: "A personalized study plan generated from your weak topics.",
      icon: MapIcon,
      value: roadmap,
      onChange: setRoadmap,
      locked: false,
    },
    {
      key: "readiness",
      label: "Interview Readiness",
      desc: "Company-tier readiness score predicted from your results.",
      icon: ShieldCheck,
      value: true,
      onChange: () => {},
      locked: true,
    },
  ];

  const selectedTech = TECHS.find((t) => t.id === tech);
  const activeMode = MODES.find((m) => m.id === mode)!;
  const startDisabled = loading || (tech === "__custom" && !customTech.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-auto w-full max-w-[1280px] px-6 md:px-8"
    >
      {/* ---------- Hero ---------- */}
      <section className="grid lg:grid-cols-[1.05fr_.95fr] gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI Powered Assessment
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.04]">
            AI Skill <span className="text-gradient-gold">Assessment</span>
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground">
            Measure your real technical skills through AI-generated coding questions,
            debugging challenges, MCQs and interview scenarios. Receive an instant
            performance report and a personalized learning roadmap.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { label: "Adaptive Difficulty", icon: Gauge },
              { label: "AI Explanations", icon: Lightbulb },
              { label: "Instant Report", icon: Activity },
              { label: "Weakness Analysis", icon: Target },
              { label: "Learning Roadmap", icon: MapIcon },
            ].map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-300 hover:border-primary/40 hover:text-foreground"
              >
                <c.icon className="h-3.5 w-3.5 text-primary" />
                {c.label}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              onClick={onStart}
              disabled={startDisabled}
              className="group inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:-translate-y-1 disabled:opacity-60 disabled:hover:translate-y-0"
              style={{ background: "var(--gradient-gold)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  Start Assessment
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
            <a
              href="#assessment-summary"
              className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-surface/40 px-6 py-3.5 text-sm font-semibold text-foreground/90 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
            >
              <PieChartIcon className="h-4 w-4 text-primary" />
              View Sample Report
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeroIllustration />
        </motion.div>
      </section>

      {/* ---------- Technology ---------- */}
      <Section
        id="technology"
        eyebrow="Step 01"
        title="Choose Your Technology"
        subtitle="Select the technology you want to be assessed on."
      >
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {TECHS.map((t, i) => {
            const active = tech === t.id;
            return (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.04 }}
                onClick={() => setTech(t.id)}
                className={`group relative flex h-full flex-col overflow-hidden rounded-[20px] border p-5 text-left transition-all duration-300 hover:-translate-y-1.5 ${
                  active
                    ? "border-primary/60 bg-primary/[0.06] shadow-glow"
                    : "border-border/60 bg-surface/40 hover:border-primary/35 hover:shadow-card"
                }`}
              >
                {active && (
                  <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-bold"
                    style={{
                      background: `color-mix(in oklab, ${t.accent} 18%, transparent)`,
                      color: t.accent,
                      border: `1px solid color-mix(in oklab, ${t.accent} 35%, transparent)`,
                    }}
                  >
                    {t.badge}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{t.id}</div>
                    <div className="text-[11px] text-muted-foreground">{t.approx}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {t.topics.slice(0, 4).map((tp) => (
                    <span
                      key={tp}
                      className="rounded-lg border border-border/50 bg-background/40 px-2 py-1 text-[10px] text-muted-foreground"
                    >
                      {tp}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {estimateDuration(count, diff, mode)} min
                    </span>
                    <span className="font-medium text-foreground/80">{t.coverage}% coverage</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/60">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${t.coverage}%`, background: t.accent }}
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            onClick={() => setTech("__custom")}
            className={`flex h-full flex-col rounded-[20px] border-2 border-dashed p-5 text-left transition-all duration-300 hover:-translate-y-1.5 ${
              tech === "__custom"
                ? "border-primary/60 bg-primary/[0.06]"
                : "border-border/60 bg-surface/20 hover:border-primary/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface text-primary">
                <Wand2 className="h-4 w-4" />
              </span>
              <div>
                <div className="font-semibold">Other technology</div>
                <div className="text-[11px] text-muted-foreground">Type any stack — AI adapts</div>
              </div>
            </div>
            {tech === "__custom" && (
              <input
                autoFocus
                value={customTech}
                onChange={(e) => setCustomTech(e.target.value)}
                placeholder="e.g. Kubernetes, Rust, Django"
                className="mt-4 w-full rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary/60"
              />
            )}
          </motion.button>
        </div>
      </Section>

      {/* ---------- Difficulty ---------- */}
      <Section
        eyebrow="Step 02"
        title="Select Difficulty"
        subtitle="Choose the difficulty level of the assessment."
      >
        <div className="grid md:grid-cols-3 gap-5">
          {DIFFS.map((d, i) => {
            const active = diff === d.id;
            const Icon = d.icon;
            return (
              <motion.button
                key={d.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                onClick={() => setDiff(d.id)}
                className={`relative flex h-full flex-col rounded-[20px] border p-6 text-left transition-all duration-300 hover:-translate-y-1.5 ${
                  active
                    ? "border-primary/60 bg-primary/[0.06] shadow-glow"
                    : "border-border/60 bg-surface/40 hover:border-primary/35 hover:shadow-card"
                }`}
              >
                {d.id === "medium" && (
                  <span className="absolute -top-2.5 left-6 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                )}
                {active && (
                  <span className="absolute right-5 top-5 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl ${
                      active ? "text-primary-foreground" : "bg-surface text-primary"
                    }`}
                    style={active ? { background: "var(--gradient-gold)" } : undefined}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-lg font-semibold">{d.label}</div>
                    <div className="text-[11px] text-primary">{d.hint}</div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{d.sub}</p>
                <div className="mt-auto flex items-center justify-between pt-6 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> {d.time}
                  </span>
                  <span>{d.bestFor}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </Section>

      {/* ---------- Mode ---------- */}
      <Section
        eyebrow="Step 03"
        title="Assessment Mode"
        subtitle="Select the type of assessment you want to take."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODES.map((m, i) => {
            const active = mode === m.id;
            const Icon = m.icon;
            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                onClick={() => setMode(m.id)}
                className={`relative flex h-full flex-col rounded-[20px] border p-5 text-left transition-all duration-300 hover:-translate-y-1.5 ${
                  active
                    ? "border-primary/60 bg-primary/[0.06] shadow-glow"
                    : "border-border/60 bg-surface/40 hover:border-primary/35 hover:shadow-card"
                }`}
              >
                {m.id === "mixed" && (
                  <span className="absolute -top-2.5 left-5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4.5 w-4.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="font-semibold">{m.label}</div>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
                <div className="mt-auto pt-5">
                  <MixBar mix={computeMix(m.id, count, diff)} />
                  <div className="mt-2 text-[11px] text-muted-foreground">{m.split}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </Section>

      {/* ---------- Questions ---------- */}
      <Section
        eyebrow="Step 04"
        title="Number of Questions"
        subtitle="Select how many questions your assessment should contain."
      >
        <div className="rounded-[22px] border border-border/60 bg-surface/40 p-6 md:p-8">
          <div className="flex flex-wrap gap-3">
            {QUESTION_OPTIONS.map((n) => {
              const active = count === n;
              return (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`h-14 w-20 rounded-2xl border text-lg font-semibold tabular-nums transition-all duration-300 hover:-translate-y-1 ${
                    active
                      ? "border-primary/70 text-primary-foreground shadow-glow"
                      : "border-border/60 bg-background/40 text-foreground/80 hover:border-primary/40"
                  }`}
                  style={active ? { background: "var(--gradient-gold)" } : undefined}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="mt-7 grid sm:grid-cols-3 gap-4">
            <MiniStat label="Estimated duration" value={`${duration} min`} />
            <MiniStat
              label="Avg. time / question"
              value={`${Math.round((duration * 60) / Math.max(1, count))} sec`}
            />
            <MiniStat label="Difficulty scaling" value={adaptive ? "Adaptive" : "Fixed"} />
          </div>
        </div>
      </Section>

      {/* ---------- AI features ---------- */}
      <Section
        eyebrow="Step 05"
        title="AI Features"
        subtitle="Enable the AI capabilities you want during and after the assessment."
      >
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {AI_FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.button
                key={f.key}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                onClick={() => !f.locked && f.onChange(!f.value)}
                className={`relative flex h-full flex-col overflow-hidden rounded-[20px] border p-5 text-left transition-all duration-300 hover:-translate-y-1.5 ${
                  f.value
                    ? "border-primary/45 bg-primary/[0.05]"
                    : "border-border/60 bg-surface/40 hover:border-primary/35"
                } ${f.locked ? "cursor-default" : ""}`}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl"
                  style={{ background: "oklch(0.6 0.18 255 / 0.18)" }}
                />
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-background/50 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span
                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                      f.value ? "" : "bg-surface"
                    }`}
                    style={f.value ? { background: "var(--gradient-gold)" } : undefined}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform duration-300 ${
                        f.value ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                </div>
                <div className="mt-4 font-semibold">{f.label}</div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </Section>

      {/* ---------- Summary ---------- */}
      <Section
        id="assessment-summary"
        eyebrow="Step 06"
        title="Assessment Summary"
        subtitle="Review your configuration before starting."
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[22px] border border-border/60 bg-surface/40 p-6 md:p-7"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
            <SummaryItem icon={Layers} label="Technology" value={activeTech} />
            <SummaryItem icon={Target} label="Difficulty" value={diff} capitalize />
            <SummaryItem icon={Cpu} label="Mode" value={activeMode.label} />
            <SummaryItem icon={BarChart3} label="Questions" value={String(count)} />
            <SummaryItem icon={Clock} label="Duration" value={`${duration} min`} />
            <SummaryItem icon={Gauge} label="Adaptive" value={adaptive ? "Enabled" : "Off"} />
            <SummaryItem icon={Activity} label="Report" value="Included" />
            <SummaryItem icon={MapIcon} label="Roadmap" value={roadmap ? "Included" : "Off"} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/50 pt-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" /> Instant report
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" /> AI explanations
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" /> Weakness analysis
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" /> Interview readiness score
            </span>
            {selectedTech && (
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" /> {selectedTech.approx} covered
              </span>
            )}
          </div>
        </motion.div>

        {error && (
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Final CTA */}
        <div className="mt-10 flex flex-col items-center">
          <button
            onClick={onStart}
            disabled={startDisabled}
            className="group relative w-full max-w-2xl overflow-hidden rounded-[22px] px-8 py-6 text-center text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.015] disabled:opacity-60 disabled:hover:scale-100"
            style={{ background: "var(--gradient-gold)" }}
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative flex items-center justify-center gap-2 text-xl font-semibold">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Generating your assessment…
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5" /> Start AI Assessment
                  <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </span>
            <span className="relative mt-1 block text-sm opacity-80">
              Begin your interview preparation journey.
            </span>
          </button>
          <p className="mt-4 text-xs text-muted-foreground">
            Powered by Gemini · Every question generated fresh · Takes ~{duration} min
          </p>
        </div>
      </Section>
    </motion.div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 pt-20 md:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div
          className="text-[11px] uppercase tracking-[0.2em] text-primary"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {eyebrow}
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </motion.div>
      {children}
    </section>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  capitalize,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/30 px-3.5 py-3">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className={`truncate text-sm font-semibold ${capitalize ? "capitalize" : ""}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Quiz ---------------- */

function Quiz({
  tech,
  diff,
  questions,
  current,
  setCurrent,
  answers,
  setAnswers,
  timeLeft,
  loading,
  onSubmit,
}: {
  tech: string;
  diff: Difficulty;
  questions: AssessmentQuestion[];
  current: number;
  setCurrent: (n: number) => void;
  answers: Record<string, Answer>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, Answer>>>;
  timeLeft: number;
  loading: boolean;
  onSubmit: () => void;
}) {
  const q = questions[current];
  const answered = Object.keys(answers).filter((k) => {
    const a = answers[k];
    return a.selectedIndex != null || a.text.trim().length > 0;
  }).length;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const lowTime = timeLeft < 60;

  const setAnswer = (patch: Partial<Answer>) =>
    setAnswers((prev) => ({
      ...prev,
      [q.id]: {
        selectedIndex: prev[q.id]?.selectedIndex ?? null,
        text: prev[q.id]?.text ?? "",
        ...patch,
      },
    }));

  const isLast = current === questions.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-auto max-w-6xl px-4 md:px-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div
            className="text-xs uppercase tracking-widest text-primary"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            /{tech} · {diff}
          </div>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
            Question {current + 1}{" "}
            <span className="text-muted-foreground">/ {questions.length}</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`glass rounded-full px-4 py-2 text-sm inline-flex items-center gap-2 ${
              lowTime ? "border-destructive/50 text-destructive" : ""
            }`}
          >
            <Timer className={`h-4 w-4 ${lowTime ? "text-destructive" : "text-primary"}`} />
            <span className="tabular-nums font-medium">
              {mm}:{ss}
            </span>
          </div>
          <div className="glass rounded-full px-4 py-2 text-sm inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" /> {answered}/{questions.length}
          </div>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full rounded-full bg-surface overflow-hidden">
        <div
          className="h-full transition-all"
          style={{
            width: `${((current + 1) / questions.length) * 100}%`,
            background: "var(--gradient-gold)",
          }}
        />
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_260px] gap-6">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 md:p-8 shadow-card"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TypeBadge type={q.type} />
            <span className="rounded-full bg-surface px-2.5 py-1">{q.topic}</span>
          </div>
          <h3 className="mt-4 text-xl md:text-2xl font-semibold leading-snug">{q.prompt}</h3>

          {q.code && (
            <pre
              className="mt-5 overflow-auto rounded-2xl border border-border/60 bg-black/40 p-4 text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <code>{q.code}</code>
            </pre>
          )}

          {(q.type === "mcq" || q.type === "code") && q.options && (
            <div className="mt-6 space-y-2">
              {q.options.map((opt, i) => {
                const selected = answers[q.id]?.selectedIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswer({ selectedIndex: i, text: opt })}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                      selected
                        ? "border-primary/60 bg-primary/5"
                        : "border-border/60 hover:border-primary/40 bg-surface/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                          selected
                            ? "text-primary-foreground"
                            : "bg-surface text-muted-foreground"
                        }`}
                        style={selected ? { background: "var(--gradient-gold)" } : undefined}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm leading-relaxed">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "scenario" && (
            <textarea
              value={answers[q.id]?.text ?? ""}
              onChange={(e) => setAnswer({ text: e.target.value, selectedIndex: null })}
              rows={6}
              placeholder="Write your answer. Explain your reasoning and trade-offs..."
              className="mt-6 w-full rounded-2xl border border-border/60 bg-surface/40 p-4 text-sm outline-none focus:border-primary/60 transition-colors"
            />
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              className="rounded-full glass px-4 py-2 text-sm hover:bg-surface disabled:opacity-40"
            >
              Previous
            </button>
            {isLast ? (
              <button
                onClick={onSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
                style={{ background: "var(--gradient-gold)" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Grading…
                  </>
                ) : (
                  <>
                    Submit Assessment <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
                style={{ background: "var(--gradient-gold)" }}
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>

        <aside className="glass rounded-3xl p-4 shadow-card h-fit sticky top-24">
          <div className="text-xs text-muted-foreground mb-3 px-1">Question map</div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((qq, i) => {
              const a = answers[qq.id];
              const done = a && (a.selectedIndex != null || a.text.trim().length > 0);
              const isCurrent = i === current;
              return (
                <button
                  key={qq.id}
                  onClick={() => setCurrent(i)}
                  className={`h-9 rounded-lg text-xs font-medium border transition-all ${
                    isCurrent
                      ? "border-primary/60 text-primary-foreground shadow-glow"
                      : done
                        ? "border-primary/30 bg-primary/5 text-foreground"
                        : "border-border/60 bg-surface/40 text-muted-foreground hover:text-foreground"
                  }`}
                  style={isCurrent ? { background: "var(--gradient-gold)" } : undefined}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-[11px] text-muted-foreground leading-relaxed px-1">
            Auto-submits when time runs out. Revisit any question before submitting.
          </div>
        </aside>
      </div>
    </motion.div>
  );
}

/* ---------------- Report ---------------- */

function Report({
  tech,
  diff,
  report,
  count,
  duration,
  onRestart,
}: {
  tech: string;
  diff: Difficulty;
  report: NonNullable<Awaited<ReturnType<typeof evaluateAssessment>>>;
  count: number;
  duration: number;
  onRestart: () => void;
}) {
  const correctCount = useMemo(
    () => report.grading.filter((g) => g.autoCorrect).length,
    [report]
  );
  const total = report.grading.length;

  const codingItems = report.grading.filter(
    (g) => g.question.type === "code" || g.question.type === "mcq"
  );
  const codingCorrect = codingItems.filter((g) => g.autoCorrect).length;
  const codingAccuracy = codingItems.length
    ? Math.round((codingCorrect / codingItems.length) * 100)
    : 0;
  const avgSecPerQ = count > 0 ? Math.max(1, Math.round((duration * 60) / count)) : 0;

  const distribution = useMemo(() => {
    const counts = { mcq: 0, code: 0, scenario: 0 };
    report.grading.forEach((g) => {
      counts[g.question.type] += 1;
    });
    return counts;
  }, [report]);

  const skipped = report.grading.filter(
    (g) => !g.userAnswer || g.userAnswer.trim().length === 0
  ).length;
  const wrong = total - correctCount - skipped;

  const timeline = useMemo(
    () =>
      report.grading.map((g, i) => {
        const sc = report.scenarioScores.find((s) => s.id === g.question.id);
        const val =
          g.question.type === "scenario"
            ? (sc?.score ?? 0) * 10
            : g.autoCorrect
              ? 100
              : g.userAnswer.trim().length > 0
                ? 30
                : 0;
        return { i: i + 1, val };
      }),
    [report]
  );

  const studyHours = Math.max(2, Math.min(40, report.weakTopics.length * 2 + Math.round((100 - report.overallScore) / 8)));

  const roadmapWeeks = useMemo(() => {
    const chunks: { week: number; items: typeof report.learningPath }[] = [];
    const perWeek = Math.max(1, Math.ceil(report.learningPath.length / 4));
    for (let i = 0; i < report.learningPath.length; i += perWeek) {
      chunks.push({
        week: chunks.length + 1,
        items: report.learningPath.slice(i, i + perWeek),
      });
    }
    return chunks;
  }, [report]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-auto max-w-7xl px-4 md:px-8"
    >
      {/* Hero */}
      <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-10 items-center">
        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {[tech, `${diff[0].toUpperCase()}${diff.slice(1)} Difficulty`, "Completed", "AI Generated", "Adaptive Test"].map(
              (t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  <Check className="h-3 w-3 text-primary" />
                  {t}
                </span>
              )
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.03]">
            Skill Assessment{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.18 260), oklch(0.7 0.22 300))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Report
            </span>
          </h1>
          <p className="mt-5 text-muted-foreground text-lg max-w-xl leading-relaxed">
            Your AI-powered performance analysis generated from coding questions, MCQs,
            debugging challenges, and interview scenarios.
          </p>
        </div>
        <HologramIllustration />
      </div>

      {/* Summary cards */}
      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Gauge}
          title="Overall Score"
          value={report.overallScore}
          suffix={<span className="text-lg text-muted-foreground">/100</span>}
          trend={report.overallScore >= 80 ? "Excellent" : report.overallScore >= 60 ? "On track" : "Needs work"}
          tone="blue"
        />
        <SummaryCard
          icon={ShieldCheck}
          title="Interview Readiness"
          value={report.interviewReadiness}
          suffix="%"
          trend={report.interviewReadiness >= 80 ? "Ready" : "Getting there"}
          tone="purple"
        />
        <SummaryCard
          icon={Code2}
          title="Coding Accuracy"
          value={codingAccuracy}
          suffix="%"
          trend={codingAccuracy >= 80 ? "Top 10%" : codingAccuracy >= 60 ? "Solid" : "Practice more"}
          tone="blue"
        />
        <SummaryCard
          icon={Clock}
          title="Avg Time"
          value={avgSecPerQ}
          suffix={<span className="text-lg text-muted-foreground"> sec/q</span>}
          trend={avgSecPerQ < 45 ? "Excellent speed" : "Steady pace"}
          tone="purple"
        />
      </div>

      {/* Analytics: Radar + Progress bars */}
      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-6 md:p-8 shadow-card relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[oklch(0.55_0.2_275)]/25 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-[oklch(0.75_0.16_265)]" />
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Skill Radar</h3>
          </div>
          <RadarChart data={report.radar} />
        </div>
        <div className="glass rounded-3xl p-6 md:p-8 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-4 w-4 text-[oklch(0.72_0.18_290)]" />
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Performance Breakdown</h3>
          </div>
          <PerformanceBars radar={report.radar} weakTopics={report.weakTopics} />
        </div>
      </div>

      {/* AI Analysis */}
      <div className="mt-6 glass rounded-3xl p-6 md:p-8 shadow-card relative overflow-hidden">
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-[oklch(0.55_0.2_275)]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[oklch(0.6_0.2_300)]/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3 mb-4">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl text-white shadow-glow"
            style={{ background: "linear-gradient(135deg, oklch(0.6 0.2 265), oklch(0.6 0.22 300))" }}
          >
            <Brain className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-xl font-semibold tracking-tight">AI Performance Summary</h3>
            <p className="text-xs text-muted-foreground">Generated from your responses</p>
          </div>
        </div>
        <p className="relative text-foreground/85 leading-relaxed max-w-4xl">{report.summary}</p>
        <div className="relative mt-6 grid sm:grid-cols-3 gap-3">
          <InsightPill label="Estimated Study Hours" value={`${studyHours} Hours`} />
          <InsightPill label="Confidence Level" value={`${Math.round(report.radar.confidence)}%`} />
          <InsightPill label="Interview Prediction" value={report.skillLevel === "Expert" || report.skillLevel === "Advanced" ? "Senior-Level Ready" : report.skillLevel === "Intermediate" ? "Mid-Level Ready" : "Junior-Level Ready"} />
        </div>
      </div>

      {/* Strengths / Weaknesses */}
      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <PillsCard title="Strengths" items={report.strengths} tone="success" icon={Check} />
        <PillsCard title="Improvement Areas" items={report.weaknesses.length ? report.weaknesses : report.weakTopics} tone="warning" icon={X} />
      </div>

      {/* Question Analytics */}
      <div className="mt-6 grid lg:grid-cols-[.9fr_1.1fr] gap-4">
        <div className="glass rounded-3xl p-6 md:p-8 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-4 w-4 text-[oklch(0.75_0.16_265)]" />
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Questions Distribution</h3>
          </div>
          <Donut distribution={distribution} />
        </div>
        <div className="glass rounded-3xl p-6 md:p-8 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <Target className="h-4 w-4 text-[oklch(0.72_0.18_290)]" />
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Statistics</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <StatTile label="Correct" value={correctCount} tone="success" />
            <StatTile label="Wrong" value={Math.max(0, wrong)} tone="danger" />
            <StatTile label="Skipped" value={skipped} tone="muted" />
            <StatTile label="Accuracy" value={`${total ? Math.round((correctCount / total) * 100) : 0}%`} tone="blue" />
            <StatTile label="Completion Time" value={`${duration}m`} tone="muted" />
            <StatTile label="Difficulty" value={diff[0].toUpperCase() + diff.slice(1)} tone="purple" />
          </div>
        </div>
      </div>

      {/* Performance Timeline */}
      <div className="mt-6 glass rounded-3xl p-6 md:p-8 shadow-card">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-4 w-4 text-[oklch(0.75_0.16_265)]" />
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Performance Timeline</h3>
        </div>
        <TimelineChart data={timeline} />
      </div>

      {/* Companies */}
      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <CompaniesCard title="Ready to interview" companies={report.companiesReady} tone="primary" icon={Rocket} />
        <CompaniesCard title="Needs improvement" companies={report.companiesNeedsImprovement} tone="danger" icon={Flame} />
      </div>

      {/* Learning roadmap - horizontal weeks */}
      <div className="mt-6 glass rounded-3xl p-6 md:p-8 shadow-card">
        <div className="flex items-center gap-2 mb-6">
          <MapIcon className="h-5 w-5 text-[oklch(0.72_0.18_290)]" />
          <h3 className="text-xl font-semibold tracking-tight">Personalized Learning Roadmap</h3>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {roadmapWeeks.map((w) => (
            <div
              key={w.week}
              className="group relative rounded-2xl border border-border/60 bg-surface/40 p-5 hover:border-[oklch(0.6_0.2_275)]/60 hover:shadow-glow transition-all"
            >
              <div className="absolute inset-x-4 -top-3 h-6 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "linear-gradient(90deg, oklch(0.6 0.2 265), oklch(0.6 0.22 300))" }}
              />
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold text-white"
                style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 265), oklch(0.55 0.22 300))" }}
              >
                Week {w.week}
              </div>
              <ul className="mt-4 space-y-3">
                {w.items.map((it, i) => (
                  <li key={i}>
                    <div className="text-sm font-semibold text-foreground/95">{it.topic}</div>
                    <div className="mt-0.5 text-xs text-[oklch(0.75_0.16_265)]">{it.resource}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <GradientButton onClick={() => window.print()} icon={Download}>Download Report</GradientButton>
        <GradientButton onClick={onRestart} icon={RefreshCw} variant="ghost">Retake Assessment</GradientButton>
        <GradientButton
          onClick={() => {
            const el = document.getElementById("roadmap-anchor");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          icon={RouteIcon}
          variant="ghost"
        >
          View Learning Roadmap
        </GradientButton>
        <GradientButton
          onClick={() => {
            window.location.href = "/mock-interview";
          }}
          icon={PlayCircle}
        >
          Start Mock Interview
        </GradientButton>
      </div>

      {/* Question review */}
      <div id="roadmap-anchor" className="mt-14">
        <h3 className="text-xl font-semibold tracking-tight mb-4">Question review</h3>
        <div className="space-y-3">
          {report.grading.map((g, i) => {
            const q = g.question;
            const scenario = report.scenarioScores.find((s) => s.id === q.id);
            const passed = q.type === "scenario" ? (scenario?.score ?? 0) >= 6 : g.autoCorrect;
            return (
              <details
                key={q.id}
                className="group glass rounded-2xl overflow-hidden border border-border/60"
              >
                <summary className="cursor-pointer list-none p-4 flex items-center gap-3">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${
                      passed
                        ? "bg-primary/15 text-primary"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <TypeBadge type={q.type} />
                      <span>Q{i + 1} · {q.topic}</span>
                    </div>
                    <div className="mt-1 text-sm font-medium truncate">{q.prompt}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <div className="border-t border-border/60 p-5 space-y-3 text-sm">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Your answer
                    </div>
                    <div className="rounded-xl bg-surface/60 p-3">
                      {g.userAnswer || <span className="text-muted-foreground">No answer</span>}
                    </div>
                  </div>
                  {(q.type === "mcq" || q.type === "code") &&
                    q.options &&
                    q.correctIndex != null && (
                      <div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                          Correct answer
                        </div>
                        <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                          {q.options[q.correctIndex]}
                        </div>
                      </div>
                    )}
                  {q.type === "scenario" && q.correctAnswer && (
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                        Model answer
                      </div>
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                        {q.correctAnswer}
                      </div>
                    </div>
                  )}
                  {scenario && (
                    <div className="rounded-xl border border-border/60 bg-surface/40 p-3">
                      <div className="text-xs text-muted-foreground">
                        Scenario score:{" "}
                        <span className="text-foreground font-semibold">{scenario.score}/10</span>
                      </div>
                      <div className="mt-1">{scenario.feedback}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      AI explanation
                    </div>
                    <div className="text-muted-foreground leading-relaxed">{q.explanation}</div>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- Bits ---------------- */

function StepCard({
  step,
  title,
  icon: Icon,
  children,
}: {
  step: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-3xl p-6 md:p-7 shadow-card">
      <div className="flex items-center gap-3">
        <span
          className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground text-sm font-bold shadow-glow"
          style={{ background: "var(--gradient-gold)" }}
        >
          {step}
        </span>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  value,
  onChange,
  locked,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !locked && onChange(!value)}
      disabled={locked}
      className={`text-left rounded-2xl border p-4 transition-all ${
        value
          ? "border-primary/50 bg-primary/5"
          : "border-border/60 bg-surface/40 hover:border-primary/40"
      } ${locked ? "opacity-90 cursor-default" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{label}</div>
          <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{desc}</div>
        </div>
        <span
          className={`mt-1 relative inline-flex h-5 w-9 rounded-full transition-colors ${
            value ? "" : "bg-surface"
          }`}
          style={value ? { background: "var(--gradient-gold)" } : undefined}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform ${
              value ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </span>
      </div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface/40 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold truncate">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface/40 border border-border/60 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function FeatureRow({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          on ? "bg-primary/15 text-primary" : "bg-surface text-muted-foreground"
        }`}
      >
        {on ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
        {on ? "Included" : "Off"}
      </span>
    </div>
  );
}

function MixBar({ mix }: { mix: { mcq: number; code: number; scenario: number } }) {
  const total = Math.max(1, mix.mcq + mix.code + mix.scenario);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface flex">
      <div style={{ width: `${(mix.mcq / total) * 100}%`, background: "oklch(0.85 0.19 130)" }} />
      <div style={{ width: `${(mix.code / total) * 100}%`, background: "oklch(0.72 0.18 200)" }} />
      <div style={{ width: `${(mix.scenario / total) * 100}%`, background: "oklch(0.65 0.18 320)" }} />
    </div>
  );
}

function TypeBadge({ type }: { type: AssessmentQuestion["type"] }) {
  const map = {
    mcq: { label: "MCQ", icon: BrainCircuit },
    code: { label: "Code", icon: Code2 },
    scenario: { label: "Scenario", icon: Lightbulb },
  } as const;
  const it = map[type];
  const Icon = it.icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
      <Icon className="h-3 w-3" /> {it.label}
    </span>
  );
}

function BigScoreRing({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const r = 56;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;
  return (
    <div className="relative h-40 w-40 mx-auto">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={r} strokeWidth="10" className="stroke-border/60" fill="none" />
        <circle
          cx="70"
          cy="70"
          r={r}
          strokeWidth="10"
          fill="none"
          stroke="url(#gBig)"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="gBig" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.92 0.20 130)" />
            <stop offset="100%" stopColor="oklch(0.72 0.22 145)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-5xl font-semibold text-gradient-lime tabular-nums">{v}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
            Overall Score
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarChart({
  data,
}: {
  data: {
    accuracy: number;
    problemSolving: number;
    conceptUnderstanding: number;
    confidence: number;
    codingSkill: number;
    communication: number;
  };
}) {
  const axes = [
    { key: "accuracy", label: "Accuracy" },
    { key: "problemSolving", label: "Problem Solving" },
    { key: "conceptUnderstanding", label: "Concepts" },
    { key: "codingSkill", label: "Coding" },
    { key: "confidence", label: "Confidence" },
    { key: "communication", label: "Communication" },
  ] as const;

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const rMax = 100;

  const points = axes.map((a, i) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    const v = Math.max(0, Math.min(100, data[a.key])) / 100;
    return {
      x: cx + Math.cos(angle) * rMax * v,
      y: cy + Math.sin(angle) * rMax * v,
      lx: cx + Math.cos(angle) * (rMax + 18),
      ly: cy + Math.sin(angle) * (rMax + 18),
      label: a.label,
      value: Math.round(data[a.key]),
    };
  });

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[340px]">
        {gridLevels.map((lvl) => {
          const pts = axes.map((_, i) => {
            const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
            return `${cx + Math.cos(angle) * rMax * lvl},${cy + Math.sin(angle) * rMax * lvl}`;
          });
          return (
            <polygon
              key={lvl}
              points={pts.join(" ")}
              fill="none"
              stroke="oklch(1 0 0 / 0.08)"
              strokeWidth="1"
            />
          );
        })}
        {axes.map((_, i) => {
          const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(angle) * rMax}
              y2={cy + Math.sin(angle) * rMax}
              stroke="oklch(1 0 0 / 0.08)"
            />
          );
        })}
        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="url(#radarFill)"
          stroke="oklch(0.72 0.2 285)"
          strokeWidth="2"
        />
        {points.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r="3.5" fill="oklch(0.75 0.2 275)" />
        ))}
        <defs>
          <linearGradient id="radarFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.22 265 / 0.45)" />
            <stop offset="100%" stopColor="oklch(0.62 0.22 305 / 0.35)" />
          </linearGradient>
        </defs>
        {points.map((p) => (
          <text
            key={`l-${p.label}`}
            x={p.lx}
            y={p.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="currentColor"
            className="fill-muted-foreground"
          >
            {p.label} · {p.value}
          </text>
        ))}
      </svg>
    </div>
  );
}

function ListCard({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "danger";
}) {
  return (
    <div className="glass rounded-3xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg ${
            tone === "primary" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <ul className="space-y-2 text-sm">
        {items.length === 0 && (
          <li className="text-muted-foreground text-xs">Nothing to show yet.</li>
        )}
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-muted-foreground">
            <span
              className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                tone === "primary" ? "bg-primary" : "bg-destructive"
              }`}
            />
            <span className="text-foreground/90">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompaniesCard({
  title,
  companies,
  tone,
  icon: Icon,
}: {
  title: string;
  companies: string[];
  tone: "primary" | "danger";
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="glass rounded-3xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg ${
            tone === "primary" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {companies.length === 0 && (
          <span className="text-xs text-muted-foreground">No companies suggested.</span>
        )}
        {companies.map((c) => (
          <span
            key={c}
            className={`rounded-full px-3 py-1.5 text-sm border ${
              tone === "primary"
                ? "border-primary/30 bg-primary/5 text-foreground"
                : "border-destructive/30 bg-destructive/5 text-foreground"
            }`}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Report bits ---------------- */

function useCountUp(target: number, duration = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  suffix,
  trend,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  suffix?: React.ReactNode;
  trend: string;
  tone: "blue" | "purple";
}) {
  const n = useCountUp(value);
  const grad =
    tone === "blue"
      ? "linear-gradient(135deg, oklch(0.6 0.2 265), oklch(0.65 0.18 245))"
      : "linear-gradient(135deg, oklch(0.6 0.22 295), oklch(0.6 0.2 275))";
  return (
    <div className="group relative rounded-3xl border border-border/60 bg-surface/40 p-5 shadow-card overflow-hidden transition-all hover:-translate-y-1 hover:border-[oklch(0.6_0.2_275)]/50 hover:shadow-glow">
      <div
        className="absolute -top-16 -right-16 h-32 w-32 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity"
        style={{ background: grad }}
      />
      <div className="relative flex items-center gap-3">
        <span
          className="grid h-9 w-9 place-items-center rounded-xl text-white"
          style={{ background: grad }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{title}</div>
      </div>
      <div className="relative mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tabular-nums text-foreground">
          {Math.round(n)}
        </span>
        <span className="text-lg text-muted-foreground">{suffix}</span>
      </div>
      <div className="relative mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[oklch(0.75_0.16_265)]">
        <TrendingUp className="h-3 w-3" /> {trend}
      </div>
    </div>
  );
}

function PerformanceBars({
  radar,
  weakTopics,
}: {
  radar: {
    accuracy: number;
    problemSolving: number;
    conceptUnderstanding: number;
    confidence: number;
    codingSkill: number;
    communication: number;
  };
  weakTopics: string[];
}) {
  const bars: { label: string; value: number }[] = [
    { label: "Accuracy", value: Math.round(radar.accuracy) },
    { label: "Problem Solving", value: Math.round(radar.problemSolving) },
    { label: "Concepts", value: Math.round(radar.conceptUnderstanding) },
    { label: "Coding", value: Math.round(radar.codingSkill) },
    { label: "Confidence", value: Math.round(radar.confidence) },
    { label: "Communication", value: Math.round(radar.communication) },
  ];
  weakTopics.slice(0, 2).forEach((t) => {
    bars.push({ label: t, value: Math.max(20, Math.round(radar.accuracy * 0.5)) });
  });
  return (
    <div className="space-y-4">
      {bars.map((b, i) => (
        <Bar key={b.label} label={b.label} value={b.value} delay={i * 80} />
      ))}
    </div>
  );
}

function Bar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  const tone =
    value >= 75 ? "oklch(0.7 0.18 155)" : value >= 50 ? "oklch(0.72 0.16 260)" : "oklch(0.7 0.2 30)";
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-foreground/85 font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-surface/70 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-out"
          style={{
            width: `${w}%`,
            background: `linear-gradient(90deg, oklch(0.55 0.2 265), ${tone})`,
            boxShadow: `0 0 12px ${tone}`,
          }}
        />
      </div>
    </div>
  );
}

function InsightPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface/40 p-4">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-lg font-semibold text-foreground/95">{value}</div>
    </div>
  );
}

function PillsCard({
  title,
  items,
  tone,
  icon: Icon,
}: {
  title: string;
  items: string[];
  tone: "success" | "warning";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const success = tone === "success";
  return (
    <div className="glass rounded-3xl p-6 md:p-8 shadow-card">
      <div className="flex items-center gap-2 mb-5">
        <span
          className="grid h-8 w-8 place-items-center rounded-lg text-white"
          style={{
            background: success
              ? "linear-gradient(135deg, oklch(0.65 0.18 155), oklch(0.7 0.17 175))"
              : "linear-gradient(135deg, oklch(0.7 0.2 40), oklch(0.65 0.22 25))",
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && (
          <span className="text-xs text-muted-foreground">Nothing to show.</span>
        )}
        {items.map((it) => (
          <span
            key={it}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border ${
              success
                ? "border-[oklch(0.65_0.18_155)]/40 bg-[oklch(0.65_0.18_155)]/10 text-[oklch(0.85_0.15_155)]"
                : "border-[oklch(0.7_0.2_35)]/40 bg-[oklch(0.7_0.2_35)]/10 text-[oklch(0.85_0.16_50)]"
            }`}
          >
            {success ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function Donut({ distribution }: { distribution: { mcq: number; code: number; scenario: number } }) {
  const total = Math.max(1, distribution.mcq + distribution.code + distribution.scenario);
  const segs = [
    { key: "MCQ", val: distribution.mcq, color: "oklch(0.65 0.2 265)" },
    { key: "Coding", val: distribution.code, color: "oklch(0.65 0.22 295)" },
    { key: "Scenario", val: distribution.scenario, color: "oklch(0.75 0.16 240)" },
  ];
  const r = 60;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="h-44 w-44 -rotate-90">
        <circle cx="80" cy="80" r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth="16" fill="none" />
        {segs.map((s) => {
          const len = (s.val / total) * c;
          const el = (
            <circle
              key={s.key}
              cx="80"
              cy="80"
              r={r}
              stroke={s.color}
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-acc}
              strokeLinecap="butt"
            />
          );
          acc += len;
          return el;
        })}
      </svg>
      <div className="space-y-2 text-sm">
        {segs.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-muted-foreground">{s.key}</span>
            <span className="ml-auto font-semibold tabular-nums">{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "success" | "danger" | "muted" | "blue" | "purple";
}) {
  const colors: Record<string, string> = {
    success: "oklch(0.75 0.17 155)",
    danger: "oklch(0.7 0.2 30)",
    muted: "oklch(0.72 0.03 260)",
    blue: "oklch(0.72 0.18 265)",
    purple: "oklch(0.72 0.2 295)",
  };
  return (
    <div className="rounded-2xl border border-border/60 bg-surface/40 p-4">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums" style={{ color: colors[tone] }}>
        {value}
      </div>
    </div>
  );
}

function TimelineChart({ data }: { data: { i: number; val: number }[] }) {
  const W = 800;
  const H = 200;
  const pad = 28;
  if (data.length === 0) return null;
  const stepX = (W - pad * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, idx) => ({
    x: pad + idx * stepX,
    y: H - pad - (d.val / 100) * (H - pad * 2),
  }));
  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
    .join(" ");
  const area = `${path} L ${points[points.length - 1].x},${H - pad} L ${points[0].x},${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56">
      <defs>
        <linearGradient id="tlLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="oklch(0.65 0.22 265)" />
          <stop offset="100%" stopColor="oklch(0.65 0.22 300)" />
        </linearGradient>
        <linearGradient id="tlArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.6 0.2 275 / 0.35)" />
          <stop offset="100%" stopColor="oklch(0.6 0.2 275 / 0)" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((g) => {
        const y = H - pad - (g / 100) * (H - pad * 2);
        return (
          <line key={g} x1={pad} y1={y} x2={W - pad} y2={y} stroke="oklch(1 0 0 / 0.06)" />
        );
      })}
      <path d={area} fill="url(#tlArea)" />
      <path
        d={path}
        fill="none"
        stroke="url(#tlLine)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="oklch(0.7 0.2 285)" />
          <text
            x={p.x}
            y={H - 6}
            textAnchor="middle"
            fontSize="10"
            className="fill-muted-foreground"
          >
            Q{data[i].i}
          </text>
        </g>
      ))}
    </svg>
  );
}

function GradientButton({
  children,
  onClick,
  icon: Icon,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "primary" | "ghost";
}) {
  const primary = variant === "primary";
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
        primary
          ? "text-white shadow-glow hover:scale-[1.03]"
          : "glass hover:bg-surface text-foreground/90"
      }`}
      style={
        primary
          ? { background: "linear-gradient(135deg, oklch(0.55 0.22 265), oklch(0.55 0.24 300))" }
          : undefined
      }
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function HologramIllustration() {
  const cards = [
    { label: "Accuracy", val: "92%", x: "5%", y: "10%" },
    { label: "Coding", val: "87%", x: "72%", y: "8%" },
    { label: "Concepts", val: "78%", x: "0%", y: "62%" },
    { label: "Readiness", val: "91%", x: "70%", y: "70%" },
  ];
  return (
    <div className="relative aspect-[5/4] w-full max-w-lg justify-self-end">
      <div className="absolute inset-0 rounded-[2rem] glass shadow-card overflow-hidden">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.55 0.2 275 / 0.35), transparent 70%), radial-gradient(ellipse 50% 40% at 20% 80%, oklch(0.55 0.22 300 / 0.3), transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-grid opacity-20" />

        {/* Central hologram orb */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-32 w-32">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-70 animate-float-slow"
              style={{ background: "linear-gradient(135deg, oklch(0.6 0.22 265), oklch(0.6 0.24 300))" }}
            />
            <div className="absolute inset-2 rounded-full border border-white/20" />
            <div className="absolute inset-6 rounded-full border border-white/10" />
            <div className="absolute inset-0 grid place-items-center">
              <BrainCircuit className="h-10 w-10 text-white/90" />
            </div>
          </div>
        </div>

        {/* Neon connecting lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 320" preserveAspectRatio="none">
          <defs>
            <linearGradient id="nl" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.7 0.22 265)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="oklch(0.7 0.22 300)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M60 60 Q 200 160 90 240" stroke="url(#nl)" strokeWidth="1.2" fill="none" />
          <path d="M340 50 Q 200 160 330 250" stroke="url(#nl)" strokeWidth="1.2" fill="none" />
          <path d="M60 60 Q 200 100 340 50" stroke="url(#nl)" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M90 240 Q 200 220 330 250" stroke="url(#nl)" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>

        {/* Analytics chips */}
        {cards.map((c, i) => (
          <div
            key={c.label}
            className="absolute glass rounded-xl px-3 py-2 text-xs animate-float-slow"
            style={{ top: c.y, left: c.x, animationDelay: `${i * 0.8}s` }}
          >
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.label}</div>
            <div
              className="mt-0.5 font-semibold tabular-nums"
              style={{
                background: "linear-gradient(135deg, oklch(0.75 0.2 265), oklch(0.75 0.2 300))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {c.val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Hero illustration ---------------- */

function HeroIllustration() {
  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 30% 30%, oklch(0.82 0.14 82 / 0.18), transparent 70%), radial-gradient(ellipse 60% 60% at 80% 70%, oklch(0.6 0.18 255 / 0.16), transparent 70%)",
        }}
      />

      <div className="grid grid-cols-[1.55fr_1fr] gap-4">
        {/* Editor */}
        <div className="overflow-hidden rounded-[20px] border border-border/60 bg-background/70 shadow-card backdrop-blur">
          <div className="flex items-center gap-2 border-b border-border/50 bg-surface/60 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/80" />
            <span
              className="ml-2 text-[11px] text-muted-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Solution.java
            </span>
            <span className="ml-auto rounded-md border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
              Java
            </span>
          </div>

          <pre
            className="overflow-hidden whitespace-pre-wrap px-4 py-4 text-[10.5px] leading-[1.75] text-muted-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
{`public class Solution {
  public static int[] twoSum(int[] a, int t) {
    Map<Integer, Integer> m = new HashMap<>();
    for (int i = 0; i < a.length; i++) {
      int rem = t - a[i];
      if (m.containsKey(rem))
        return new int[]{ m.get(rem), i };
      m.put(a[i], i);
    }
    return new int[]{};
  }
}`}
          </pre>

          <div className="border-t border-border/50 bg-surface/50 px-4 py-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-primary">
                <Sparkles className="h-3 w-3" /> AI is analyzing…
              </span>
              <span className="text-muted-foreground">Time &amp; space complexity</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/70">
              <div
                className="h-full w-2/3 animate-pulse rounded-full"
                style={{ background: "var(--gradient-gold)" }}
              />
            </div>
          </div>
        </div>

        {/* Side panels */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[20px] border border-border/60 bg-surface/50 p-4 shadow-card backdrop-blur">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Overall accuracy
            </div>
            <div className="mt-3 flex items-center gap-3">
              <svg viewBox="0 0 44 44" className="h-16 w-16 -rotate-90">
                <circle cx="22" cy="22" r="18" fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="5" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="oklch(0.75 0.17 155)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${0.82 * 2 * Math.PI * 18} ${2 * Math.PI * 18}`}
                />
              </svg>
              <div>
                <div className="text-2xl font-semibold tabular-nums">82%</div>
                <div className="text-[10px] text-muted-foreground">Great performance</div>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-border/60 bg-surface/50 p-4 shadow-card backdrop-blur">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Weak areas
            </div>
            <ul className="mt-2.5 space-y-1.5 text-[11px] text-foreground/85">
              {[
                { t: "Dynamic Programming", c: "oklch(0.7 0.2 30)" },
                { t: "Multithreading", c: "oklch(0.82 0.14 82)" },
                { t: "System Design", c: "oklch(0.6 0.18 255)" },
              ].map((w) => (
                <li key={w.t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: w.c }} />
                  {w.t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[20px] border border-border/60 bg-surface/50 p-4 shadow-card backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Performance trend
              </div>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-semibold text-primary">
                Improving
              </span>
            </div>
            <svg viewBox="0 0 120 40" className="mt-2 h-14 w-full">
              <defs>
                <linearGradient id="heroTrend" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.82 0.14 82 / 0.35)" />
                  <stop offset="100%" stopColor="oklch(0.82 0.14 82 / 0)" />
                </linearGradient>
              </defs>
              <path
                d="M2 32 L20 27 L38 29 L56 20 L74 16 L92 12 L118 6"
                fill="none"
                stroke="oklch(0.82 0.14 82)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 32 L20 27 L38 29 L56 20 L74 16 L92 12 L118 6 L118 40 L2 40 Z"
                fill="url(#heroTrend)"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
