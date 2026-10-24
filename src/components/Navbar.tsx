import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, Sparkles, LayoutDashboard, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "./AuthModal";
import { useAuthUser } from "@/hooks/useAuthUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const links = [
  { to: "/", label: "Home" },
  { to: "/learning-hub", label: "Learning Hub" },
  { to: "/resume-builder", label: "Resume Builder" },
  { to: "/resume-review", label: "Resume Review" },
  { to: "/skill-assessment", label: "Skill Assessment" },
  { to: "/mock-interview", label: "Mock Interview" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin } = useAuthUser();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
    } catch (e: any) {
      toast.error(e?.message || "Failed to sign out");
    }
  };

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "backdrop-blur-xl bg-background/80 border-b border-border/60" : ""
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <span
              className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground font-black text-xl tracking-tight shadow-glow"
              style={{ background: "var(--gradient-gold)", fontFamily: "var(--font-display)" }}
            >
              N
            </span>
            <span className="flex flex-col leading-tight text-left">
              <span
                className="text-[11px] font-bold tracking-[0.18em] text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                NEXORA
              </span>
              <span
                className="text-[9px] tracking-[0.2em] font-medium"
                style={{ color: "var(--gold)" }}
              >
                AI CAREER PLATFORM
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
                activeProps={{
                  className:
                    "text-foreground after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[image:var(--gradient-gold)]",
                }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl glass px-3.5 py-2 text-sm font-medium text-foreground hover:border-primary/50 transition">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/20 text-primary font-semibold text-xs">
                      {user.email?.[0].toUpperCase() || "U"}
                    </span>
                    <span className="max-w-[120px] truncate text-xs">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-border/70 p-1.5">
                  <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                    Signed in as{" "}
                    <strong className="text-foreground block truncate">{user.email}</strong>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link to="/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="cursor-pointer gap-2">
                      <Link to="/admin">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <button
                  onClick={() => openAuth("signin")}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-foreground/85 hover:text-foreground transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth("signup")}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 shadow-glow"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Sign Up
                </button>
              </>
            )}
          </div>

          <button
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg glass"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
            <nav className="mx-auto max-w-7xl flex flex-col p-4 gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface"
                  activeProps={{ className: "text-foreground bg-surface" }}
                >
                  {l.label}
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t border-border/60 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl glass py-2.5 text-sm text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      My Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl glass py-2.5 text-sm text-foreground"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl glass py-2.5 text-sm text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out ({user.email})
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setOpen(false);
                        openAuth("signin");
                      }}
                      className="w-full rounded-xl glass py-2.5 text-sm font-medium text-foreground"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        openAuth("signup");
                      }}
                      className="w-full rounded-xl py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
                      style={{ background: "var(--gradient-gold)" }}
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} defaultMode={authMode} />
    </>
  );
}
