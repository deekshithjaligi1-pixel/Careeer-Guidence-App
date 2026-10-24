import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  ScanSearch,
  BrainCircuit,
  MessagesSquare,
  ArrowRight,
  UserPlus,
  LogIn,
  BookOpen,
} from "lucide-react";
import { HomeProgress } from "@/components/HomeProgress";

export const Route = createFileRoute("/")({
  component: Index,
});

const features = [
  {
    icon: BookOpen,
    title: "Learning Hub (DSA)",
    desc: "16 Progressive DSA modules with theory, concept quizzes, live in-browser compiler tests, and curated practice problems.",
    href: "/learning-hub",
    cta: "Explore Learning Hub",
  },
  {
    icon: FileText,
    title: "AI Resume Builder",
    desc: "Generate polished, ATS-ready resumes with AI-crafted bullet points and stronger action verbs.",
    href: "/resume-builder",
    cta: "Try Resume Builder",
  },
  {
    icon: ScanSearch,
    title: "AI Resume Reviewer",
    desc: "Upload your resume and get an instant ATS score, grammar check, and targeted improvement suggestions.",
    href: "/resume-review",
    cta: "Review My Resume",
  },
  {
    icon: BrainCircuit,
    title: "Skill Assessment",
    desc: "Adaptive MCQ, code, and scenario quizzes across Java, React, SQL and more — with AI explanations.",
    href: "/skill-assessment",
    cta: "Test My Skills",
  },
  {
    icon: MessagesSquare,
    title: "AI Mock Interview",
    desc: "Chat with an AI interviewer that adapts difficulty, evaluates answers, and returns a full report.",
    href: "/mock-interview",
    cta: "Start Mock Interview",
  },
] as const;

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)]" />

      {/* Ambient gold light streaks */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -left-32 top-10 h-[520px] w-[2px] rotate-[22deg] opacity-70 animate-shimmer"
          style={{
            background:
              "linear-gradient(to bottom, transparent, oklch(0.85 0.15 82 / 0.9), transparent)",
            filter: "blur(1px)",
            ["--r" as never]: "22deg",
          }}
        />
        <div
          className="absolute -left-10 top-40 h-[420px] w-[1px] rotate-[24deg] opacity-40 animate-shimmer"
          style={{
            background:
              "linear-gradient(to bottom, transparent, oklch(0.85 0.15 82 / 0.7), transparent)",
            animationDelay: "1.4s",
            ["--r" as never]: "24deg",
          }}
        />
        <div
          className="absolute -right-32 top-24 h-[480px] w-[2px] -rotate-[22deg] opacity-70 animate-shimmer"
          style={{
            background:
              "linear-gradient(to bottom, transparent, oklch(0.85 0.15 82 / 0.9), transparent)",
            filter: "blur(1px)",
            animationDelay: "0.8s",
            ["--r" as never]: "-22deg",
          }}
        />
        <div
          className="absolute -right-10 top-56 h-[380px] w-[1px] -rotate-[24deg] opacity-40 animate-shimmer"
          style={{
            background:
              "linear-gradient(to bottom, transparent, oklch(0.85 0.15 82 / 0.7), transparent)",
            animationDelay: "2.2s",
            ["--r" as never]: "-24deg",
          }}
        />
        {[
          { top: "18%", left: "12%", d: "0s" },
          { top: "32%", left: "8%", d: "1.2s" },
          { top: "58%", left: "15%", d: "2.4s" },
          { top: "24%", left: "88%", d: "0.6s" },
          { top: "48%", left: "92%", d: "1.8s" },
          { top: "70%", left: "85%", d: "0.3s" },
          { top: "76%", left: "20%", d: "2.1s" },
          { top: "40%", left: "50%", d: "1.5s" },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full animate-twinkle"
            style={{
              top: s.top,
              left: s.left,
              background: "oklch(0.9 0.15 82)",
              boxShadow: "0 0 8px oklch(0.85 0.15 82 / 0.9)",
              animationDelay: s.d,
            }}
          />
        ))}
      </div>

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-4 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="flex flex-col items-center text-center">
          {/* Ornament */}
          <div className="animate-fade-in flex items-center gap-4 opacity-80">
            <span
              className="h-px w-16 md:w-24"
              style={{
                background:
                  "linear-gradient(to right, transparent, oklch(0.82 0.14 82 / 0.9))",
              }}
            />
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="animate-twinkle"
              style={{ color: "var(--gold)" }}
              aria-hidden
            >
              <path
                d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
                fill="currentColor"
              />
            </svg>
            <span
              className="h-px w-16 md:w-24"
              style={{
                background:
                  "linear-gradient(to left, transparent, oklch(0.82 0.14 82 / 0.9))",
              }}
            />
          </div>

          {/* Brand wordmark */}
          <h1
            className="mt-6 animate-fade-up text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gradient-gold"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
          >
            NEXORA
          </h1>
          <p
            className="mt-3 animate-fade-up [animation-delay:120ms] text-sm md:text-base tracking-[0.42em] text-foreground/85"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            AI CAREER PLATFORM
          </p>

          {/* Tagline */}
          <h2
            className="mt-10 animate-fade-up [animation-delay:220ms] text-2xl md:text-4xl font-semibold tracking-tight max-w-3xl"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Build Your Resume. Master Your Skills.{" "}
            <span className="text-gradient-gold">Land Your Dream Job.</span>
          </h2>
          <p className="mt-5 animate-fade-up [animation-delay:320ms] text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            AI-powered tools to help you create a perfect resume, improve your skills,
            practice interviews and get personalized career guidance.
          </p>

          {/* CTAs */}
          <div className="mt-10 animate-fade-up [animation-delay:420ms] flex flex-col sm:flex-row gap-4">
            <Link
              to="/skill-assessment"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.03] shadow-glow min-w-[200px]"
              style={{ background: "var(--gradient-gold)" }}
            >
              <LogIn className="h-5 w-5" />
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-foreground transition-all min-w-[200px] border hover:scale-[1.03]"
              style={{
                background: "oklch(0.22 0.09 265)",
                borderColor: "oklch(0.82 0.14 82 / 0.35)",
              }}
            >
              <UserPlus className="h-5 w-5" style={{ color: "var(--gold)" }} />
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Signed-in users see their own progress here */}
      <HomeProgress />

      <section id="features" className="mx-auto max-w-7xl px-4 md:px-8 pb-32">
        <div className="max-w-2xl">
          <span
            className="text-xs uppercase tracking-[0.28em]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span style={{ color: "var(--gold)" }}>/</span>Features
          </span>
          <h2
            className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything you need to land the offer.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg" style={{ fontFamily: "var(--font-sans)" }}>
            Four AI modules that work together — from your first resume draft to your final on-site.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <Link
              key={f.href}
              to={f.href}
              className="group relative overflow-hidden rounded-3xl glass p-8 transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <div
                className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full opacity-0 group-hover:opacity-30 transition-opacity blur-3xl"
                style={{ background: "var(--gradient-gold)" }}
              />
              <div className="relative">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground shadow-glow"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  <f.icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3
                  className="mt-6 text-2xl font-semibold tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {f.title}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.desc}</p>
                <div
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: "var(--gold)" }}
                >
                  {f.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-8 pb-32">
        <div className="relative overflow-hidden rounded-[2rem] glass p-12 md:p-16 text-center shadow-card">
          <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-60" />
          <div className="relative">
            <h3
              className="text-3xl md:text-5xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your first mock interview is{" "}
              <span className="text-gradient-gold">one click away.</span>
            </h3>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Ready to test your skills? Open the simulator and practice in real time.
            </p>
            <Link
              to="/mock-interview"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
              style={{ background: "var(--gradient-gold)" }}
            >
              Launch Mock Interview
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <footer className="mt-16 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span
              className="grid h-7 w-7 place-items-center rounded-md font-black text-primary-foreground"
              style={{ background: "var(--gradient-gold)", fontFamily: "var(--font-display)" }}
            >
              N
            </span>
            <span>Nexora — the AI career platform built for ambitious students.</span>
          </div>
          <div>© {new Date().getFullYear()} Nexora</div>
        </footer>
      </section>
    </div>
  );
}