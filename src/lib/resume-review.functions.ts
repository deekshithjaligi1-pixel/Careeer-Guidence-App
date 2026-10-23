import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { getGeminiModel } from "./gemini.server";
import {
  CATEGORY_WEIGHTS,
  type CategoryKey,
  type Improvement,
  type Requirement,
  type ResumeReview,
  type Rewrite,
  type SectionNote,
  type SkillGroup,
} from "./resume-review-types";

function getModel() {
  return getGeminiModel("gemini-2.5-flash");
}

/* ------------------------------ extraction ------------------------------ */

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.includes(",") ? b64.slice(b64.indexOf(",") + 1) : b64;
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function normalize(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim();
}

async function extractPdf(bytes: Uint8Array): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });
  return normalize(Array.isArray(text) ? text.join("\n") : text);
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

async function extractDocx(bytes: Uint8Array): Promise<string> {
  const { unzipSync, strFromU8 } = await import("fflate");
  const files = unzipSync(bytes);
  const parts = ["word/document.xml", "word/header1.xml", "word/footer1.xml"]
    .map((p) => files[p])
    .filter(Boolean) as Uint8Array[];
  if (!parts.length) throw new Error("UNREADABLE");
  const xml = parts.map((p) => strFromU8(p)).join("\n");
  const text = xml
    .replace(/<w:tab[^>]*\/>/g, " ")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:br[^>]*\/>/g, "\n")
    .replace(/<[^>]+>/g, "");
  return normalize(decodeXmlEntities(text));
}

const ExtractInput = z.object({
  fileBase64: z.string().min(1),
  fileName: z.string().min(1),
});

export const extractDocumentText = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ExtractInput.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; text: string } | { ok: false; error: string }> => {
    const lower = data.fileName.toLowerCase();
    try {
      const bytes = base64ToBytes(data.fileBase64);
      let text = "";
      if (lower.endsWith(".pdf")) text = await extractPdf(bytes);
      else if (lower.endsWith(".docx")) text = await extractDocx(bytes);
      else if (lower.endsWith(".txt")) text = normalize(new TextDecoder().decode(bytes));
      else
        return {
          ok: false,
          error: "This file type isn't supported. Please upload a PDF or DOCX.",
        };

      const words = text.split(/\s+/).filter(Boolean).length;
      if (words < 40) {
        return {
          ok: false,
          error:
            "We couldn't extract readable text from this document. Please upload a text-based PDF or DOCX (not a scanned image).",
        };
      }
      return { ok: true, text: text.slice(0, 24000) };
    } catch {
      return {
        ok: false,
        error: "We couldn't read this document. Please try another file.",
      };
    }
  });

/* -------------------------------- review -------------------------------- */

function extractJson(raw: string): unknown {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence && fence[1]) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI_BAD_OUTPUT");
  return JSON.parse(s.slice(start, end + 1));
}

const clamp = (n: unknown, lo = 0, hi = 100) => {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return Math.max(lo, Math.min(hi, Math.round(v)));
};

const str = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t || /^(n\/?a|none|unknown|null)$/i.test(t)) return null;
  return t;
};

const strList = (v: unknown, max: number): string[] =>
  Array.isArray(v)
    ? v.map((x) => str(x)).filter((x): x is string => !!x).slice(0, max)
    : [];

function normalizeRequirement(raw: unknown): Requirement | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const requirement = str(r.requirement);
  if (!requirement) return null;
  const evidence = str(r.evidence);
  let status = String(r.status ?? "").toLowerCase().replace(/[\s-]/g, "_");
  if (!["verified", "related", "not_found", "unclear"].includes(status)) status = "unclear";
  // Anti-hallucination: a claim of evidence with no quoted text cannot be trusted.
  if ((status === "verified" || status === "related") && !evidence) status = "unclear";
  return {
    requirement,
    kind: r.kind === "preferred" ? "preferred" : "required",
    status: status as Requirement["status"],
    evidence,
    note: str(r.note),
  };
}

const ReviewInput = z.object({
  resumeText: z.string().min(1),
  jobText: z.string().nullable().optional(),
  resumeFileName: z.string().min(1),
});

const SYSTEM = `You are a senior technical recruiter reviewing a resume.
Rules you must never break:
- Judge ONLY what is written in the resume text. Never invent facts, roles, employers, metrics or skills.
- If something is absent, say it is not found in the resume. Never claim the candidate lacks a skill.
- Evidence must be a short verbatim quote copied from the resume text. If you cannot quote it, leave evidence null.
- Scores are integers 0-100 grounded in concrete observations about this resume.
Return ONLY a JSON object. No markdown, no commentary.`;

