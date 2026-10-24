import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Mail, MailCheck, Lock, User } from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "signin" | "signup";
}

type Mode = "signin" | "signup" | "forgot" | "check-email";

const TITLES: Record<Mode, string> = {
  signin: "Welcome Back",
  signup: "Create Your Account",
  forgot: "Reset Your Password",
  "check-email": "Verify Your Email",
};

export function AuthModal({ open, onOpenChange, defaultMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);

  // Reopen in whichever mode the caller asked for.
  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setUnverified(false);
    }
  }, [open, defaultMode]);

  const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;

  // Google verifies the email itself, so no confirmation email is sent.
  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    // On success the browser navigates to Google; only failures land here.
    if (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  const resendVerification = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Verification email sent. Check your inbox.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (mode !== "forgot" && !password)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        // Supabase returns a user with no identities when the email is
        // already registered (so it doesn't leak which emails exist).
        if (data.user && data.user.identities?.length === 0) {
          toast.error("An account with this email already exists. Try signing in.");
          setMode("signin");
          return;
        }

        if (!data.session) {
          // Email confirmation is on: the user must click the link first.
          setMode("check-email");
          return;
        }

        toast.success("Account created successfully!");
        onOpenChange(false);
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${redirectTo}/reset-password`,
        });
        if (error) throw error;
        toast.success("If that email has an account, a reset link is on its way.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.code === "email_not_confirmed") {
            setUnverified(true);
            return;
          }
          throw error;
        }

        toast.success("Signed in successfully!");
        onOpenChange(false);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      toast.error(err?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const description: Record<Mode, string> = {
    signin: "Sign in to access your assessments, resumes and interview reports.",
    signup: "Join Nexora to track your AI assessments, mock interviews, and resume reviews.",
    forgot: "Enter your email and we'll send you a link to set a new password.",
    "check-email": `We sent a verification link to ${email}. Click it to activate your account, then sign in.`,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] glass border-border/80 p-6 sm:p-8">
        <DialogHeader className="space-y-2 text-center">
          <div
            className="mx-auto grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground shadow-glow"
            style={{ background: "var(--gradient-gold)" }}
          >
            {mode === "check-email" ? (
              <MailCheck className="h-6 w-6" />
            ) : (
              <Sparkles className="h-6 w-6" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground font-display">
            {TITLES[mode]}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description[mode]}
          </DialogDescription>
        </DialogHeader>

        {mode === "check-email" ? (
          <div className="mt-6 space-y-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => void resendVerification()}
              className="w-full"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Resend verification email
            </Button>
            <Button
              type="button"
              onClick={() => setMode("signin")}
              className="w-full text-primary-foreground font-semibold"
              style={{ background: "var(--gradient-gold)" }}
            >
              I've verified — Sign in
            </Button>
          </div>
        ) : (
          <>
            {mode !== "forgot" && (
              <div className="mt-6 space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => void signInWithGoogle()}
                  className="w-full gap-2 bg-surface/50 border-border/60 font-medium"
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  or use email
                  <span className="h-px flex-1 bg-border" />
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-medium text-muted-foreground">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Alex Rivera"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9 bg-surface/50 border-border/60"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-surface/50 border-border/60"
                    required
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                      Password
                    </Label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-surface/50 border-border/60"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              {unverified && mode === "signin" && (
                <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs text-foreground">
                  Your email isn't verified yet. Check your inbox for the link, or{" "}
                  <button
                    type="button"
                    onClick={() => void resendVerification()}
                    className="font-semibold text-primary hover:underline"
                  >
                    resend it
                  </button>
                  .
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-primary-foreground font-semibold shadow-glow transition-transform hover:scale-[1.02]"
                style={{ background: "var(--gradient-gold)" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "signin"
                      ? "Signing in..."
                      : mode === "forgot"
                        ? "Sending..."
                        : "Creating account..."}
                  </>
                ) : mode === "signin" ? (
                  "Sign In"
                ) : mode === "forgot" ? (
                  "Send Reset Link"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </>
        )}

        {mode !== "check-email" && (
          <div className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signup" ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-semibold text-primary hover:underline ml-1"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                {mode === "forgot" ? "Remembered it?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "forgot" ? "signin" : "signup")}
                  className="font-semibold text-primary hover:underline ml-1"
                >
                  {mode === "forgot" ? "Sign in" : "Sign up"}
                </button>
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
