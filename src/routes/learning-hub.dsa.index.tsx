import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Code2,
  ExternalLink,
  ListChecks,
  Map as MapIcon,
  Play,
  Search,
} from "lucide-react";
import { dsaTopics, getAllLevels, type DsaTopic } from "@/lib/dsa-curriculum";
import { dsaPhases, getRoadmapTopic, allRoadmapProblems } from "@/lib/dsa-roadmap";
import { dsaSheets } from "@/lib/dsa-sheets";
import { useDsaProgress } from "@/hooks/useDsaProgress";
import { useSolvedProblems } from "@/hooks/useSolvedProblems";
import { DsaVisualizer } from "@/components/DsaVisualizer";
import { InteractiveDsaStudio } from "@/components/InteractiveDsaStudio";
import {
  DifficultyBadge,
  ProblemList,
  ProgressBar,
  SectionLabel,
  SolvedCheckbox,
} from "@/components/dsa/DsaUi";

export const Route = createFileRoute("/learning-hub/dsa/")({
  head: () => ({
    meta: [
      { title: "DSA Roadmap — Nexora" },
      {
        name: "description",
        content:
          "A structured Data Structures & Algorithms roadmap with lessons, quizzes and curated practice problems.",
      },
    ],
  }),
  component: DsaDashboardPage,
});

type TabMode = "roadmap" | "sheets" | "visualizer" | "studio";

const TABS: { id: TabMode; label: string; icon: typeof MapIcon }[] = [
  { id: "roadmap", label: "Roadmap", icon: MapIcon },
  { id: "sheets", label: "Practice Sheets", icon: ListChecks },
  { id: "visualizer", label: "Visualizer", icon: Activity },
  { id: "studio", label: "Code Editor", icon: Code2 },
];

