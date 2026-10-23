import type { ResumeData, TemplateKey } from "./types";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

function Bullets({ text }: { text: string }) {
  if (!text) return null;
  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);
  if (lines.length <= 1) return <p className="text-[11px] leading-snug">{text}</p>;
  return (
    <ul className="list-disc pl-4 space-y-0.5 text-[11px] leading-snug">
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}

const templateStyles: Record<TemplateKey, {
  wrap: string;
  name: string;
  section: string;
  divider: string;
  accent: string;
  chip: string;
  header: string;
}> = {
  modern: {
    wrap: "font-sans",
    name: "text-2xl font-bold tracking-tight text-slate-900",
    section: "text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-700",
    divider: "border-b border-emerald-600/40 mb-2",
    accent: "text-emerald-700",
    chip: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    header: "border-b-2 border-emerald-600 pb-3",
  },
  minimal: {
    wrap: "font-serif",
    name: "text-2xl font-semibold tracking-tight text-slate-900",
    section: "text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-700",
    divider: "border-b border-slate-300 mb-2",
    accent: "text-slate-700",
    chip: "bg-slate-100 text-slate-700 border border-slate-200",
    header: "border-b border-slate-400 pb-3",
  },
  professional: {
    wrap: "font-sans",
    name: "text-2xl font-bold tracking-tight text-slate-900",
    section: "text-[11px] font-bold tracking-[0.14em] uppercase text-blue-800",
    divider: "border-b-2 border-blue-800 mb-2",
    accent: "text-blue-800",
    chip: "bg-blue-50 text-blue-800 border border-blue-200",
    header: "bg-blue-900 text-white -m-8 mb-6 p-8 pb-5",
  },
  corporate: {
    wrap: "font-sans",
    name: "text-2xl font-bold tracking-tight text-slate-900 uppercase",
    section: "text-[11px] font-bold tracking-[0.2em] uppercase text-slate-900",
    divider: "border-b-2 border-slate-900 mb-2",
    accent: "text-slate-900",
    chip: "bg-slate-900 text-white",
    header: "border-b-4 border-slate-900 pb-3",
  },
  developer: {
    wrap: "font-mono",
    name: "text-2xl font-bold tracking-tight text-slate-900",
    section: "text-[11px] font-bold tracking-[0.14em] uppercase text-fuchsia-700",
    divider: "border-b border-dashed border-fuchsia-500/60 mb-2",
    accent: "text-fuchsia-700",
    chip: "bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200",
    header: "border-b border-dashed border-slate-400 pb-3",
  },
  executive: {
    wrap: "font-serif",
    name: "text-3xl font-bold tracking-tight text-slate-900",
    section: "text-[11px] font-bold tracking-[0.22em] uppercase text-amber-800",
    divider: "border-b border-amber-700/50 mb-2",
    accent: "text-amber-800",
    chip: "bg-amber-50 text-amber-900 border border-amber-200",
    header: "border-b-2 border-amber-700 pb-3",
  },
};

export function ResumePreview({
  data,
  template,
}: {
  data: ResumeData;
  template: TemplateKey;
}) {
  const s = templateStyles[template];
  const { personal: p } = data;
  return (
    <div
      id="resume-print-area"
      className={`bg-white text-slate-800 shadow-2xl mx-auto ${s.wrap}`}
      style={{ width: "100%", aspectRatio: "1 / 1.294", padding: "2rem", fontSize: "11px", lineHeight: 1.45 }}
    >
      <header className={s.header}>
        <h1 className={s.name}>{p.fullName || "Your Name"}</h1>
        {p.title && <p className={`text-sm mt-0.5 ${s.accent}`}>{p.title}</p>}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-slate-600">
          {p.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</span>}
          {p.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>}
          {p.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.location}</span>}
          {p.linkedin && <span className="inline-flex items-center gap-1"><Linkedin className="h-3 w-3" />{p.linkedin}</span>}
          {p.github && <span className="inline-flex items-center gap-1"><Github className="h-3 w-3" />{p.github}</span>}
          {p.website && <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" />{p.website}</span>}
        </div>
      </header>

      {data.summary && (
        <section className="mt-4">
          <h2 className={s.section}>Summary</h2>
          <div className={s.divider} />
          <p className="text-[11px] leading-snug">{data.summary}</p>
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="mt-4">
          <h2 className={s.section}>Skills</h2>
          <div className={s.divider} />
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((sk) => (
              <span key={sk} className={`px-2 py-0.5 rounded text-[10px] font-medium ${s.chip}`}>{sk}</span>
            ))}
          </div>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className="mt-4">
          <h2 className={s.section}>Experience</h2>
          <div className={s.divider} />
          <div className="space-y-3">
            {data.experience.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-[12px] text-slate-900">{e.role || "Role"}<span className="font-normal text-slate-600"> — {e.company}</span></p>
                  <p className="text-[10.5px] text-slate-500">{e.duration}</p>
                </div>
                <Bullets text={e.responsibilities} />
              </div>
            ))}
          </div>
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="mt-4">
          <h2 className={s.section}>Projects</h2>
          <div className={s.divider} />
          <div className="space-y-3">
            {data.projects.map((pr) => (
              <div key={pr.id}>
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-[12px] text-slate-900">
                    {pr.name || "Project"}
                    {pr.tech && <span className="font-normal text-slate-600"> · {pr.tech}</span>}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[40%]">{pr.github || pr.demo}</p>
                </div>
                <Bullets text={pr.description} />
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mt-4">
          <h2 className={s.section}>Education</h2>
          <div className={s.divider} />
          <div className="space-y-2">
            {data.education.map((ed) => (
              <div key={ed.id} className="flex justify-between items-baseline">
                <div>
                  <p className="font-semibold text-[12px] text-slate-900">{ed.college || "College"}</p>
                  <p className="text-[11px] text-slate-600">
                    {ed.degree}{ed.branch && `, ${ed.branch}`}{ed.cgpa && ` · CGPA ${ed.cgpa}`}
                  </p>
                </div>
                <p className="text-[10.5px] text-slate-500">{ed.year}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.certifications.length > 0 && (
        <section className="mt-4">
          <h2 className={s.section}>Certifications</h2>
          <div className={s.divider} />
          <ul className="space-y-1">
            {data.certifications.map((c) => (
              <li key={c.id} className="flex justify-between text-[11px]">
                <span><span className="font-semibold text-slate-900">{c.name}</span>{c.organization && ` — ${c.organization}`}</span>
                <span className="text-slate-500 text-[10.5px]">{c.date}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}