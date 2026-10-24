import { useState } from "react";
import { Play, Send, CheckCircle2, XCircle, Loader2, ExternalLink, Code2, Terminal, Eye, RotateCcw } from "lucide-react";
import {
  runChallenge,
  starterTemplate,
  isPythonLoaded,
  warmUpPython,
  RUNNABLE_LANGUAGES,
  type CodeExecutionResult,
  type RunnableLanguage,
} from "@/lib/code-runner";
import { CodeEditor } from "@/components/CodeEditor";
import { toast } from "sonner";
import type { CodingChallenge } from "@/lib/dsa-curriculum";

interface CodingWorkspaceProps {
  challenge: CodingChallenge;
  topicId: string;
  levelId: string;
  onSuccess: (code: string) => void;
  savedCode?: string;
  isAlreadyCompleted?: boolean;
}

export function CodingWorkspace({
  challenge,
  topicId,
  levelId,
  onSuccess,
  savedCode,
  isAlreadyCompleted,
}: CodingWorkspaceProps) {
  const [language, setLanguage] = useState<RunnableLanguage>("javascript");
  const template = (lang: RunnableLanguage) =>
    starterTemplate(lang, challenge.starterCode[lang] || challenge.starterCode.javascript);
  const [code, setCode] = useState<string>(savedCode || template("javascript"));
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"problem" | "testcases" | "output">("problem");
  const [execResult, setExecResult] = useState<CodeExecutionResult | null>(null);

  const handleLanguageChange = (newLang: RunnableLanguage) => {
    setLanguage(newLang);
    if (newLang === "python") warmUpPython();
    setCode(template(newLang));
    setExecResult(null);
  };

  const showSolution = () => {
    if (!confirm("Replace your code with the reference solution?")) return;
    setCode(challenge.starterCode[language] || challenge.starterCode.javascript);
  };

  const run = (mode: "run" | "submit") => {
    if (language === "python" && !isPythonLoaded()) {
      toast.info("Loading Python for the first time — this takes a few seconds.");
    }
    return runChallenge({ topicId, levelId, language, code, mode });
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab("output");
    try {
      const result = await run("run");
      setExecResult(result);
      if (result.status === "accepted") {
        toast.success("Sample test cases passed!");
      } else {
        toast.error("Sample tests failed. Check output console.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setActiveTab("output");
    try {
      const result = await run("submit");
      setExecResult(result);
      if (result.status === "accepted") {
        toast.success("All test cases passed! Challenge completed.");
        onSuccess(code);
      } else {
        toast.error(`Submission failed: ${result.passedCount}/${result.totalCount} tests passed.`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit code");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl glass border border-border/80 overflow-hidden shadow-card">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-surface/70 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Code2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{challenge.title}</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  challenge.difficulty === "Easy"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : challenge.difficulty === "Medium"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                }`}
              >
                {challenge.difficulty}
              </span>
              {isAlreadyCompleted && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Solved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Language selector & actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as RunnableLanguage)}
            className="rounded-lg bg-surface border border-border/70 px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {RUNNABLE_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg glass px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 text-primary" />}
            Run
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-glow transition hover:scale-105 disabled:opacity-50 cursor-pointer"
            style={{ background: "var(--gradient-gold)" }}
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Submit
          </button>
        </div>
      </div>

      {/* Main split view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Left pane: Description & Tabs */}
        <div className="lg:col-span-5 flex flex-col border-b lg:border-b-0 lg:border-r border-border/70 bg-surface/30">
          <div className="flex items-center border-b border-border/70 bg-surface/40 px-3 pt-2">
            <button
              onClick={() => setActiveTab("problem")}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
                activeTab === "problem"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("testcases")}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
                activeTab === "testcases"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Test Cases ({challenge.testCases.length})
            </button>
            <button
              onClick={() => setActiveTab("output")}
              className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold border-b-2 transition ${
                activeTab === "output"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Terminal className="h-3 w-3" />
              Console {execResult && `(${execResult.passedCount}/${execResult.totalCount})`}
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto max-h-[520px] space-y-4 text-xs leading-relaxed text-muted-foreground">
            {activeTab === "problem" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-foreground mb-1.5">Problem Statement</h4>
                  <p className="text-foreground/90 whitespace-pre-line">{challenge.description}</p>
                </div>

                {challenge.examples.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground">Examples</h4>
                    {challenge.examples.map((ex, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-surface/60 border border-border/60 space-y-1 font-mono text-[11px]">
                        <div><strong className="text-primary font-sans">Input:</strong> {ex.input}</div>
                        <div><strong className="text-emerald-400 font-sans">Output:</strong> {ex.output}</div>
                        {ex.explanation && (
                          <div className="text-muted-foreground font-sans text-[11px] pt-1 border-t border-border/40 mt-1">
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {challenge.constraints.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-foreground mb-1">Constraints</h4>
                    <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px] text-foreground/80">
                      {challenge.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {challenge.externalLinks && challenge.externalLinks.length > 0 && (
                  <div className="pt-3 border-t border-border/60">
                    <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5 text-primary" /> Supplementary External Practice
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {challenge.externalLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-[11px] font-medium text-foreground hover:border-primary/60 transition"
                        >
                          <span className="font-semibold text-primary">{link.platform}:</span> {link.title}
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "testcases" && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground">Verified Test Cases</h4>
                {challenge.testCases.map((tc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface/60 border border-border/60 font-mono text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Case #{idx + 1}</span>
                      {tc.isHidden && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Hidden Test</span>
                      )}
                    </div>
                    <div><strong className="text-primary font-sans">Input:</strong> {tc.input}</div>
                    <div><strong className="text-emerald-400 font-sans">Expected:</strong> {tc.expectedOutput}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "output" && (
              <div className="space-y-3">
                {!execResult && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Terminal className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p>Click "Run" or "Submit" to test your code against verified test cases.</p>
                  </div>
                )}

                {execResult && (
                  <div className="space-y-3">
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        execResult.status === "accepted"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {execResult.status === "accepted" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-rose-400" />
                        )}
                        <div>
                          <div className="font-bold uppercase tracking-wider text-xs">
                            {execResult.status.replaceAll("_", " ")}
                          </div>
                          <div className="text-[11px] opacity-90">
                            Passed {execResult.passedCount} of {execResult.totalCount} test cases
                          </div>
                        </div>
                      </div>
                    </div>

                    {execResult.error && (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 font-mono text-[11px] text-rose-300">
                        {execResult.error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-foreground">Test Case Details</h5>
                      {execResult.testResults.map((tr) => (
                        <div
                          key={tr.testIndex}
                          className={`p-3 rounded-xl border font-mono text-[11px] space-y-1 ${
                            tr.passed ? "bg-emerald-950/20 border-emerald-800/40" : "bg-rose-950/20 border-rose-800/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-semibold text-foreground">Test #{tr.testIndex}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tr.passed ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"}`}>
                              {tr.passed ? "PASSED" : "FAILED"}
                            </span>
                          </div>
                          <div><span className="text-muted-foreground font-sans">Input:</span> {tr.input}</div>
                          <div><span className="text-muted-foreground font-sans">Expected:</span> <span className="text-emerald-400">{tr.expected}</span></div>
                          <div><span className="text-muted-foreground font-sans">Your Output:</span> <span className={tr.passed ? "text-emerald-400" : "text-rose-400"}>{tr.actual}</span></div>
                          {tr.logs && (
                            <div className="pt-1 mt-1 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
                              <strong>stdout:</strong> {tr.logs}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Code Editor */}
        <div className="lg:col-span-7 flex flex-col bg-[#0b0f19]">
          <div className="flex items-center justify-between gap-2 px-4 py-2 bg-surface/50 border-b border-border/60 text-[11px] text-muted-foreground">
            <span className="font-mono">solution.{language === "python" ? "py" : language === "typescript" ? "ts" : "js"}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCode(template(language))}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-surface-2 hover:text-foreground transition cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
              <button
                onClick={showSolution}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-surface-2 hover:text-foreground transition cursor-pointer"
              >
                <Eye className="h-3 w-3" /> Show solution
              </button>
            </div>
          </div>

          <div className="flex-1">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </div>
      </div>
    </div>
  );
}
