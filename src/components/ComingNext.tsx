import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function ComingNext({
  icon: Icon,
  title,
  tagline,
  points,
}: {
  icon: LucideIcon;
  title: string;
  tagline: string;
  points: string[];
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <section className="mx-auto max-w-4xl px-4 md:px-8 py-24 md:py-32">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>

        <div className="mt-10 glass rounded-3xl p-8 md:p-12 shadow-card">
          <div className="flex items-center gap-4">
            <div
              className="grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground shadow-glow"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Icon className="h-7 w-7" strokeWidth={2} />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> Active Module
            </span>
          </div>

          <h1 className="mt-8 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            {title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">{tagline}</p>

          <div className="mt-10 grid sm:grid-cols-2 gap-3">
            {points.map((p) => (
              <div
                key={p}
                className="rounded-2xl border border-border/60 bg-surface/60 p-4 text-sm text-foreground/90"
              >
                {p}
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-muted-foreground">
            Powered directly by Google Gemini and Supabase backend.
          </p>
        </div>
      </section>
    </div>
  );
}