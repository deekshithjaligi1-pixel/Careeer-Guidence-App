import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Loader2, Search, ShieldAlert } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Nexora" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type UserRow = Database["public"]["Functions"]["admin_list_users"]["Returns"][number];

type Overview = {
  total_users: number;
  verified_users: number;
  new_today: number;
  new_7d: number;
  new_30d: number;
  active_today: number;
  active_7d: number;
  active_30d: number;
  assessments: number;
  interviews: number;
  dsa_quiz_attempts: number;
  dsa_levels_completed: number;
  problems_solved: number;
  resume_reviews: number;
  resumes_built: number;
  avg_assessment_score: number | null;
  avg_interview_score: number | null;
  avg_ats_score: number | null;
  daily: { day: string; signups: number; active: number }[];
  top_technologies: { technology: string; attempts: number; avg_score: number }[];
};

type Detail = {
  assessments: { technology: string; difficulty: string; score: number; at: string }[];
  interviews: { type: string; difficulty: string; score: number; at: string }[];
  dsa_levels: { topic_id: string; level_id: string; quiz_score: number; completed: boolean }[];
  resume_reviews: { file_name: string | null; score: number; at: string }[];
};

type SortKey =
  "joined_at" | "last_active_at" | "assessments" | "interviews" | "dsa_levels_completed";

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "2-digit",
      })
    : "—";

