import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, Clock3, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportView } from "@/components/resume-review/ReportView";
import { ScanningStep, type Stage } from "@/components/resume-review/ScanningStep";
import { UploadStep, type UploadState } from "@/components/resume-review/UploadStep";
import { deleteReview, loadReviews, saveReview } from "@/components/resume-review/history";
import { extractDocumentText, reviewResume } from "@/lib/resume-review.functions";
import type { ResumeReview } from "@/lib/resume-review-types";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/resume-review")({
  head: () => ({
    meta: [
      { title: "Resume Review — Nexora" },
      {
        name: "description",
        content:
          "Upload your resume and get clear, evidence-backed feedback on content, experience, skills, ATS readability and formatting — plus a role-specific comparison.",
      },
      { property: "og:title", content: "Resume Review — Nexora" },
      {
        property: "og:description",
        content:
          "Clear, actionable resume feedback with evidence quoted from your own resume, and optional job-description matching.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  component: ResumeReviewPage,
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result ?? "");
      resolve(res.slice(res.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("READ_FAILED"));
    reader.readAsDataURL(file);
  });
}

type Phase = "upload" | "scanning" | "report";

function ResumeReviewPage() {
  const extract = useServerFn(extractDocumentText);
  const review = useServerFn(reviewResume);

  const [phase, setPhase] = useState<Phase>("upload");
  const [state, setState] = useState<UploadState>({ resume: null, jdFile: null, jdText: "" });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeReview | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [history, setHistory] = useState<ResumeReview[]>([]);
  const running = useRef(false);

  useEffect(() => {
    // Fires once on load (INITIAL_SESSION) and again on sign-in/out.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT") {
        // Defer: supabase calls inside this callback can deadlock the client.
        setTimeout(() => void loadReviews().then(setHistory), 0);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const hasJd = Boolean(state.jdFile) || state.jdText.trim().length > 40;

  const stages: Stage[] = [
    { id: "read", label: "Reading your resume" },
    { id: "extract", label: "Extracting text" },
    ...(hasJd ? [{ id: "jd", label: "Reading the job description" }] : []),
    { id: "review", label: "Reviewing content, skills and structure" },
    ...(hasJd ? [{ id: "match", label: "Comparing job requirements" }] : []),
    { id: "prepare", label: "Preparing recommendations" },
  ];

  const start = useCallback(async () => {
    if (!state.resume || running.current) return;
    running.current = true;
    setError(null);
    setPhase("scanning");
    setStageIndex(0);

    try {
      const resumeB64 = await fileToBase64(state.resume);
      setStageIndex(1);
      const resumeRes = await extract({
        data: { fileBase64: resumeB64, fileName: state.resume.name },
      });
      if (!resumeRes.ok) {
        setError(resumeRes.error);
        setPhase("upload");
        return;
      }

      let jobText: string | null = null;
      if (state.jdFile) {
        setStageIndex(2);
        const jdB64 = await fileToBase64(state.jdFile);
        const jdRes = await extract({
          data: { fileBase64: jdB64, fileName: state.jdFile.name },
        });
        if (!jdRes.ok) {
          setError(`Job description: ${jdRes.error}`);
          setPhase("upload");
          return;
        }
        jobText = jdRes.text;
      } else if (state.jdText.trim().length > 40) {
        setStageIndex(2);
        jobText = state.jdText.trim();
      }

      setStageIndex(hasJd ? 3 : 2);
      const res = await review({
        data: {
          resumeText: resumeRes.text,
          jobText,
          resumeFileName: state.resume.name,
        },
      });
      if (!res.ok) {
        setError(res.error);
        setPhase("upload");
        return;
      }

      setStageIndex(stages.length);
      setResult(res.review);
      setPhase("report");
      void saveReview(res.review).then(setHistory);
    } catch {
      setError("Something went wrong while reviewing this resume. Please try again.");
      setPhase("upload");
    } finally {
      running.current = false;
    }
  }, [state, extract, review, hasJd, stages.length]);

  return (
    <main className="resume-review-theme min-h-[calc(100vh-5rem)] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-6xl">
        {phase === "upload" ? (
          <>
            <header className="mb-8 animate-fade-in sm:mb-10">
              <p className="resume-kicker">Career document analysis</p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Resume Review</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Get clear, actionable feedback on your resume.
              </p>
            </header>

            <div className={history.length ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]" : ""}>
              <UploadStep
                state={state}
                setState={setState}
                onStart={() => void start()}
                error={error}
              />

              {history.length ? (
                <section className="resume-history h-fit p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-semibold">Recent reviews</h2>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {history.map((r) => (
                      <li
                        key={r.id}
                        className="resume-history-row grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <button
                          type="button"
                          className="min-w-0 text-left"
                          onClick={() => {
                            setResult(r);
                            setPhase("report");
                          }}
                        >
                          <span className="block truncate text-sm font-medium">
                            {r.candidate.name ?? r.resumeFileName}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString()} · Score {r.overallScore}
                            /100
                          </span>
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Delete review"
                          onClick={() => void deleteReview(r.id).then(setHistory)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </>
        ) : null}

        {phase === "scanning" ? <ScanningStep stages={stages} activeIndex={stageIndex} /> : null}

        {phase === "report" && result ? (
          <ReportView
            review={result}
            onNewReview={() => {
              setResult(null);
              setState({ resume: null, jdFile: null, jdText: "" });
              setPhase("upload");
            }}
          />
        ) : null}

        {phase === "report" && !result ? (
          <p className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" /> This review is no longer available.
          </p>
        ) : null}
      </div>
    </main>
  );
}
