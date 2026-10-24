import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "nexora_dsa_solved_problems_v1";

function readLocal(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    // Storage unavailable or corrupted: start empty.
    return [];
  }
}

// Tracks practice problems the learner has ticked off. Guests keep them in
// this browser; signed-in users keep them in dsa_solved_problems, and any
// guest ticks are uploaded on sign-in.
export function useSolvedProblems() {
  const [solved, setSolved] = useState<Set<string>>(() => new Set());
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function sync(userId: string | null) {
      userIdRef.current = userId;
      if (!userId) {
        if (isMounted) setSolved(new Set(readLocal()));
        return;
      }
      const local = readLocal();
      if (local.length > 0) {
        const { error } = await supabase.from("dsa_solved_problems").upsert(
          local.map((problem_id) => ({ user_id: userId, problem_id })),
          { onConflict: "user_id,problem_id", ignoreDuplicates: true },
        );
        if (!error) localStorage.removeItem(STORAGE_KEY);
      }
      const { data, error } = await supabase
        .from("dsa_solved_problems")
        .select("problem_id")
        .eq("user_id", userId);
      if (error) console.warn("Could not load solved problems", error);
      if (isMounted) setSolved(new Set((data ?? []).map((r) => r.problem_id)));
    }

    supabase.auth.getSession().then(({ data }) => sync(data.session?.user.id ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user.id ?? null;
      // Defer: supabase calls inside this callback can deadlock the client.
      if (id !== userIdRef.current) setTimeout(() => void sync(id), 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const toggle = useCallback((id: string) => {
    setSolved((prev) => {
      const next = new Set(prev);
      const nowSolved = !next.has(id);
      if (nowSolved) next.add(id);
      else next.delete(id);

      const userId = userIdRef.current;
      if (userId) {
        const op = nowSolved
          ? supabase.from("dsa_solved_problems").upsert({ user_id: userId, problem_id: id })
          : supabase
              .from("dsa_solved_problems")
              .delete()
              .eq("user_id", userId)
              .eq("problem_id", id);
        void op.then(({ error }) => error && console.warn("Could not save solved problem", error));
      } else {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        } catch {
          // Ignore write failures; state still updates for this session.
        }
      }
      return next;
    });
  }, []);

  const isSolved = useCallback((id: string) => solved.has(id), [solved]);

  return { solved, isSolved, toggle };
}
