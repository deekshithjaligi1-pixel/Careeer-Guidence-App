import { useState } from "react";
import { CheckCircle2, XCircle, RefreshCw, HelpCircle, Award, AlertCircle } from "lucide-react";
import type { QuizQuestion } from "@/lib/dsa-curriculum";

interface LevelQuizProps {
  questions: QuizQuestion[];
  passThreshold: number;
  onPass: (score: number) => void;
  onFail?: (score: number) => void;
  isAlreadyPassed?: boolean;
}

export function LevelQuiz({
  questions,
  passThreshold,
  onPass,
  onFail,
  isAlreadyPassed,
}: LevelQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qIdx: number, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optionIdx }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    const passed = correctCount >= passThreshold;
    if (passed) {
      onPass(correctCount);
    } else if (onFail) {
      onFail(correctCount);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const allAnswered = Object.keys(selectedAnswers).length === questions.length;
  const passed = score >= passThreshold;

  return (
    <div className="rounded-2xl glass border border-border/80 p-6 md:p-8 space-y-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/20 text-primary text-xs font-bold">
              Q
            </span>
            <h3 className="text-lg font-bold text-foreground font-display">Concept Mastery Quiz</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Answer at least <strong>{passThreshold} out of {questions.length}</strong> questions correctly to qualify.
          </p>
        </div>

        {submitted ? (
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs border ${
                passed
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              Score: {score} / {questions.length} ({passed ? "PASSED" : "FAILED"})
            </div>
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs font-semibold text-foreground hover:bg-surface-2 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-primary" /> Retake Quiz
            </button>
          </div>
        ) : (
          isAlreadyPassed && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="h-4 w-4" /> Previously Passed
            </span>
          )
        )}
      </div>

      {/* Question list */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const userAnswer = selectedAnswers[qIdx];
          const isCorrect = userAnswer === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-4 md:p-5 rounded-xl border transition ${
                submitted
                  ? isCorrect
                    ? "bg-emerald-950/15 border-emerald-800/40"
                    : "bg-rose-950/15 border-rose-800/40"
                  : "bg-surface/40 border-border/60"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 grid h-6 w-6 place-items-center rounded-md bg-surface text-foreground font-semibold text-xs border border-border/70">
                  {qIdx + 1}
                </span>
                <div className="flex-1 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground leading-snug">
                    {q.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswer === optIdx;
                      let optionClasses = "border-border/60 bg-surface/50 text-foreground/80 hover:bg-surface";

                      if (submitted) {
                        if (optIdx === q.correctIndex) {
                          optionClasses = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold";
                        } else if (isSelected && !isCorrect) {
                          optionClasses = "bg-rose-500/20 border-rose-500/50 text-rose-300";
                        } else {
                          optionClasses = "opacity-50 border-border/30 bg-surface/20 text-muted-foreground";
                        }
                      } else if (isSelected) {
                        optionClasses = "border-primary bg-primary/15 text-primary font-semibold shadow-sm";
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelect(qIdx, optIdx)}
                          disabled={submitted}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition cursor-pointer ${optionClasses}`}
                        >
                          <span
                            className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold border ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/80 text-muted-foreground"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 leading-tight">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className="pt-2 text-xs text-muted-foreground flex items-start gap-2 bg-surface/40 p-3 rounded-lg border border-border/40">
                      <HelpCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground">Explanation: </strong>
                        {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex items-center justify-between pt-4 border-t border-border/70">
          <span className="text-xs text-muted-foreground">
            {Object.keys(selectedAnswers).length} of {questions.length} answered
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-primary-foreground shadow-glow transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Award className="h-4 w-4" /> Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
}
