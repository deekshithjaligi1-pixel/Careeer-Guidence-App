import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { getGeminiModel } from "./gemini.server";
import { buildFallbackQuestions, DIFFICULTY_GUIDE, hasCuratedBank, skillsForRole } from "./interview-bank";

const MessageSchema = z.object({
  question: z.string(),
  answer: z.string(),
  score: z.number().optional(),
});

const ConfigSchema = z.object({
  role: z.string(),
  type: z.enum(["hr", "technical", "mixed"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  duration: z.number(),
  skills: z.array(z.string()),
  language: z.enum(["english", "hindi"]),
  totalQuestions: z.number(),
});

export type InterviewConfig = z.infer<typeof ConfigSchema>;
export type InterviewTurn = z.infer<typeof MessageSchema>;

function getModel() {
  try {
    return getGeminiModel("gemini-2.5-flash");
  } catch {
    return null;
  }
}

function systemPrompt(cfg: InterviewConfig) {
  return `You are a professional interviewer conducting a ${cfg.type} interview for a ${cfg.role} candidate at ${cfg.difficulty} difficulty.
Skills in scope: ${cfg.skills.join(", ") || "general software engineering"}.
Language: ${cfg.language}.
Difficulty definition you MUST respect: ${DIFFICULTY_GUIDE[cfg.difficulty]}`;
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "```").split("```").join("\n");
  const start = cleaned.search(/[[{]/);
  if (start === -1) return null;
  const open = cleaned[start];
  const close = open === "[" ? "]" : "}";
  const end = cleaned.lastIndexOf(close);
  if (end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function cleanQuestions(raw: unknown): string[] {
  const arr = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as any).questions)
      ? (raw as any).questions
      : [];
  const out: string[] = [];
  for (const item of arr) {
    const q =
      typeof item === "string"
        ? item
        : item && typeof item === "object" && typeof (item as any).question === "string"
          ? (item as any).question
          : "";
    const t = q.trim();
    if (t.length >= 8 && !out.includes(t)) out.push(t);
  }
  return out;
}

/** Always returns a non-empty list of exactly cfg.totalQuestions questions. */
export const generateQuestions = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ConfigSchema.parse(d))
  .handler(async ({ data }) => {
    const total = Math.max(1, data.totalQuestions || 5);
    const skills =
      data.skills.length > 0 ? data.skills : skillsForRole(data.role);
    data = { ...data, skills };
    const fallback = buildFallbackQuestions({
      type: data.type,
      difficulty: data.difficulty,
      skills,
      totalQuestions: total,
    });

    const model = getModel();
    if (!model) return { questions: fallback, source: "bank" as const };

    try {
      const mix =
        data.type === "hr"
          ? "All questions must be HR / behavioural questions."
          : data.type === "technical"
            ? `All questions must be technical and must be spread evenly across these skills: ${data.skills.join(", ") || "software engineering"}.`
            : `About 40% HR/behavioural and 60% technical, spread evenly across: ${data.skills.join(", ") || "software engineering"}.`;

      const { text } = await generateText({
        model,
        system: systemPrompt(data),
        prompt: `Generate exactly ${total} realistic, commonly asked interview questions.
${mix}
Reference questions that show the EXACT expected difficulty and style for this level (match their depth, do not copy them verbatim):
${fallback.slice(0, 6).map((q) => `- ${q}`).join("\n")}

Rules:
- Respect the difficulty definition strictly. Do NOT make MEDIUM questions advanced.
- One sentence each, no numbering, no preamble, no explanations.
- No duplicates.
Return ONLY a JSON array of ${total} strings.`,
      });

      const parsed = cleanQuestions(extractJson(text));
      if (parsed.length >= total) {
        return { questions: parsed.slice(0, total), source: "ai" as const };
      }
      if (parsed.length > 0) {
        const merged = [...parsed];
        for (const q of fallback) {
          if (merged.length >= total) break;
          if (!merged.includes(q)) merged.push(q);
        }
        return { questions: merged.slice(0, total), source: "ai" as const };
      }
    } catch (e) {
      console.error("question generation failed", e);
    }
    return { questions: fallback, source: "bank" as const };
  });

const EvalInput = z.object({
  config: ConfigSchema,
  history: z.array(MessageSchema),
  currentQuestion: z.string(),
  answer: z.string(),
  questionIndex: z.number(),
});

export type AnswerFeedback = {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestion: string;
  isLast: boolean;
};

export const evaluateAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EvalInput.parse(d))
  .handler(async ({ data }): Promise<AnswerFeedback> => {
    const isLast = data.questionIndex + 1 >= data.config.totalQuestions;
    const skipped =
      !data.answer.trim() ||
      data.answer.trim() === "[skipped]" ||
      data.answer.trim() === "[no answer]";

    const offline: AnswerFeedback = {
      score: skipped ? 0 : 5,
      strengths: skipped ? [] : ["You attempted the question."],
      improvements: skipped
        ? ["Try answering even partially — silence scores zero in a real interview."]
        : ["Add a concrete example.", "Structure your answer: definition, example, trade-off."],
      suggestion: skipped
        ? "This question was skipped. Revisit the concept and try again in your next session."
        : "Detailed AI feedback was unavailable for this answer. Aim to explain the concept, give a short example, and mention when you would use it.",
      isLast,
    };

    const model = getModel();
    if (!model) return offline;

    try {
      const { text } = await generateText({
        model,
        system: systemPrompt(data.config),
        prompt: `Question asked: "${data.currentQuestion}"
Candidate answer: "${data.answer}"

Evaluate strictly but fairly for the stated difficulty level.
Return ONLY JSON: {"score": number 0-10, "strengths": string[] (max 3), "improvements": string[] (max 3), "suggestion": string}`,
      });
      const obj = extractJson(text) as any;
      if (!obj || typeof obj !== "object") return offline;
      const score = Number(obj.score);
      return {
        score: Number.isFinite(score) ? Math.min(10, Math.max(0, score)) : offline.score,
        strengths: Array.isArray(obj.strengths) ? obj.strengths.filter((s: unknown) => typeof s === "string").slice(0, 3) : [],
        improvements: Array.isArray(obj.improvements) ? obj.improvements.filter((s: unknown) => typeof s === "string").slice(0, 3) : [],
        suggestion: typeof obj.suggestion === "string" ? obj.suggestion : offline.suggestion,
        isLast,
      };
    } catch (e) {
      console.error("evaluation failed", e);
      return offline;
    }
  });

const ReportInput = z.object({
  config: ConfigSchema,
  history: z.array(MessageSchema),
});

export type InterviewReport = {
  overall: number;
  technical: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  timeManagement: number;
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: {
    topic: string;
    currentLevel: string;
    recommendedLevel: string;
    studyTime: string;
  }[];
  recommendation: string;
};

function offlineReport(data: z.infer<typeof ReportInput>): InterviewReport {
  const scores = data.history.map((h) => h.score ?? 0);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const pct = Math.round(avg * 10);
  const skills = data.config.skills.length ? data.config.skills : ["Software Engineering"];
  return {
    overall: pct,
    technical: pct,
    communication: Math.min(100, pct + 5),
    problemSolving: Math.max(0, pct - 5),
    confidence: pct,
    timeManagement: pct,
    strengths: ["Completed the full interview", "Engaged with every question"],
    weaknesses: ["Add more concrete examples", "Go deeper on core concepts"],
    recommendedTopics: skills.slice(0, 4).map((s) => ({
      topic: s,
      currentLevel: pct >= 70 ? "Intermediate" : "Beginner",
      recommendedLevel: pct >= 70 ? "Advanced" : "Intermediate",
      studyTime: "1-2 weeks",
    })),
    recommendation:
      pct >= 70
        ? "Solid performance. Keep practising harder scenario-based questions."
        : "Focus on fundamentals of your selected skills, then repeat this interview.",
  };
}

export const generateReport = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ReportInput.parse(d))
  .handler(async ({ data }): Promise<InterviewReport> => {
    const model = getModel();
    if (!model) return offlineReport(data);
    try {
      const { text } = await generateText({
        model,
        system: systemPrompt(data.config),
        prompt: `Full interview transcript with scores: ${JSON.stringify(data.history)}.
Produce the final performance report as ONLY JSON:
{"overall":0-100,"technical":0-100,"communication":0-100,"problemSolving":0-100,"confidence":0-100,"timeManagement":0-100,"strengths":string[2-5],"weaknesses":string[2-5],"recommendedTopics":[{"topic":string,"currentLevel":string,"recommendedLevel":string,"studyTime":string}],"recommendation":string}`,
      });
      const obj = extractJson(text) as any;
      if (!obj || typeof obj.overall !== "number") return offlineReport(data);
      const base = offlineReport(data);
      return {
        ...base,
        ...obj,
        recommendedTopics: Array.isArray(obj.recommendedTopics) && obj.recommendedTopics.length
          ? obj.recommendedTopics
          : base.recommendedTopics,
      } as InterviewReport;
    } catch (e) {
      console.error("report failed", e);
      return offlineReport(data);
    }
  });
