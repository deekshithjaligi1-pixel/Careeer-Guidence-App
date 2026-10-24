import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Brain,
  Briefcase,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Loader2,
  MessagesSquare,
  Mic,
  MicOff,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import {
  evaluateAnswer,
  generateReport,
  generateQuestions,
  type InterviewConfig,
  type InterviewTurn,
} from "@/lib/interview.functions";
import { buildFallbackQuestions, skillsForRole } from "@/lib/interview-bank";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mock-interview")({
  head: () => ({
    meta: [
      { title: "AI Interview Simulator — Nexora" },
      {
        name: "description",
        content:
          "Practice realistic AI-powered technical and HR interviews. Instant feedback, adaptive questions, and a full performance report.",
      },
    ],
  }),
  component: MockInterviewPage,
});

type Phase = "setup" | "session" | "results";

const ROLES = [
  "Java Developer",
  "Spring Boot Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "Software Engineer",
  "Python Developer",
  "Data Analyst",
  "Custom Role",
];

const SKILL_LIBRARY = [
  "Java", "Spring Boot", "SQL", "REST API", "Hibernate", "Microservices",
  "React", "JavaScript", "TypeScript", "Node.js", "Python", "Data Structures",
  "Algorithms", "System Design", "Git", "Docker", "AWS", "Kubernetes",
];

const DURATIONS = [5, 10, 15, 20, 30];

const questionsByDifficulty = { easy: 5, medium: 8, hard: 10 } as const;

function MockInterviewPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [history, setHistory] = useState<InterviewTurn[]>([]);
  const [report, setReport] = useState<Awaited<ReturnType<typeof generateReport>> | null>(null);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />

      <AnimatePresence mode="wait">
        {phase === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <SetupView
              onStart={(cfg) => {
                setConfig(cfg);
                setHistory([]);
                setReport(null);
                setPhase("session");
              }}
            />
          </motion.div>
        )}

        {phase === "session" && config && (
          <motion.div
            key="session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SessionView
              config={config}
              onComplete={async (turns) => {
                setHistory(turns);
                setPhase("results");
                try {
                  const r = await generateReport({ data: { config, history: turns } });
                  setReport(r);

                  // Persist to Supabase if authenticated
                  try {
                    const { data: sessionData } = await supabase.auth.getSession();
                    const user = sessionData?.session?.user;
                    if (user) {
                      const { data: interviewRow } = await supabase
                        .from("mock_interviews")
                        .insert({
                          user_id: user.id,
                          interview_type: config.type,
                          difficulty: config.difficulty,
                          score: r.overall,
                        })
                        .select()
                        .single();

                      if (interviewRow) {
                        await supabase.from("interview_reports").insert({
                          interview_id: interviewRow.id,
                          user_id: user.id,
                          strengths: r.strengths,
                          weaknesses: r.weaknesses,
                          feedback: r.recommendation,
                          recommendations: r.recommendedTopics,
                          detailed_report: r,
                        });
                      }
                    }
                  } catch (dbErr) {
                    console.warn("Failed to persist mock interview to Supabase:", dbErr);
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
              onExit={() => setPhase("setup")}
            />
          </motion.div>
        )}

        {phase === "results" && config && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResultsView
              report={report}
              history={history}
              onRestart={() => {
                setPhase("setup");
                setReport(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================== SETUP VIEW ============================== */

function SetupView({ onStart }: { onStart: (cfg: InterviewConfig) => void }) {
  const [role, setRole] = useState<string>("Java Developer");
  const [type, setType] = useState<InterviewConfig["type"]>("technical");
  const [difficulty, setDifficulty] = useState<InterviewConfig["difficulty"]>("medium");
  const [duration, setDuration] = useState<number>(15);
  const [skills, setSkills] = useState<string[]>(["Java", "Spring Boot", "SQL"]);
  const [language, setLanguage] = useState<InterviewConfig["language"]>("english");
  const [starting, setStarting] = useState(false);

  const totalQuestions = questionsByDifficulty[difficulty];

  // Keep the tested skills aligned with the selected role so questions stay role-specific.
  const changeRole = (r: string) => {
    setRole(r);
    const suggested = skillsForRole(r);
    if (suggested.length) setSkills(suggested);
  };

  const handleStart = () => {
    setStarting(true);
    const effectiveSkills = skills.length ? skills : skillsForRole(role);
    onStart({
      role,
      type,
      difficulty,
      duration,
      skills: effectiveSkills,
      language,
      totalQuestions,
    });
  };

  const toggleSkill = (s: string) =>
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));


  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 py-16 md:py-24">
      {/* Hero */}
      <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Powered by Gemini AI
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            AI Interview <span className="text-gradient-lime">Simulator</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl">
            Practice realistic AI-powered technical and HR interviews. Receive instant feedback,
            improve your communication, strengthen your technical skills, and prepare with
            confidence for real placement interviews.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "Personalized Questions",
              "Instant AI Feedback",
              "Company-Level Practice",
            ].map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs text-foreground/90"
              >
                <Check className="h-3.5 w-3.5 text-primary" /> {b}
              </span>
            ))}
          </div>
        </div>

        <HeroIllustration />
      </div>

      {/* Setup card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="mt-16 glass rounded-3xl p-6 md:p-10 shadow-card"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Prepare Your Interview
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Configure your interview before starting.
            </p>
          </div>
          <div className="text-xs text-muted-foreground rounded-full glass px-3 py-1.5">
            {totalQuestions} adaptive questions · ~{duration} min
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          {/* Role */}
          <Field label="Role" hint="Choose the position you're preparing for.">
            <div className="relative">
              <Briefcase className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={role}
                onChange={(e) => changeRole(e.target.value)}
                className="w-full appearance-none rounded-xl bg-surface border border-border/60 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronRight className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-muted-foreground" />
            </div>
          </Field>

          {/* Language */}
          <Field label="Interview Language">
            <div className="grid grid-cols-2 gap-2">
              {(["english", "hindi"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`rounded-xl border py-3 text-sm capitalize transition-all ${
                    language === l
                      ? "border-primary/60 bg-primary/10 text-foreground shadow-glow"
                      : "border-border/60 bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </Field>

          {/* Type */}
          <Field label="Interview Type" full hint="Only one can be selected.">
            <div className="grid sm:grid-cols-3 gap-3">
              <TypeCard
                icon={UserRound}
                title="HR Interview"
                desc="Professional communication questions."
                selected={type === "hr"}
                onClick={() => setType("hr")}
              />
              <TypeCard
                icon={Code2}
                title="Technical"
                desc="Programming and technical concepts."
                selected={type === "technical"}
                onClick={() => setType("technical")}
              />
              <TypeCard
                icon={Brain}
                title="Mixed"
                desc="Combination of HR and Technical."
                selected={type === "mixed"}
                onClick={() => setType("mixed")}
              />
            </div>
          </Field>

          {/* Difficulty */}
          <Field label="Difficulty Level" full>
            <div className="grid sm:grid-cols-3 gap-3">
              {([
                { k: "easy", label: "Easy", desc: "Beginner level · 5 questions" },
                { k: "medium", label: "Medium", desc: "Interview level · 8 questions" },
                { k: "hard", label: "Hard", desc: "Advanced industry · 10 questions" },
              ] as const).map((d) => (
                <button
                  key={d.k}
                  onClick={() => setDifficulty(d.k)}
                  className={`text-left rounded-2xl border p-4 transition-all ${
                    difficulty === d.k
                      ? "border-primary/60 bg-primary/10 shadow-glow"
                      : "border-border/60 bg-surface hover:border-border"
                  }`}
                >
                  <div className="text-sm font-semibold">{d.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{d.desc}</div>
                </button>
              ))}
            </div>
          </Field>

          {/* Duration */}
          <Field label="Interview Duration" full>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`rounded-full px-4 py-2 text-sm border transition-all ${
                    duration === d
                      ? "border-primary/60 bg-primary/10 text-foreground shadow-glow"
                      : "border-border/60 bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d} Minutes
                </button>
              ))}
            </div>
          </Field>

          {/* Skills */}
          <Field label="Skills" full hint="Select the skills you want to be tested on.">
            <div className="flex flex-wrap gap-2">
              {SKILL_LIBRARY.map((s) => {
                const active = skills.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border transition-all ${
                      active
                        ? "border-primary/60 bg-primary/15 text-foreground"
                        : "border-border/60 bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {active && <Check className="h-3 w-3 text-primary" />}
                    {s}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6">
          <p className="text-xs text-muted-foreground">
            Adaptive AI — questions evolve based on your answers.
          </p>
          <button
            disabled={starting || (type !== "hr" && skills.length === 0)}
            onClick={handleStart}
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "var(--gradient-gold)" }}
          >
            {starting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Starting…
              </>
            ) : (
              <>
                Start AI Interview
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </section>
  );
}

function Field({
  label,
  hint,
  full,
  children,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "lg:col-span-2" : ""}>
      <div className="flex items-baseline justify-between mb-2.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TypeCard({
  icon: Icon,
  title,
  desc,
  selected,
  onClick,
}: {
  icon: typeof UserRound;
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl border p-5 transition-all ${
        selected
          ? "border-primary/60 bg-primary/10 shadow-glow"
          : "border-border/60 bg-surface hover:border-border"
      }`}
    >
      <div
        className={`inline-grid h-10 w-10 place-items-center rounded-xl ${
          selected ? "text-primary-foreground" : "bg-surface-2 text-foreground"
        }`}
        style={selected ? { background: "var(--gradient-gold)" } : undefined}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="mt-4 text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </button>
  );
}

function HeroIllustration() {
  return (
    <div className="relative">
      <div className="relative aspect-[5/4] rounded-3xl glass p-6 overflow-hidden shadow-card">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: "var(--gradient-hero)" }}
        />
        {/* Fake interview dashboard */}
        <div className="relative h-full flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/80" />
            </div>
            <div className="text-[10px] text-muted-foreground">Interview Room · Live</div>
          </div>
          <div className="mt-5 rounded-xl bg-surface/70 border border-border/60 p-3">
            <div className="text-[10px] uppercase tracking-widest text-primary">
              Question 03 · Technical
            </div>
            <div className="mt-1.5 text-[13px] leading-relaxed text-foreground/90">
              Explain the difference between <span className="text-primary">HashMap</span> and{" "}
              <span className="text-primary">ConcurrentHashMap</span>.
            </div>
          </div>
          <div className="mt-3 flex-1 rounded-xl bg-background/60 border border-border/60 p-3 font-mono text-[11px] text-muted-foreground">
            <span className="text-primary">{'>'} </span>HashMap is not thread-safe...
            <span className="animate-pulse">▍</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Score", val: "8.4" },
              { label: "Fluency", val: "92%" },
              { label: "Timer", val: "12:40" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-surface/70 border border-border/60 p-2 text-center">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                <div className="text-sm font-semibold text-foreground">{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/30 blur-3xl animate-float-slow" />
      <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-primary/20 blur-3xl animate-float-slower" />
    </div>
  );
}

/* ============================== SESSION VIEW ============================== */

type Feedback = Awaited<ReturnType<typeof evaluateAnswer>>;

function SessionView({
  config,
  onComplete,
  onExit,
}: {
  config: InterviewConfig;
  onComplete: (history: InterviewTurn[]) => void;
  onExit: () => void;
}) {
  const questionsFn = useServerFn(generateQuestions);
  const evalFn = useServerFn(evaluateAnswer);

  const [questions, setQuestions] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<InterviewTurn[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(config.duration * 60);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  isListeningRef.current = isListening;

  const question = questions[qIndex] ?? null;
  const total = questions.length || config.totalQuestions;

  const historyRef = useRef<InterviewTurn[]>([]);
  historyRef.current = history;
  const finishedRef = useRef(false);

  // Initialize Web Speech API for candidate voice-to-text
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = config.language === "hindi" ? "hi-IN" : "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          const text = item[0].transcript.trim();
          if (text) {
            setAnswer((prev) => {
              const cleaned = prev.trim();
              if (!cleaned) return text;
              return `${cleaned} ${text}`;
            });
          }
        } else {
          currentTranscript += item[0].transcript;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setSpeechError("Microphone access was denied. Please allow mic permissions.");
      } else if (event.error !== "no-speech") {
        setSpeechError(`Voice input: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      // If user still intended to listen and wasn't manually stopped, restart (browser auto-cutoff handling)
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isListeningRef.current = false;
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [config.language]);

  const toggleListening = () => {
    if (!speechSupported) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      isListeningRef.current = false;
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        setSpeechError(null);
        isListeningRef.current = true;
        recognition.start();
      } catch (err) {
        console.warn("Error starting speech recognition:", err);
      }
    }
  };

  // Stop mic whenever we navigate/advance/submit
  const stopListening = () => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const finish = (turns: InterviewTurn[]) => {
    stopListening();
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete(turns);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    (async () => {
      let list: string[] = [];
      try {
        const r = await questionsFn({ data: config });
        list = Array.isArray(r?.questions)
          ? r.questions.filter((q) => typeof q === "string" && q.trim())
          : [];
      } catch (e) {
        console.error(e);
      }
      if (!list.length) {
        try {
          list = buildFallbackQuestions({
            type: config.type,
            difficulty: config.difficulty,
            skills: config.skills,
            totalQuestions: config.totalQuestions,
          });
        } catch (e) {
          console.error(e);
        }
      }
      if (cancelled) return;
      if (!list.length) {
        setLoadError(
          "We couldn't prepare your interview questions right now. Your setup is saved — please retry.",
        );
        setLoading(false);
        return;
      }
      setQuestions(list);
      setQIndex(0);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [config, questionsFn, attempt]);

  // Timer starts only once the interview screen is actually live.
  useEffect(() => {
    if (loading || loadError) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [loading, loadError]);

  // Time up → finish with whatever has been answered so far.
  useEffect(() => {
    if (!loading && !loadError && secondsLeft === 0) {
      finish(historyRef.current);
    }
  }, [secondsLeft, loading, loadError]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const progress = (qIndex / total) * 100;

  const submit = async (skipped = false) => {
    if (!question || submitting) return;
    stopListening();
    setSubmitting(true);
    const finalAnswer = skipped ? "[skipped]" : answer.trim();
    const isLast = qIndex + 1 >= total;
    const newTurn: InterviewTurn = { question, answer: finalAnswer };
    try {
      const evalResult = await evalFn({
        data: {
          config: { ...config, totalQuestions: total },
          history,
          currentQuestion: question,
          answer: finalAnswer || "[no answer]",
          questionIndex: qIndex,
        },
      });
      setFeedback({ ...evalResult, isLast });
      newTurn.score = evalResult.score;
    } catch (e) {
      console.error(e);
      setFeedback({
        score: skipped ? 0 : 5,
        strengths: [],
        improvements: ["Feedback could not be generated for this answer."],
        suggestion: "Continue with the interview — your answer has been recorded.",
        isLast,
      });
      newTurn.score = skipped ? 0 : 5;
    } finally {
      setHistory((h) => {
        const next = [...h, newTurn];
        historyRef.current = next;
        return next;
      });
      setSubmitting(false);
    }
  };

  const advance = () => {
    if (!feedback) return;
    stopListening();
    if (feedback.isLast || qIndex + 1 >= total) {
      finish(historyRef.current);
      return;
    }
    setQIndex((i) => i + 1);
    setAnswer("");
    setFeedback(null);
  };

  const endInterview = () => {
    stopListening();
    if (historyRef.current.length === 0) {
      onExit();
      return;
    }
    finish(historyRef.current);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="sticky top-16 z-20 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-full bg-surface border border-border/60 px-3 py-1.5 font-medium">
              {config.role}
            </span>
            <span className="rounded-full bg-surface border border-border/60 px-3 py-1.5 capitalize">
              {config.difficulty} · {config.type}
            </span>
          </div>
          <div className="flex-1 min-w-[160px]">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Question {Math.min(qIndex + 1, total)} of {total}</span>
              <span className="inline-flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3" /> {mm}:{ss}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-surface overflow-hidden">
              <motion.div
                className="h-full"
                style={{ background: "var(--gradient-gold)" }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <button
            onClick={endInterview}
            className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> End Interview
          </button>
        </div>
      </div>

      <section className="mx-auto max-w-4xl px-4 md:px-8 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Preparing your interview room…
            </p>
          </div>
        ) : loadError ? (
          <div className="glass rounded-3xl p-8 md:p-10 shadow-card text-center">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="mt-3 text-sm text-muted-foreground">{loadError}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setAttempt((a) => a + 1)}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
                style={{ background: "var(--gradient-gold)" }}
              >
                Retry
              </button>
              <button
                onClick={onExit}
                className="rounded-full border border-border/60 bg-surface px-6 py-2.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Back to setup
              </button>
            </div>
          </div>
        ) : feedback ? (
          <FeedbackCard feedback={feedback} onNext={advance} />
        ) : (
          <motion.div
            key={question}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Question Card */}
            <div className="glass rounded-3xl p-6 md:p-10 shadow-card relative overflow-hidden">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-primary font-semibold">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/20 text-primary">
                    <Volume2 className="h-3 w-3" />
                  </span>
                  Interviewer Question
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {qIndex + 1} / {total}
                </span>
              </div>
              <h2 className="mt-4 text-2xl md:text-3xl font-semibold leading-snug tracking-tight">
                {question}
              </h2>
            </div>

            {/* Candidate Response Section with Mic button */}
            <div className="mt-6 glass rounded-3xl p-4 md:p-6 shadow-card border border-border/70">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Response
                  </span>
                  {isListening && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-[11px] font-medium text-red-400 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      Listening to microphone…
                    </span>
                  )}
                </div>

                {/* Candidate Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all shadow-sm ${
                    isListening
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-400/50 animate-pulse"
                      : "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary"
                  }`}
                  title={isListening ? "Click to stop microphone recording" : "Click to speak your answer with microphone"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 text-white" />
                      <span>Stop Microphone</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 text-primary" />
                      <span>Speak Answer (Mic)</span>
                    </>
                  )}
                </button>
              </div>

              {speechError && (
                <div className="mt-3 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
                  <X className="h-3.5 w-3.5 shrink-0 cursor-pointer" onClick={() => setSpeechError(null)} />
                  <span>{speechError}</span>
                </div>
              )}

              <div className="relative mt-3">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={
                    isListening
                      ? "Listening... Speak now and your words will appear here automatically."
                      : "Type your answer here or click 'Speak Answer (Mic)' to speak into your microphone…"
                  }
                  className="w-full min-h-[220px] resize-y rounded-2xl bg-surface/30 border border-border/30 p-4 text-[15px] leading-relaxed focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground transition-colors"
                />

                {isListening && (
                  <div className="absolute right-4 bottom-4 pointer-events-none flex items-center gap-1 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/60">
                    <div className="h-2 w-1 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                    <div className="h-3 w-1 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                    <div className="h-4 w-1 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                    <div className="h-2 w-1 bg-primary rounded-full animate-bounce [animation-delay:100ms]" />
                    <span className="text-[10px] font-mono text-muted-foreground ml-1.5">Live Audio</span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span className="text-[11px] opacity-75">You can edit the transcribed text anytime before submitting.</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 justify-end">
              <button
                onClick={() => submit(true)}
                disabled={submitting}
                className="rounded-full border border-border/60 bg-surface px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Skip Question
              </button>
              <button
                onClick={() => submit(false)}
                disabled={submitting || answer.trim().length < 3}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "var(--gradient-gold)" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Evaluating…
                  </>
                ) : (
                  <>Submit Answer <ChevronRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}

function FeedbackCard({ feedback, onNext }: { feedback: Feedback; onNext: () => void }) {
  const scorePct = (feedback.score / 10) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-6 md:p-10 shadow-card"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
        <ScoreRing value={scorePct} label={`${feedback.score.toFixed(1)}/10`} />
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-widest text-primary">
            <Award className="h-3 w-3" /> AI Feedback
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            {feedback.score >= 8
              ? "Strong answer"
              : feedback.score >= 5
              ? "Solid — with room to grow"
              : "Needs improvement"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {feedback.suggestion}
          </p>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <FeedbackList
          title="Strengths"
          items={feedback.strengths}
          tone="positive"
        />
        <FeedbackList
          title="Areas to improve"
          items={feedback.improvements}
          tone="warning"
        />
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-gold)" }}
        >
          {feedback.isLast ? "See Final Report" : "Next Question"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function FeedbackList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "positive" | "warning";
}) {
  const dot = tone === "positive" ? "bg-primary" : "bg-orange-400";
  return (
    <div className="rounded-2xl border border-border/60 bg-surface/60 p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{title}</div>
      <ul className="mt-3 space-y-2">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-foreground/90">
            <span className={`mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0 ${dot}`} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-32 w-32 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} strokeWidth="8" className="stroke-surface-2 fill-none" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          strokeWidth="8"
          strokeLinecap="round"
          className="fill-none"
          stroke="url(#ringGrad)"
          initial={{ strokeDasharray: c, strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.92 0.20 130)" />
            <stop offset="100%" stopColor="oklch(0.82 0.22 140)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-xl font-semibold">{label}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</div>
        </div>
      </div>
    </div>
  );
}

/* ============================== RESULTS VIEW ============================== */

type Report = Awaited<ReturnType<typeof generateReport>>;

function ResultsView({
  report,
  history,
  onRestart,
}: {
  report: Report | null;
  history: InterviewTurn[];
  onRestart: () => void;
}) {
  const avg = useMemo(() => {
    const scored = history.filter((h) => typeof h.score === "number");
    if (!scored.length) return 0;
    return scored.reduce((a, b) => a + (b.score ?? 0), 0) / scored.length;
  }, [history]);

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-24 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <h2 className="mt-6 text-3xl font-semibold tracking-tight">
          Generating your report…
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Analyzing {history.length} answers · avg {avg.toFixed(1)}/10
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Overall", value: report.overall, icon: Award },
    { label: "Technical", value: report.technical, icon: Code2 },
    { label: "Communication", value: report.communication, icon: MessagesSquare },
    { label: "Problem Solving", value: report.problemSolving, icon: Brain },
    { label: "Confidence", value: report.confidence, icon: Zap },
    { label: "Time Management", value: report.timeManagement, icon: Clock },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 md:px-8 py-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs text-primary">
          <Sparkles className="h-3 w-3" /> Interview Completed
        </span>
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          Nice work — here's how <span className="text-gradient-lime">you did</span>.
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          A complete breakdown of your performance with actionable next steps.
        </p>
      </div>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-2xl p-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div className="text-4xl font-semibold">{s.value}</div>
              <ScoreRing value={s.value} label={`${s.value}%`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
            <TrendingUp className="h-3.5 w-3.5" /> Strengths
          </div>
          <ul className="mt-4 space-y-3">
            {report.strengths.map((s, i) => (
              <li key={i} className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-orange-400">
            <Target className="h-3.5 w-3.5" /> Weak Areas
          </div>
          <ul className="mt-4 space-y-3">
            {report.weaknesses.map((s, i) => (
              <li
                key={i}
                className="rounded-xl border border-orange-400/30 bg-orange-400/5 p-3 text-sm"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">Recommended Topics</h2>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.recommendedTopics.map((t) => (
            <div key={t.topic} className="glass rounded-2xl p-5 shadow-card">
              <div className="text-sm font-semibold">{t.topic}</div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Current level</span>
                  <span className="text-foreground">{t.currentLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target level</span>
                  <span className="text-primary">{t.recommendedLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Study time</span>
                  <span className="text-foreground">{t.studyTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 glass rounded-3xl p-8 shadow-card">
        <div className="text-xs uppercase tracking-widest text-primary">AI Recommendation</div>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
          {report.recommendation}
        </p>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-gold)" }}
        >
          Take Another Interview <ChevronRight className="h-4 w-4" />
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface px-6 py-3 text-sm text-foreground"
        >
          Return to Dashboard
        </Link>
      </div>
    </section>
  );
}