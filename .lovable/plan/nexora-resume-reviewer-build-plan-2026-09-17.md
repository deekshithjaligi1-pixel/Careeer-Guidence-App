# Nexora Resume Reviewer — build plan

Build the Resume Review page end to end, replacing the current "Coming next" placeholder. Nothing else on the site changes: home, navbar, branding, Resume Builder, Skill Assessment and Mock Interview stay exactly as they are.

## What the user gets

**Step 1 — Upload page (`/resume-review`)**
- Two aligned panels on one grid: *Resume* (left) and *Job Description* (right, clearly marked optional).
- Resume: drag-or-choose PDF/DOCX, max 5 MB. After choosing, shows file name, type, size and a Remove option.
- Job description: either upload a PDF/DOCX or paste text — the user picks one.
- One primary button, **Review Resume**, disabled until a valid resume is selected.
- Real validation with plain messages: unsupported type, file too large, no readable text found.

**Step 2 — Processing**
- A compact document outline with a thin line sweeping top to bottom, plus a checklist that ticks off the stages actually running: reading the file, extracting text, identifying sections, reviewing content, comparing job requirements (only when a job description was given), preparing recommendations.
- No robots, particles or glow. Stages advance from real progress, not a timer alone.

**Step 3 — Report**
- Header: name, title (when found), review date, and a modest overall score out of 100 with a one-paragraph written summary generated from that specific resume.
- **Resume Health**: five compact rows with thin bars — Content & Impact, Experience, Skills, ATS Readability, Formatting & Structure.
- **Strengths** and **Areas to Improve** (each improvement states category, issue, why it matters, recommendation — capped at the six most useful).
- **Job Match** (only when a job description was provided): counts of requirements checked / verified / related / not found, then a clean table of Requirement, Status, Evidence quoted from the resume, followed by the missing-or-unverified list worded as "not found in resume".
- **Detailed review** per section and **Suggested rewrites** (current vs suggested, with copy buttons) — only where an improvement is meaningful.
- Actions: start another review, and a small history list of past reviews that can be reopened.

## How it works

- **Text extraction runs on the server**, not in the browser. New server functions in `src/lib/resume-review.functions.ts`: `extractDocumentText` (accepts base64 file + name) and `reviewResume`.
  - PDF: `unpdf` (works in the edge runtime). DOCX: `fflate` to unzip plus XML text extraction. Both added as dependencies.
  - If extraction yields too little readable text, it returns a clear "couldn't read this document" failure — no fabricated result.
- **Review** sends the extracted resume text (and job description text, when present) to the AI through the existing Lovable gateway helper already used by the other features, requesting strict JSON: parsed fields, per-category findings, strengths, improvements, requirement verification with verbatim evidence, rewrite suggestions.
  - The model is instructed to return `null` for anything absent and to quote evidence verbatim; any requirement marked verified without evidence text is downgraded to "unclear" in code before display.
  - The five category scores are combined in code with fixed weights (25/20/20/20/15) into the overall score — the model does not invent the total.
  - AI failure shows a graceful error with Try Again / Choose another file. No fallback fake results.
- **Saving**: the site currently has no sign-in, so each finished review is stored in the browser (recent reviews list, reopenable, deletable). When accounts are added later this moves to the account without changing the UI.

## Styling

Stays on the existing Nexora dark navy surface with restrained use of the gold accent for the primary action only; green for verified, amber for related/warnings, red for errors. One max-width content column, 8px spacing rhythm, thin borders, minimal cards, no giant score ring or decorative charts.

## Technical notes

- New: `src/lib/resume-review.functions.ts`, `src/lib/resume-review-types.ts`, `src/components/resume-review/*` (UploadPanel, ScanningView, ReportView and small pieces).
- Rewritten: `src/routes/resume-review.tsx` (with its own page title and description metadata).
- New dependencies: `unpdf`, `fflate`.
- Files sent to the server as base64 inside the server-function call; nothing is written to storage and no API key touches the browser.