function prompt(resumeText: string, jobText: string | null) {
  return `RESUME TEXT:
"""
${resumeText}
"""
${jobText ? `\nJOB DESCRIPTION:\n"""\n${jobText}\n"""\n` : ""}
Return JSON with exactly this shape:
{
  "candidate": { "name": string|null, "title": string|null, "email": string|null, "phone": string|null, "location": string|null, "links": string[] },
  "categoryScores": { "content": int, "experience": int, "skills": int, "ats": int, "formatting": int },
  "summary": string,  // 2-3 sentences about THIS resume: what is strong and the main opportunities
  "strengths": string[],       // 3-5 concise, each supported by the resume
  "improvements": [ { "category": string, "issue": string, "why": string, "recommendation": string } ], // max 6, most useful first
  "skillGroups": [ { "group": string, "skills": string[] } ],  // e.g. Languages, Frameworks, Databases, Tools, Soft Skills — only skills present in the resume
  "sectionNotes": [ { "section": string, "note": string } ],   // one short note per section actually present (Experience, Projects, Skills, Education, Formatting)
  "rewrites": [ { "current": string, "suggested": string } ]   // max 4; "current" MUST be a verbatim weak line from the resume; only where the rewrite is clearly better; [] if none
  ${
    jobText
      ? `, "jobMatch": { "role": string|null, "requirements": [ { "requirement": string, "kind": "required"|"preferred", "status": "verified"|"related"|"not_found"|"unclear", "evidence": string|null, "note": string|null } ] }`
      : ""
  }
}
${
  jobText
    ? `Job matching rules: extract 8-14 concrete requirements from the job description. Use semantic matching, not keyword matching.
- "verified": the resume clearly shows it; quote the evidence.
- "related": the resume shows adjacent/transferable experience but not the exact requirement; quote the related line and explain the gap in "note".
- "not_found": no supporting evidence in the resume; evidence null; note "Not mentioned in resume."
- "unclear": mentioned but too ambiguous to confirm.`
    : ""
}`;
}

export const reviewResume = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ReviewInput.parse(d))
  .handler(
    async ({ data }): Promise<{ ok: true; review: ResumeReview } | { ok: false; error: string }> => {
      const jobText = data.jobText?.trim() ? data.jobText.trim().slice(0, 12000) : null;
      let parsed: Record<string, unknown>;
      try {
        const model = getModel();
        const { text } = await generateText({
          model,
          system: SYSTEM,
          prompt: prompt(data.resumeText, jobText),
        });
        parsed = extractJson(text) as Record<string, unknown>;
      } catch (err) {
        console.error("Resume review error:", err);
        return {
          ok: false,
          error: err instanceof Error ? err.message : "The review service didn't respond. Please try again in a moment.",
        };
      }

      try {
        const cand = (parsed.candidate ?? {}) as Record<string, unknown>;
        const rawScores = (parsed.categoryScores ?? {}) as Record<string, unknown>;
        const categoryScores = {
          content: clamp(rawScores.content),
          experience: clamp(rawScores.experience),
          skills: clamp(rawScores.skills),
          ats: clamp(rawScores.ats),
          formatting: clamp(rawScores.formatting),
        } as Record<CategoryKey, number>;

        const overallScore = Math.round(
          (Object.keys(CATEGORY_WEIGHTS) as CategoryKey[]).reduce(
            (sum, k) => sum + categoryScores[k] * CATEGORY_WEIGHTS[k],
            0,
          ),
        );

        const improvements: Improvement[] = Array.isArray(parsed.improvements)
          ? (parsed.improvements as unknown[])
              .map((i) => {
                const o = (i ?? {}) as Record<string, unknown>;
                const issue = str(o.issue);
                if (!issue) return null;
                return {
                  category: str(o.category) ?? "General",
                  issue,
                  why: str(o.why) ?? "",
                  recommendation: str(o.recommendation) ?? "",
                };
              })
              .filter((x): x is Improvement => !!x)
              .slice(0, 6)
          : [];

        const skillGroups: SkillGroup[] = Array.isArray(parsed.skillGroups)
          ? (parsed.skillGroups as unknown[])
              .map((g) => {
                const o = (g ?? {}) as Record<string, unknown>;
                const group = str(o.group);
                const skills = strList(o.skills, 30);
                return group && skills.length ? { group, skills } : null;
              })
              .filter((x): x is SkillGroup => !!x)
          : [];

        const sectionNotes: SectionNote[] = Array.isArray(parsed.sectionNotes)
          ? (parsed.sectionNotes as unknown[])
              .map((s) => {
                const o = (s ?? {}) as Record<string, unknown>;
                const section = str(o.section);
                const note = str(o.note);
                return section && note ? { section, note } : null;
              })
              .filter((x): x is SectionNote => !!x)
          : [];

        const rewrites: Rewrite[] = Array.isArray(parsed.rewrites)
          ? (parsed.rewrites as unknown[])
              .map((r) => {
                const o = (r ?? {}) as Record<string, unknown>;
                const current = str(o.current);
                const suggested = str(o.suggested);
                return current && suggested && current !== suggested
                  ? { current, suggested }
                  : null;
              })
              .filter((x): x is Rewrite => !!x)
              .slice(0, 4)
          : [];

        let jobMatch: ResumeReview["jobMatch"] = null;
        if (jobText) {
          const jm = (parsed.jobMatch ?? {}) as Record<string, unknown>;
          const requirements = Array.isArray(jm.requirements)
            ? (jm.requirements as unknown[])
                .map(normalizeRequirement)
                .filter((x): x is Requirement => !!x)
                .slice(0, 20)
            : [];
          jobMatch = { role: str(jm.role), requirements };
        }

        const review: ResumeReview = {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : String(Date.now()),
          createdAt: new Date().toISOString(),
          candidate: {
            name: str(cand.name),
            title: str(cand.title),
            email: str(cand.email),
            phone: str(cand.phone),
            location: str(cand.location),
            links: strList(cand.links, 6),
          },
          overallScore,
          categoryScores,
          summary: str(parsed.summary) ?? "",
          strengths: strList(parsed.strengths, 5),
          improvements,
          skillGroups,
          sectionNotes,
          rewrites,
          jobMatch,
          resumeFileName: data.resumeFileName,
        };

        if (!review.summary || !Object.values(categoryScores).some((v) => v > 0)) {
          return {
            ok: false,
            error: "The review came back incomplete. Please try again.",
          };
        }
        return { ok: true, review };
      } catch {
        return { ok: false, error: "We couldn't complete this review. Please try again." };
      }
    },
  );