function topicMatches(topic: DsaTopic, query: string) {
  if (!query) return true;
  const roadmap = getRoadmapTopic(topic.id);
  const haystack = [
    topic.title,
    topic.description,
    ...topic.levels.map((l) => l.title),
    ...roadmap.concepts,
    ...roadmap.problems.map((p) => p.title),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function DsaDashboardPage() {
  const { progress, getTopicProgress } = useDsaProgress();
  const { solved, isSolved, toggle } = useSolvedProblems();
  const allLevels = getAllLevels();

  const isLevelDone = (topicId: string, levelId: string) =>
    Boolean(progress.completedLevels[`${topicId}_${levelId}`]?.completed);

  const completedLessons = allLevels.filter((l) => isLevelDone(l.topicId, l.level.id)).length;
  const solvedCount = allRoadmapProblems.filter((p) => solved.has(p.id)).length;
  const nextLevel = allLevels.find((l) => !isLevelDone(l.topicId, l.level.id)) ?? allLevels[0];
  const currentPhaseIdx = Math.max(
    0,
    dsaPhases.findIndex((ph) => ph.topicIds.includes(nextLevel.topicId))
  );

  const [activeTab, setActiveTab] = useState<TabMode>("roadmap");
  const [search, setSearch] = useState("");
  const [openTopics, setOpenTopics] = useState<Set<string>>(() => new Set([nextLevel.topicId]));
  const [selectedSheetId, setSelectedSheetId] = useState(dsaSheets[0].id);

  const query = search.trim().toLowerCase();
  const activeSheet = dsaSheets.find((s) => s.id === selectedSheetId) ?? dsaSheets[0];

  const phases = useMemo(
    () =>
      dsaPhases
        .map((phase) => ({
          ...phase,
          topics: phase.topicIds
            .map((id) => dsaTopics.find((t) => t.id === id))
            .filter((t): t is DsaTopic => Boolean(t)),
        }))
        .map((phase) => ({ ...phase, visible: phase.topics.filter((t) => topicMatches(t, query)) })),
    [query]
  );

  const toggleTopic = (id: string) =>
    setOpenTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allOpen = openTopics.size === dsaTopics.length;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-28 md:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/learning-hub" className="transition hover:text-foreground">
          Learning Hub
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Data Structures & Algorithms</span>
      </nav>

      {/* Header */}
      <header className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1
            className="text-3xl font-bold tracking-tight text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DSA Roadmap
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            A step-by-step path from complexity basics to dynamic programming. Learn each concept,
            check yourself with a quiz, then practise on hand-picked interview problems. Every
            topic is open, so follow the order or jump straight to what you need.
          </p>
        </div>

        <Link
          to="/learning-hub/dsa/$topicId/$levelId"
          params={{ topicId: nextLevel.topicId, levelId: nextLevel.level.id }}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 md:self-auto"
          style={{ background: "var(--gradient-gold)" }}
        >
          <Play className="h-4 w-4 fill-current" />
          {completedLessons > 0 ? "Continue" : "Start"}: {nextLevel.level.title}
        </Link>
      </header>

      {/* Progress summary */}
      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/60 sm:grid-cols-3">
        <StatCell
          label="Lessons completed"
          value={`${completedLessons} / ${allLevels.length}`}
          percent={(completedLessons / allLevels.length) * 100}
        />
        <StatCell
          label="Problems solved"
          value={`${solvedCount} / ${allRoadmapProblems.length}`}
          percent={(solvedCount / allRoadmapProblems.length) * 100}
        />
        <div className="bg-surface p-5">
          <p className="text-xs text-muted-foreground">Current step</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            Step {currentPhaseIdx + 1} · {dsaPhases[currentPhaseIdx].title}
          </p>
          <p className="mt-2 truncate text-xs text-muted-foreground">
            Up next: {nextLevel.topic.title}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 border-b border-border/70">
        <div className="-mb-px flex gap-6 overflow-x-auto" role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => (
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
            </button>
          ))}
        </div>
      </div>

      {/* ROADMAP */}
      {activeTab === "roadmap" && (
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics, concepts or problems"
                className="w-full rounded-xl border border-border/70 bg-surface py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
              />
            </div>
            <button
              onClick={() =>
                setOpenTopics(allOpen ? new Set() : new Set(dsaTopics.map((t) => t.id)))
              }
              className="cursor-pointer self-start text-sm font-medium text-muted-foreground transition hover:text-foreground sm:self-auto"
            >
              {allOpen ? "Collapse all" : "Expand all"}
            </button>
          </div>

          <div className="mt-8 space-y-12">
            {phases.map((phase, phaseIdx) => {
              if (phase.visible.length === 0) return null;
              const doneTopics = phase.topics.filter((t) => getTopicProgress(t.id).isCompleted).length;

              return (
                <section key={phase.id}>
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                        Step {phaseIdx + 1}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-foreground">{phase.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{phase.summary}</p>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {doneTopics} / {phase.topics.length} topics complete
                    </span>
                  </div>

                  <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-surface/40">
                    {phase.visible.map((topic) => (
                      <TopicRow
                        key={topic.id}
                        topic={topic}
                        open={Boolean(query) || openTopics.has(topic.id)}
                        onToggle={() => toggleTopic(topic.id)}
                        isLevelDone={isLevelDone}
                        isSolved={isSolved}
                        onToggleSolved={toggle}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {phases.every((p) => p.visible.length === 0) && (
              <p className="rounded-2xl border border-dashed border-border/70 py-12 text-center text-sm text-muted-foreground">
                No topics match "{search}".
              </p>
            )}
          </div>
        </div>
      )}

      {/* PRACTICE SHEETS */}
      {activeTab === "sheets" && (
        <div className="mt-8 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dsaSheets.map((sheet) => {
              const selected = sheet.id === selectedSheetId;
              const done = sheet.problems.filter((p) => solved.has(p.id)).length;
              return (
                <button
                  key={sheet.id}
                  onClick={() => setSelectedSheetId(sheet.id)}
                  className={`flex cursor-pointer flex-col rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-surface/40 hover:border-primary/40"
                  }`}
                >
                  <span className="text-[11px] font-medium text-primary">{sheet.badge}</span>
                  <span className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
                    {sheet.name}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">by {sheet.creator}</span>
                  <span className="mt-auto pt-4">
                    <span className="mb-1.5 flex justify-between text-[11px] tabular-nums text-muted-foreground">
                      <span>{sheet.problems.length} problems</span>
                      <span>{done} solved</span>
                    </span>
                    <ProgressBar percent={(done / sheet.problems.length) * 100} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface/40">
            <div className="flex flex-col gap-3 border-b border-border/70 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{activeSheet.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{activeSheet.description}</p>
              </div>
              <div className="flex shrink-0 gap-2 text-xs tabular-nums">
                {(["Easy", "Medium", "Hard"] as const).map((d) => (
                  <span key={d} className="rounded-full border border-border/70 px-2.5 py-1 text-muted-foreground">
                    {activeSheet.problems.filter((p) => p.difficulty === d).length} {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-xs text-muted-foreground">
                    <th className="w-12 py-3 pl-5 font-medium">Done</th>
                    <th className="py-3 pr-4 font-medium">Problem</th>
                    <th className="hidden py-3 pr-4 font-medium md:table-cell">Topic</th>
                    <th className="hidden py-3 pr-4 font-medium lg:table-cell">Pattern</th>
                    <th className="py-3 pr-4 font-medium">Difficulty</th>
                    <th className="py-3 pr-5 text-right font-medium">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {activeSheet.problems.map((prob) => {
                    const done = isSolved(prob.id);
                    return (
                      <tr key={prob.id} className="transition hover:bg-surface/60">
                        <td className="py-3 pl-5">
                          <SolvedCheckbox checked={done} label={prob.title} onToggle={() => toggle(prob.id)} />
                        </td>
                        <td className={`py-3 pr-4 font-medium ${done ? "text-muted-foreground" : "text-foreground"}`}>
                          {prob.title}
                        </td>
                        <td className="hidden py-3 pr-4 text-muted-foreground md:table-cell">{prob.topic}</td>
                        <td className="hidden py-3 pr-4 text-muted-foreground lg:table-cell">{prob.pattern}</td>
                        <td className="py-3 pr-4">
                          <DifficultyBadge value={prob.difficulty} />
                        </td>
                        <td className="py-3 pr-5">
                          <div className="flex items-center justify-end gap-3 text-xs">
                            {prob.leetcodeUrl && (
                              <a
                                href={prob.leetcodeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-primary"
                              >
                                LeetCode <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {prob.gfgUrl && (
                              <a
                                href={prob.gfgUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-primary"
                              >
                                GFG <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "visualizer" && (
        <div className="mt-8">
          <DsaVisualizer />
        </div>
      )}

      {activeTab === "studio" && (
        <div className="mt-8">
          <InteractiveDsaStudio />
        </div>
      )}
    </div>
  );
}

function StatCell({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="bg-surface p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</p>
      <ProgressBar percent={percent} className="mt-3" />
    </div>
  );
}

function TopicRow({
  topic,
  open,
  onToggle,
  isLevelDone,
  isSolved,
  onToggleSolved,
}: {
  topic: DsaTopic;
  open: boolean;
  onToggle: () => void;
  isLevelDone: (topicId: string, levelId: string) => boolean;
  isSolved: (id: string) => boolean;
  onToggleSolved: (id: string) => void;
}) {
  const roadmap = getRoadmapTopic(topic.id);
  const lessonsDone = topic.levels.filter((l) => isLevelDone(topic.id, l.id)).length;
  const problemsDone = roadmap.problems.filter((p) => isSolved(p.id)).length;
  const totalItems = topic.levels.length + roadmap.problems.length;
  const percent = totalItems > 0 ? ((lessonsDone + problemsDone) / totalItems) * 100 : 0;
  const complete = totalItems > 0 && lessonsDone + problemsDone === totalItems;

  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-4 px-4 py-4 text-left transition hover:bg-surface/70 md:px-5"
      >
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-semibold tabular-nums ${
            complete
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-border bg-surface text-muted-foreground"
          }`}
        >
          {complete ? <Check className="h-4 w-4" strokeWidth={3} /> : topic.order}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">{topic.title}</span>
            <DifficultyBadge value={topic.difficulty} />
          </span>
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
            {topic.description}
          </span>
        </span>

        <span className="hidden w-36 shrink-0 flex-col items-end gap-1.5 sm:flex">
          <span className="text-xs tabular-nums text-muted-foreground">
            {lessonsDone + problemsDone} / {totalItems} done
          </span>
          <ProgressBar percent={percent} />
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="grid gap-8 border-t border-border/60 bg-background/40 px-4 py-6 md:px-5 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <SectionLabel>Key concepts</SectionLabel>
              <ul className="mt-3 space-y-2">
                {roadmap.concepts.map((concept) => (
                  <li key={concept} className="flex gap-2.5 text-sm text-foreground/90">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {concept}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionLabel>Lessons</SectionLabel>
              <div className="mt-3 space-y-2">
                {topic.levels.map((lvl) => {
                  const done = isLevelDone(topic.id, lvl.id);
                  return (
                    <Link
                      key={lvl.id}
                      to="/learning-hub/dsa/$topicId/$levelId"
                      params={{ topicId: topic.id, levelId: lvl.id }}
                      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-surface/50 px-3 py-2.5 transition hover:border-primary/50"
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {lvl.title}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {lvl.estimatedMinutes} min ·{" "}
                          {lvl.requiresCoding ? "Theory, quiz & coding" : "Theory & quiz"}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        {done ? "Review" : "Start"}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <SectionLabel>Practice problems</SectionLabel>
              <span className="text-xs tabular-nums text-muted-foreground">
                {problemsDone} / {roadmap.problems.length}
              </span>
            </div>
            <div className="mt-3">
              <ProblemList problems={roadmap.problems} isSolved={isSolved} onToggle={onToggleSolved} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
