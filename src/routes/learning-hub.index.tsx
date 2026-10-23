import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Code2,
  Globe,
  Bot,
  Database,
  Cloud,
  ShieldCheck,
  Smartphone,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  BookOpen,
  Award,
} from "lucide-react";
import { useDsaProgress } from "@/hooks/useDsaProgress";

export const Route = createFileRoute("/learning-hub/")({
  component: LearningHubPage,
});

interface CategoryCard {
  id: string;
  title: string;
  desc: string;
  icon: any;
  status: "available" | "coming_soon";
  topicsCount?: number;
  levelBadge?: string;
}

const categories: CategoryCard[] = [
  {
    id: "dsa",
    title: "Data Structures & Algorithms (DSA)",
    desc: "Master foundational to advanced DSA concepts with interactive theory, conceptual quizzes, and integrated coding problem verification.",
    icon: Code2,
    status: "available",
    topicsCount: 16,
    levelBadge: "Foundations to Advanced",
  },
  {
    id: "web-dev",
    title: "Full Stack Web Development",
    desc: "Modern React, Next.js, TanStack Start, Node.js microservices, TypeScript architecture, and database integrations.",
    icon: Globe,
    status: "coming_soon",
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    desc: "LLMs, LangChain, vector embeddings, Prompt Engineering, PyTorch foundations, and generative AI production pipelines.",
    icon: Bot,
    status: "coming_soon",
  },
  {
    id: "system-design",
    title: "System Design & Distributed Systems",
    desc: "Scalability, caching, message queues, database sharding, CAP theorem, and high-concurrency architectures.",
    icon: Cpu,
    status: "coming_soon",
  },
  {
    id: "database-engineering",
    title: "Database Engineering & SQL",
    desc: "Query optimization, indexing internals, ACID transactions, relational & NoSQL paradigms.",
    icon: Database,
    status: "coming_soon",
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps (Docker, K8s, AWS)",
    desc: "CI/CD pipelines, container orchestration, Terraform IaC, and resilient cloud deployments.",
    icon: Cloud,
    status: "coming_soon",
  },
];

function LearningHubPage() {
  const { progress } = useDsaProgress();

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      {/* Hero section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 glass text-xs font-semibold text-primary border border-primary/30">
          <Sparkles className="h-3.5 w-3.5" /> Nexora Learning Hub
        </div>
        <h1
          className="text-4xl md:text-5xl font-black tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Structured Learning Modules for Top Engineers
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          Step-by-step interactive paths featuring theory, concept quizzes, real-time code execution, and curated practice problems.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isAvailable = cat.status === "available";

          return (
            <div
              key={cat.id}
              className={`group relative rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 ${
                isAvailable
                  ? "glass border-primary/40 shadow-glow hover:border-primary/80 hover:-translate-y-1"
                  : "glass border-border/50 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`grid h-14 w-14 place-items-center rounded-2xl ${
                      isAvailable
                        ? "text-primary-foreground shadow-glow"
                        : "bg-surface text-muted-foreground border border-border/60"
                    }`}
                    style={isAvailable ? { background: "var(--gradient-gold)" } : {}}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  {isAvailable ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Available Now
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-muted-foreground bg-surface border border-border/60">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground/60" /> Coming Soon
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground font-display group-hover:text-primary transition">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                {isAvailable && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Path Progress</span>
                      <span className="text-primary font-bold">{progress.percentComplete}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-full shadow-glow"
                        style={{
                          width: `${progress.percentComplete}%`,
                          background: "var(--gradient-gold)",
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{cat.topicsCount} Core Topics</span>
                      <span>{progress.totalCompleted} / {progress.totalLevels} Levels Completed</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-border/60">
                {isAvailable ? (
                  <Link
                    to="/learning-hub/dsa"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs md:text-sm font-bold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
                    style={{ background: "var(--gradient-gold)" }}
                  >
                    <BookOpen className="h-4 w-4" />
                    {progress.totalCompleted > 0 ? "Continue Learning DSA" : "Start Learning DSA"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl glass text-xs font-semibold text-muted-foreground/60 cursor-not-allowed"
                  >
                    Module in Development
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
