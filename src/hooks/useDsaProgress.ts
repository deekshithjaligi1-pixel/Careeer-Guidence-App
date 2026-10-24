import { useEffect, useState, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getAllLevels, dsaTopics } from "@/lib/dsa-curriculum";
import type { UserDsaProgress, UserLevelProgress } from "@/lib/dsa-progress.server";

// Guests keep progress in this browser. Signed-in users keep it in the
// dsa_level_progress table; guest progress is uploaded on sign-in and then
// cleared locally so it can't leak into another account on a shared browser.
const STORAGE_KEY = "nexora_dsa_progress_v1";

const levelKey = (topicId: string, levelId: string) => `${topicId}_${levelId}`;

function buildProgress(
  completedLevels: Record<string, UserLevelProgress>,
  pointer?: { topicId: string; levelId: string },
): UserDsaProgress {
  const all = getAllLevels();
  const totalLevels = all.length;
  const totalCompleted = Object.values(completedLevels).filter((l) => l.completed).length;
  // Default pointer: first level not yet completed.
  const next =
    all.find((l) => !completedLevels[levelKey(l.topicId, l.level.id)]?.completed) ??
    all[all.length - 1];
  return {
    completedLevels,
    currentTopicId: pointer?.topicId ?? next?.topicId ?? "programming-foundations",
    currentLevelId: pointer?.levelId ?? next?.level.id ?? "foundations-1",
    totalCompleted,
    totalLevels,
    percentComplete: totalLevels > 0 ? Math.round((totalCompleted / totalLevels) * 100) : 0,
  };
}

function readLocal(): UserDsaProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return buildProgress(parsed.completedLevels || {}, {
      topicId: parsed.currentTopicId,
      levelId: parsed.currentLevelId,
    });
  } catch (e) {
    console.error("Failed to parse stored DSA progress", e);
    return null;
  }
}

function writeLocal(progress: UserDsaProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage unavailable: progress still lives in memory for this session.
  }
}

function toRow(userId: string, l: UserLevelProgress) {
  return {
    user_id: userId,
    topic_id: l.topicId,
    level_id: l.levelId,
    quiz_completed: l.quizCompleted,
    quiz_score: l.quizScore,
    quiz_passed: l.quizPassed,
    coding_completed: l.codingCompleted,
    completed: l.completed,
    completed_at: l.completedAt ?? null,
    last_code: l.lastCodeSnippet ?? null,
  };
}

async function loadRemote(user: User): Promise<UserDsaProgress> {
  const { data, error } = await supabase
    .from("dsa_level_progress")
    .select("*")
    .eq("user_id", user.id);
  if (error) throw error;

  const completedLevels: Record<string, UserLevelProgress> = {};
  for (const r of data ?? []) {
    completedLevels[levelKey(r.topic_id, r.level_id)] = {
      topicId: r.topic_id,
      levelId: r.level_id,
      quizCompleted: r.quiz_completed,
      quizScore: Number(r.quiz_score),
      quizPassed: r.quiz_passed,
      codingCompleted: r.coding_completed,
      completed: r.completed,
      completedAt: r.completed_at ?? undefined,
      lastCodeSnippet: r.last_code ?? undefined,
    };
  }

  // Upload guest progress for levels the account doesn't have yet.
  const local = readLocal();
  if (local) {
    const toUpload = Object.entries(local.completedLevels).filter(([k]) => !completedLevels[k]);
    if (toUpload.length > 0) {
      const { error: upErr } = await supabase.from("dsa_level_progress").upsert(
        toUpload.map(([, l]) => toRow(user.id, l)),
        { onConflict: "user_id,topic_id,level_id" },
      );
      if (upErr) throw upErr;
      for (const [k, l] of toUpload) completedLevels[k] = l;
    }
    localStorage.removeItem(STORAGE_KEY);
  }

  return buildProgress(completedLevels);
}

