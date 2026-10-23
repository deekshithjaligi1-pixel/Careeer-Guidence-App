import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.docx";

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileKind(name: string) {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  return ext === "pdf" ? "PDF" : ext === "docx" ? "DOCX" : ext.toUpperCase();
}

function validate(file: File): string | null {
  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
    return "This file type isn't supported. Please upload a PDF or DOCX.";
  }
  if (file.size > MAX_BYTES) return "This file is larger than 5 MB. Please upload a smaller file.";
  if (file.size === 0) return "This file appears to be empty. Please choose another file.";
  return null;
}

function FileRow({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="resume-file-row animate-scale-in flex items-center gap-3 px-4 py-4">
      <span className="resume-file-icon grid h-10 w-10 shrink-0 place-items-center rounded-lg">
        <FileText className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {fileKind(file.name)} · {formatSize(file.size)}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Ready to review
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove file" title="Remove file">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function DropZone({
  label,
  onPick,
  inputId,
}: {
  label: string;
  onPick: (f: File) => void;
  inputId: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onPick(f);
      }}
      className={`resume-dropzone flex min-h-[248px] flex-col items-center justify-center px-6 py-8 text-center ${over ? "is-over" : ""}`}
    >
      <span className="resume-upload-icon grid h-14 w-14 place-items-center rounded-xl">
        <Upload className="h-6 w-6" />
      </span>
      <p className="mt-5 text-base font-medium text-foreground">{label}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">PDF or DOCX · Maximum 5 MB</p>
      <input
        id={inputId}
        ref={ref}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
      <Button variant="outline" className="resume-secondary-button mt-5" onClick={() => ref.current?.click()}>
        Browse files
      </Button>
    </div>
  );
}

export type UploadState = {
  resume: File | null;
  jdFile: File | null;
  jdText: string;
};

export function UploadStep({
  state,
  setState,
  onStart,
  error,
}: {
  state: UploadState;
  setState: (s: UploadState) => void;
  onStart: () => void;
  error: string | null;
}) {
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [jdError, setJdError] = useState<string | null>(null);
  const [jdMode, setJdMode] = useState<"upload" | "paste">("paste");

  return (
    <section className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Resume */}
        <div className="resume-panel flex min-h-[390px] flex-col p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="resume-section-number">01</span>
            <div>
              <h2 className="text-lg font-semibold">Resume upload</h2>
              <p className="mt-1 text-sm text-muted-foreground">Add the resume you want Nexora to review.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-1 flex-col justify-center">
            {state.resume ? (
              <FileRow
                file={state.resume}
                onRemove={() => setState({ ...state, resume: null })}
              />
            ) : (
              <DropZone
                inputId="resume-input"
                label="Drag & drop your resume here"
                onPick={(f) => {
                  const err = validate(f);
                  setResumeError(err);
                  if (!err) setState({ ...state, resume: f });
                }}
              />
            )}
            {resumeError ? (
              <p className="mt-3 flex items-start gap-2 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {resumeError}
              </p>
            ) : null}
          </div>
        </div>

        {/* Job description */}
        <div className="resume-panel flex min-h-[390px] flex-col p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="resume-section-number">02</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">Job description</h2>
                <span className="resume-optional-label">Optional</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Add the role details for a targeted comparison.</p>
            </div>
          </div>

          <div className="resume-segment mt-6 grid grid-cols-2 p-1">
            {(["paste", "upload"] as const).map((m) => (
              <Button
                key={m}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setJdMode(m)}
                className={jdMode === m ? "is-active" : ""}
              >
                {m === "paste" ? "Paste description" : "Upload file"}
              </Button>
            ))}
          </div>

          <div className="mt-4 flex flex-1 flex-col">
            {jdMode === "paste" ? (
              <>
                <Textarea
                  value={state.jdText}
                  onChange={(e) => setState({ ...state, jdText: e.target.value, jdFile: null })}
                  placeholder="Paste the role responsibilities, requirements, and preferred skills here…"
                  className="resume-textarea min-h-[188px] flex-1 resize-none"
                  aria-label="Job description"
                />
                <p className="mt-2 text-right text-xs tabular-nums text-muted-foreground">
                  {state.jdText.length.toLocaleString()} characters
                </p>
              </>
            ) : state.jdFile ? (
              <FileRow file={state.jdFile} onRemove={() => setState({ ...state, jdFile: null })} />
            ) : (
              <DropZone
                inputId="jd-input"
                label="Drag the job description here, or choose a file"
                onPick={(f) => {
                  const err = validate(f);
                  setJdError(err);
                  if (!err) setState({ ...state, jdFile: f, jdText: "" });
                }}
              />
            )}
            {jdError ? (
              <p className="mt-3 flex items-start gap-2 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {jdError}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <p className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="resume-action-bar grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {state.resume ? "Ready when you are" : "Upload a resume to begin"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {state.resume
              ? state.jdFile || state.jdText.trim().length > 40
                ? "Your review will include a role-specific requirements comparison."
                : "Your review will focus on content, impact, structure, skills, and ATS readability."
              : "PDF or DOCX files up to 5 MB are supported."}
          </p>
        </div>
        <Button
          size="lg"
          className="resume-primary-button h-12 w-full px-7 sm:w-auto"
          disabled={!state.resume}
          onClick={onStart}
        >
          Review Resume
        </Button>
      </div>
    </section>
  );
}
