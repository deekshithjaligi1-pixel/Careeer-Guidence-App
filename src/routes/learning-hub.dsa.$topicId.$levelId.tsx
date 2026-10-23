import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Code2,
} from "lucide-react";
import { getAllLevels } from "@/lib/dsa-curriculum";
import { getRoadmapTopic } from "@/lib/dsa-roadmap";
import { useDsaProgress } from "@/hooks/useDsaProgress";
import { useSolvedProblems } from "@/hooks/useSolvedProblems";
import { LevelQuiz } from "@/components/LevelQuiz";
import { CodingWorkspace } from "@/components/CodingWorkspace";
import { DifficultyBadge, ProblemList, SectionLabel } from "@/components/dsa/DsaUi";
import { toast } from "sonner";

export const Route = createFileRoute("/learning-hub/dsa/$topicId/$levelId")({
  component: DsaLevelPage,
});

type LessonTab = "learn" | "quiz" | "code";

const LANGUAGE_LABEL: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
};

function DsaLevelPage() {
  const { topicId, levelId } = Route.useParams();
  // Keyed so tab and quiz state reset when moving between lessons.
  return <LessonView key={`${topicId}_${levelId}`} topicId={topicId} levelId={levelId} />;
}

function LessonView({ topicId, levelId }: { topicId: string; levelId: string }) {
  const { progress, markQuizCompleted, markCodingCompleted } = useDsaProgress();
  const { isSolved, toggle } = useSolvedProblems();
  const [activeTab, setActiveTab] = useState<LessonTab>("learn");

  const allLevels = getAllLevels();
  const currentIdx = allLevels.findIndex((l) => l.topicId === topicId && l.level.id === levelId);
  const current = allLevels[currentIdx];

  if (!current) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 pb-20 pt-32 text-center">
        <h2 className="text-2xl font-bold text-foreground">Lesson not found</h2>
        <p className="text-sm text-muted-foreground">This DSA lesson doesn't exist.</p>
        <Link
          to="/learning-hub/dsa"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-gold)" }}
        >
          Back to roadmap
        </Link>
      </div>
    );
  }

  const { topic, level } = current;
  const roadmap = getRoadmapTopic(topic.id);
  const prevLevel = currentIdx > 0 ? allLevels[currentIdx - 1] : null;
  const nextLevel = currentIdx < allLevels.length - 1 ? allLevels[currentIdx + 1] : null;
  const lessonNumber = topic.levels.findIndex((l) => l.id === level.id) + 1;

  const levelState = progress.completedLevels[`${topicId}_${levelId}`];
  const isQuizPassed = levelState?.quizPassed ?? false;
  const isCodingDone = levelState?.codingCompleted ?? false;
  const isCompleted = levelState?.completed ?? false;
  const hasCoding = level.requiresCoding && Boolean(level.codingChallenge);

  const handleQuizPassed = (score: number) => {
    markQuizCompleted(topicId, levelId, score, true);
    toast.success(`Quiz passed: ${score}/${level.quiz.questions.length}`);
  };

  const handleCodingSuccess = (code: string) => {
    markCodingCompleted(topicId, levelId, code);
    toast.success("Coding challenge solved!");
  };

  const tabs: { id: LessonTab; label: string; icon: typeof BookOpen; done?: boolean }[] = [
    { id: "learn", label: "Learn", icon: BookOpen },
    { id: "quiz", label: "Quiz", icon: Award, done: isQuizPassed },
    ...(hasCoding ? [{ id: "code" as const, label: "Code", icon: Code2, done: isCodingDone }] : []),
  ];

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-28 md:px-8">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/learning-hub" className="transition hover:text-foreground">
          Learning Hub
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/learning-hub/dsa" className="transition hover:text-foreground">
          DSA Roadmap
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{topic.title}</span>
      </nav>

      {/* Header */}
      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-[0.14em] text-primary">
            Topic {topic.order} · {topic.title}
          </span>
          <span>
            Lesson {lessonNumber} of {topic.levels.length}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {level.estimatedMinutes} min
          </span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </span>
          )}
        </div>
        <h1
          className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {level.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {level.shortDesc}
        </p>
      </header>

      {/* Tabs */}
      <div className="mt-8 border-b border-border/70">
        <div className="-mb-px flex gap-6 overflow-x-auto" role="tablist">
          {tabs.map(({ id, label, icon: Icon, done }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition ${
                activeTab === id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Coding gets the full width; other tabs get the topic sidebar */}
      {activeTab === "code" && hasCoding && level.codingChallenge ? (
        <div className="mt-8">
          <CodingWorkspace
            challenge={level.codingChallenge}
            topicId={topicId}
            levelId={levelId}
            onSuccess={handleCodingSuccess}
            savedCode={levelState?.lastCodeSnippet}
            isAlreadyCompleted={isCodingDone}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0">
            {activeTab === "learn" && (
              <article className="space-y-8">
                <p className="rounded-2xl border-l-2 border-primary bg-surface/60 px-5 py-4 text-sm leading-relaxed text-foreground/90 md:text-base">
                  {level.theory.summary}
                </p>

                {level.theory.sections.map((sec, idx) => (
                  <section key={idx} className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground md:text-xl">{sec.heading}</h2>
                    <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground md:text-[15px]">
                      {sec.content}
                    </p>

                    {sec.codeSnippet && (
                      <div className="overflow-hidden rounded-xl border border-border/70 bg-[#0b0f19]">
                        <div className="border-b border-border/60 px-4 py-2 text-xs text-muted-foreground">
                          {LANGUAGE_LABEL[sec.codeSnippet.language] ?? sec.codeSnippet.language}
                        </div>
                        <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-emerald-200">
                          <code>{sec.codeSnippet.code}</code>
                        </pre>
                      </div>
                    )}

                    {sec.complexity && (
                      <div className="grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-2">
                        <div className="bg-surface px-4 py-3 text-sm">
                          <span className="text-muted-foreground">Time </span>
                          <span className="font-mono text-foreground">{sec.complexity.time}</span>
                        </div>
                        <div className="bg-surface px-4 py-3 text-sm">
                          <span className="text-muted-foreground">Space </span>
                          <span className="font-mono text-foreground">{sec.complexity.space}</span>
                        </div>
                      </div>
                    )}

                    {sec.keyTakeaways && sec.keyTakeaways.length > 0 && (
                      <div className="rounded-xl border border-border/60 bg-surface/40 p-4">
                        <SectionLabel>Key takeaways</SectionLabel>
                        <ul className="mt-3 space-y-2">
                          {sec.keyTakeaways.map((t) => (
                            <li key={t} className="flex gap-2.5 text-sm text-foreground/90">
                              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                ))}

                <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">Check your understanding</p>
                    <p className="text-sm text-muted-foreground">
                      {level.quiz.questions.length} questions · pass with {level.quiz.passThreshold}{" "}
                      correct
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("quiz")}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
                    style={{ background: "var(--gradient-gold)" }}
                  >
                    Take the quiz <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            )}

            {activeTab === "quiz" && (
              <div className="space-y-6">
                <LevelQuiz
                  questions={level.quiz.questions}
                  passThreshold={level.quiz.passThreshold}
                  onPass={handleQuizPassed}
                  isAlreadyPassed={isQuizPassed}
                />
                {hasCoding && isQuizPassed && (
                  <button
                    onClick={() => setActiveTab("code")}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary"
                  >
                    Continue to the coding challenge <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </main>

          {/* Topic sidebar */}
          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            <div>
              <SectionLabel>In this topic</SectionLabel>
              <div className="mt-3 space-y-1">
                {topic.levels.map((lvl) => {
                  const done = progress.completedLevels[`${topic.id}_${lvl.id}`]?.completed;
                  const active = lvl.id === level.id;
                  return (
                    <Link
                      key={lvl.id}
                      to="/learning-hub/dsa/$topicId/$levelId"
                      params={{ topicId: topic.id, levelId: lvl.id }}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                        active
                          ? "bg-primary/10 font-medium text-foreground"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
                      )}
                      <span className="truncate">{lvl.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {roadmap.problems.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <SectionLabel>Practice</SectionLabel>
                  <DifficultyBadge value={topic.difficulty} />
                </div>
                <div className="mt-3">
                  <ProblemList problems={roadmap.problems} isSolved={isSolved} onToggle={toggle} />
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Previous / next */}
      <div className="mt-12 grid gap-3 border-t border-border/70 pt-6 sm:grid-cols-2">
        {prevLevel ? (
          <Link
            to="/learning-hub/dsa/$topicId/$levelId"
            params={{ topicId: prevLevel.topicId, levelId: prevLevel.level.id }}
            className="group flex items-center gap-3 rounded-xl border border-border/70 px-4 py-3 transition hover:border-primary/50"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Previous</span>
              <span className="block truncate text-sm font-medium text-foreground">
                {prevLevel.level.title}
              </span>
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {nextLevel && (
          <Link
            to="/learning-hub/dsa/$topicId/$levelId"
            params={{ topicId: nextLevel.topicId, levelId: nextLevel.level.id }}
            className="group flex items-center justify-end gap-3 rounded-xl border border-border/70 px-4 py-3 text-right transition hover:border-primary/50"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">
                Next{nextLevel.topicId !== topic.id ? ` · ${nextLevel.topic.title}` : ""}
              </span>
              <span className="block truncate text-sm font-medium text-foreground">
                {nextLevel.level.title}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
