import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — Nexora" }] }),
  component: ResetPasswordPage,
});

// Landing page for the link in the "reset your password" email. Supabase
// signs the user in from the link, then we let them set a new password.
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. You're signed in.");
    void navigate({ to: "/dashboard" });
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center px-4 py-16">
      <div className="w-full rounded-2xl glass p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
        {!ready ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Open this page from the link in your reset email. If the link has expired, request a new
            one from the Sign In window.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {[
              { id: "password", label: "New password", value: password, set: setPassword },
              { id: "confirm", label: "Confirm password", value: confirm, set: setConfirm },
            ].map((f) => (
              <div key={f.id} className="space-y-1.5">
                <Label htmlFor={f.id} className="text-xs font-medium text-muted-foreground">
                  {f.label}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={f.id}
                    type="password"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="pl-9 bg-surface/50 border-border/60"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            ))}
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-primary-foreground font-semibold"
              style={{ background: "var(--gradient-gold)" }}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update password
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