export function useDsaProgress() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserDsaProgress>(() => readLocal() ?? buildProgress({}));
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function sync(nextUser: User | null) {
      if (userRef.current?.id === nextUser?.id && userRef.current !== null) return;
      userRef.current = nextUser;
      if (isMounted) setUser(nextUser);
      try {
        const next = nextUser ? await loadRemote(nextUser) : (readLocal() ?? buildProgress({}));
        if (isMounted) setProgress(next);
      } catch (err) {
        console.error("Failed to load DSA progress", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data }) => sync(data.session?.user ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      if (!nextUser && userRef.current) {
        // Signed out: drop the account's progress from memory.
        userRef.current = null;
        setUser(null);
        setProgress(buildProgress({}));
        return;
      }
      // Defer: supabase calls inside this callback can deadlock the client.
      setTimeout(() => void sync(nextUser), 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const persistLevel = useCallback(async (updated: UserDsaProgress, level: UserLevelProgress) => {
    setProgress(updated);
    const current = userRef.current;
    if (!current) {
      writeLocal(updated);
      return;
    }
    const { error } = await supabase
      .from("dsa_level_progress")
      .upsert(toRow(current.id, level), { onConflict: "user_id,topic_id,level_id" });
    if (error) console.warn("Could not save DSA progress", error);
  }, []);

  const applyLevelUpdate = useCallback(
    (
      topicId: string,
      levelId: string,
      patch: (existing: UserLevelProgress) => UserLevelProgress,
    ) => {
      const key = levelKey(topicId, levelId);
      const existing = progress.completedLevels[key] || {
        topicId,
        levelId,
        quizCompleted: false,
        quizScore: 0,
        quizPassed: false,
        codingCompleted: false,
        completed: false,
      };
      const updatedLevel = patch(existing);
      const updatedCompletedLevels = { ...progress.completedLevels, [key]: updatedLevel };

      // Advance the pointer to the next level when this one is finished.
      let pointer = { topicId: progress.currentTopicId, levelId: progress.currentLevelId };
      if (updatedLevel.completed) {
        const all = getAllLevels();
        const idx = all.findIndex((l) => l.topicId === topicId && l.level.id === levelId);
        if (idx !== -1 && idx + 1 < all.length) {
          pointer = { topicId: all[idx + 1].topicId, levelId: all[idx + 1].level.id };
        }
      }

      void persistLevel(buildProgress(updatedCompletedLevels, pointer), updatedLevel);
      return updatedLevel;
    },
    [progress, persistLevel],
  );

  const markQuizCompleted = useCallback(
    (topicId: string, levelId: string, score: number, passed: boolean) => {
      const levelObj = getAllLevels().find((l) => l.topicId === topicId && l.level.id === levelId);
      const requiresCoding = levelObj?.level.requiresCoding ?? false;

      const current = userRef.current;
      if (current) {
        void supabase
          .from("dsa_quiz_attempts")
          .insert({ user_id: current.id, topic_id: topicId, level_id: levelId, score, passed })
          .then(({ error }) => error && console.warn("Could not record quiz attempt", error));
      }

      return applyLevelUpdate(topicId, levelId, (existing) => {
        // Completed if quiz passed AND (no coding required OR coding already completed)
        const done = passed && (!requiresCoding || existing.codingCompleted);
        return {
          ...existing,
          quizCompleted: true,
          quizScore: score,
          quizPassed: passed,
          completed: done,
          completedAt: done ? new Date().toISOString() : existing.completedAt,
        };
      });
    },
    [applyLevelUpdate],
  );

  const markCodingCompleted = useCallback(
    (topicId: string, levelId: string, lastCodeSnippet?: string) =>
      applyLevelUpdate(topicId, levelId, (existing) => {
        // Fully completed if quiz is already passed AND coding is submitted
        const done = existing.quizPassed;
        return {
          ...existing,
          codingCompleted: true,
          completed: done,
          completedAt: done ? new Date().toISOString() : existing.completedAt,
          lastCodeSnippet,
        };
      }),
    [applyLevelUpdate],
  );

  const getTopicProgress = useCallback(
    (topicId: string) => {
      const topic = dsaTopics.find((t) => t.id === topicId);
      const total = topic?.levels.length ?? 0;
      const completed =
        topic?.levels.filter(
          (lvl) => progress.completedLevels[levelKey(topicId, lvl.id)]?.completed,
        ).length ?? 0;

      return {
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        isCompleted: total > 0 && completed === total,
      };
    },
    [progress.completedLevels],
  );

  return {
    user,
    loading,
    progress,
    getTopicProgress,
    markQuizCompleted,
    markCodingCompleted,
  };
}
