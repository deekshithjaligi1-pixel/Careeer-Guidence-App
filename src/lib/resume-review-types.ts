export type ReqStatus = "verified" | "related" | "not_found" | "unclear";

export type CategoryKey =
  | "content"
  | "experience"
  | "skills"
  | "ats"
  | "formatting";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  content: "Content & Impact",
  experience: "Experience",
  skills: "Skills",
  ats: "ATS Readability",
  formatting: "Formatting & Structure",
};

export const CATEGORY_WEIGHTS: Record<CategoryKey, number> = {
  content: 0.25,
  experience: 0.2,
  skills: 0.2,
  ats: 0.2,
  formatting: 0.15,
};

export type Requirement = {
  requirement: string;
  kind: "required" | "preferred";
  status: ReqStatus;
  evidence: string | null;
  note: string | null;
};

export type Improvement = {
  category: string;
  issue: string;
  why: string;
  recommendation: string;
};

export type Rewrite = {
  current: string;
  suggested: string;
};

export type SectionNote = {
  section: string;
  note: string;
};

export type SkillGroup = {
  group: string;
  skills: string[];
};

export type ResumeReview = {
  id: string;
  createdAt: string;
  candidate: {
    name: string | null;
    title: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    links: string[];
  };
  overallScore: number;
  categoryScores: Record<CategoryKey, number>;
  summary: string;
  strengths: string[];
  improvements: Improvement[];
  skillGroups: SkillGroup[];
  sectionNotes: SectionNote[];
  rewrites: Rewrite[];
  jobMatch: {
    role: string | null;
    requirements: Requirement[];
  } | null;
  resumeFileName: string;
};
