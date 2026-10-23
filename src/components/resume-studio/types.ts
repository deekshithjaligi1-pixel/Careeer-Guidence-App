export type PersonalInfo = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  photo?: string;
};

export type Education = {
  id: string;
  college: string;
  degree: string;
  branch: string;
  cgpa: string;
  year: string;
};

export type Project = {
  id: string;
  name: string;
  tech: string;
  github: string;
  demo: string;
  description: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  duration: string;
  responsibilities: string;
};

export type Certification = {
  id: string;
  name: string;
  organization: string;
  date: string;
  link: string;
};

export type ResumeData = {
  personal: PersonalInfo;
  summary: string;
  education: Education[];
  skills: string[];
  projects: Project[];
  experience: Experience[];
  certifications: Certification[];
};

export type TemplateKey =
  | "modern"
  | "minimal"
  | "professional"
  | "corporate"
  | "developer"
  | "executive";

export const STEPS = [
  "Personal Information",
  "Professional Summary",
  "Education",
  "Skills",
  "Projects",
  "Experience",
  "Certifications",
  "Preview & Export",
] as const;

export const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyResume: ResumeData = {
  personal: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
  },
  summary: "",
  education: [],
  skills: [],
  projects: [],
  experience: [],
  certifications: [],
};