function AdminPage() {
  const { user, isAdmin, loading } = useAuthUser();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("joined_at");
  const [openId, setOpenId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, Detail>>({});

  useEffect(() => {
    if (!isAdmin) return;
    void Promise.all([supabase.rpc("admin_overview"), supabase.rpc("admin_list_users")]).then(
      ([o, u]) => {
        if (o.error || u.error) {
          setError((o.error ?? u.error)!.message);
          return;
        }
        setOverview(o.data as unknown as Overview);
        setUsers(u.data ?? []);
      },
    );
  }, [isAdmin]);

  const toggleDetail = async (id: string) => {
    setOpenId((cur) => (cur === id ? null : id));
    if (details[id]) return;
    const { data, error: err } = await supabase.rpc("admin_user_detail", { target: id });
    if (!err) setDetails((d) => ({ ...d, [id]: data as unknown as Detail }));
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter(
        (u) =>
          !q ||
          `${u.full_name ?? ""} ${u.email ?? ""} ${u.education ?? ""}`.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const av = a[sort] ?? "";
        const bv = b[sort] ?? "";
        return av < bv ? 1 : av > bv ? -1 : 0;
      });
  }, [users, query, sort]);

  if (loading) return <Spinner />;

  if (!user || !isAdmin) return <AdminLogin signedInAs={user?.email ?? null} />;

  if (error) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center text-sm text-destructive">
        Could not load admin data: {error}
      </main>
    );
  }

  if (!overview) return <Spinner />;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Platform overview</h1>

      {/* Users */}
      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label="Total users"
          value={overview.total_users}
          sub={`${overview.verified_users} verified`}
        />
        <Stat
          label="New sign-ups"
          value={overview.new_7d}
          sub={`${overview.new_today} today · ${overview.new_30d} in 30d`}
        />
        <Stat
          label="Active (7 days)"
          value={overview.active_7d}
          sub={`${overview.active_today} today · ${overview.active_30d} in 30d`}
        />
        <Stat
          label="Verified rate"
          value={
            overview.total_users
              ? `${Math.round((overview.verified_users / overview.total_users) * 100)}%`
              : "—"
          }
        />
      </section>

      {/* Feature usage */}
      <section className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat
          label="Assessments"
          value={overview.assessments}
          sub={`avg ${overview.avg_assessment_score ?? "—"}%`}
        />
        <Stat
          label="Mock interviews"
          value={overview.interviews}
          sub={`avg ${overview.avg_interview_score ?? "—"}%`}
        />
        <Stat label="DSA quiz attempts" value={overview.dsa_quiz_attempts} />
        <Stat
          label="DSA levels done"
          value={overview.dsa_levels_completed}
          sub={`${overview.problems_solved} problems solved`}
        />
        <Stat
          label="Resume reviews"
          value={overview.resume_reviews}
          sub={`avg ATS ${overview.avg_ats_score ?? "—"}`}
        />
        <Stat label="Resumes built" value={overview.resumes_built} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Panel title="Last 30 days">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overview.daily.map((d) => ({
                  ...d,
                  label: new Date(d.day).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  }),
                }))}
                margin={{ left: -20, right: 8 }}
              >
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--glass)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                />
                <Bar
                  dataKey="active"
                  name="Active users"
                  fill="var(--chart-2)"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="signups"
                  name="Sign-ups"
                  fill="var(--primary)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <Legend color="var(--primary)" label="Sign-ups" />
            <Legend color="var(--chart-2)" label="Active users" />
          </div>
        </Panel>

        <Panel title="Top assessment technologies">
          {overview.top_technologies.length ? (
            <ul className="space-y-2 text-sm">
              {overview.top_technologies.map((t) => (
                <li key={t.technology} className="flex justify-between gap-2">
                  <span className="truncate">{t.technology}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {t.attempts} · avg {t.avg_score}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No assessments yet.</p>
          )}
        </Panel>
      </div>

      {/* User table */}
      <Panel title={`Users (${users.length})`} className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, education"
              className="pl-9 bg-surface/50 border-border/60"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-md border border-border/60 bg-surface/50 px-3 text-sm"
          >
            <option value="joined_at">Newest first</option>
            <option value="last_active_at">Recently active</option>
            <option value="assessments">Most assessments</option>
            <option value="interviews">Most interviews</option>
            <option value="dsa_levels_completed">Most DSA progress</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-2 pr-2 font-medium" />
                <th className="py-2 pr-4 font-medium">User</th>
                <th className="py-2 pr-4 font-medium">Joined</th>
                <th className="py-2 pr-4 font-medium">Last active</th>
                <th className="py-2 pr-4 text-right font-medium">Assessments</th>
                <th className="py-2 pr-4 text-right font-medium">Interviews</th>
                <th className="py-2 pr-4 text-right font-medium">DSA levels</th>
                <th className="py-2 pr-4 text-right font-medium">Solved</th>
                <th className="py-2 pr-4 text-right font-medium">Best ATS</th>
                <th className="py-2 font-medium">Resume</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <Fragment key={u.user_id}>
                  <tr
                    className="cursor-pointer border-t border-border/50 hover:bg-surface/40"
                    onClick={() => void toggleDetail(u.user_id)}
                  >
                    <td className="py-2.5 pr-2 text-muted-foreground">
                      {openId === u.user_id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="font-medium">
                        {u.full_name || "—"}
                        {u.is_admin && <Badge>admin</Badge>}
                        {!u.email_verified && <Badge muted>unverified</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                      {u.education && (
                        <div className="text-xs text-muted-foreground">{u.education}</div>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums">{fmt(u.joined_at)}</td>
                    <td className="py-2.5 pr-4 tabular-nums">
                      {fmt(u.last_active_at ?? u.last_sign_in_at)}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {u.assessments}
                      {u.avg_assessment_score !== null && (
                        <span className="text-muted-foreground"> · {u.avg_assessment_score}%</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {u.interviews}
                      {u.avg_interview_score !== null && (
                        <span className="text-muted-foreground"> · {u.avg_interview_score}%</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {u.dsa_levels_completed}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{u.problems_solved}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {u.best_ats_score ?? "—"}
                    </td>
                    <td className="py-2.5">{u.has_resume ? "Yes" : "No"}</td>
                  </tr>
                  {openId === u.user_id && (
                    <tr className="bg-surface/30">
                      <td />
                      <td colSpan={9} className="py-4 pr-4">
                        {details[u.user_id] ? (
                          <UserDetail d={details[u.user_id]} />
                        ) : (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {!visible.length && (
            <p className="py-6 text-center text-sm text-muted-foreground">No users match.</p>
          )}
        </div>
      </Panel>
    </main>
  );
}

function UserDetail({ d }: { d: Detail }) {
  const cols: { title: string; rows: string[] }[] = [
    {
      title: "Assessments",
      rows: d.assessments.map(
        (a) => `${a.technology} (${a.difficulty}) · ${a.score}% · ${fmt(a.at)}`,
      ),
    },
    {
      title: "Interviews",
      rows: d.interviews.map((i) => `${i.type} (${i.difficulty}) · ${i.score}% · ${fmt(i.at)}`),
    },
    {
      title: "DSA levels",
      rows: d.dsa_levels.map(
        (l) =>
          `${l.topic_id} / ${l.level_id} · quiz ${l.quiz_score}%${l.completed ? " · done" : ""}`,
      ),
    },
    {
      title: "Resume reviews",
      rows: d.resume_reviews.map(
        (r) => `${r.file_name ?? "resume"} · ATS ${r.score} · ${fmt(r.at)}`,
      ),
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cols.map((c) => (
        <div key={c.title}>
          <p className="text-xs font-semibold text-muted-foreground">{c.title}</p>
          {c.rows.length ? (
            <ul className="mt-1.5 space-y-1 text-xs">
              {c.rows.slice(0, 8).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">None</p>
          )}
        </div>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-2xl glass p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Panel({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-2xl glass p-5 md:p-6 ${className}`}>
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Badge({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <span
      className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        muted ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary"
      }`}
    >
      {children}
    </span>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

// Separate login for /admin. It signs in through Supabase like the main site;
// access is granted only if the account has the admin role in user_roles.
function AdminLogin({ signedInAs }: { signedInAs: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.code === "invalid_credentials" ? "Wrong email or password." : err.message);
      setBusy(false);
      return;
    }
    const { data: admin } = await supabase.rpc("is_admin");
    if (admin !== true) {
      // Don't leave a non-admin signed in from the admin screen.
      await supabase.auth.signOut();
      setError("This account doesn't have admin access.");
    }
    setBusy(false);
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-sm items-center px-4 py-16">
      <div className="w-full rounded-2xl glass p-6 sm:p-8">
        <ShieldAlert className="h-8 w-8 text-primary" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Admin login</h1>

        {signedInAs ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              You're signed in as <strong className="text-foreground">{signedInAs}</strong>, which
              isn't an admin account.
            </p>
            <button
              onClick={() => void supabase.auth.signOut()}
              className="mt-6 w-full rounded-xl py-2.5 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-gold)" }}
            >
              Sign out and use an admin account
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-xs font-medium text-muted-foreground">
                Admin email
              </label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface/50 border-border/60"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-surface/50 border-border/60"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
              style={{ background: "var(--gradient-gold)" }}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Log in to admin
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
