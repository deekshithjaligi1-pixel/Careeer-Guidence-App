import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAllLevels, dsaTopics } from "@/lib/dsa-curriculum";
import type { UserDsaProgress, UserLevelProgress } from "@/lib/dsa-progress.server";

const STORAGE_KEY = "nexora_dsa_progress_v1";

export function useDsaProgress() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserDsaProgress>(() => {
    const all = getAllLevels();
    const defaultTopic = all[0]?.topicId || "programming-foundations";
    const defaultLevel = all[0]?.level.id || "foundations-1";

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const totalLevels = all.length;
          const completedCount = Object.values(parsed.completedLevels || {}).filter(
            (l: any) => l.completed
          ).length;
          return {
            ...parsed,
            totalLevels,
            totalCompleted: completedCount,
            percentComplete: totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0,
          };
        }
      } catch (e) {
        console.error("Failed to parse stored DSA progress", e);
      }
    }

    return {
      completedLevels: {},
      currentTopicId: defaultTopic,
      currentLevelId: defaultLevel,
      totalCompleted: 0,
      totalLevels: all.length,
      percentComplete: 0,
    };
  });

  // Sync with Supabase on user sign-in
  useEffect(() => {
    let isMounted = true;

    async function initUserAndSync() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUser = sessionData?.session?.user ?? null;
        if (isMounted) setUser(currentUser);

        if (currentUser) {
          // Attempt to fetch user's saved progress from profile / metadata
          const { data: profile } = await supabase
            .from("profiles")
            .select("education")
            .eq("user_id", currentUser.id)
            .maybeSingle();

          if (profile && profile.education && profile.education.startsWith("dsa_progress:")) {
            try {
              const remoteData = JSON.parse(profile.education.replace("dsa_progress:", ""));
              if (remoteData && remoteData.completedLevels) {
                const all = getAllLevels();
                const totalLevels = all.length;
                const completedCount = Object.values(remoteData.completedLevels || {}).filter(
                  (l: any) => l.completed
                ).length;
                const merged: UserDsaProgress = {
                  ...remoteData,
                  totalLevels,
                  totalCompleted: completedCount,
                  percentComplete: totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0,
                };
                if (isMounted) setProgress(merged);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              }
            } catch (err) {
              console.warn("Failed to parse remote DSA progress", err);
            }
          }
        }
      } catch (err) {
        console.error("Auth sync error", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initUserAndSync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const saveProgress = useCallback(
    async (updated: UserDsaProgress) => {
      setProgress(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }

      if (user) {
        try {
          await supabase
            .from("profiles")
            .update({
              education: `dsa_progress:${JSON.stringify(updated)}`,
            })
            .eq("user_id", user.id);
        } catch (err) {
          console.warn("Could not sync DSA progress to cloud", err);
        }
      }
    },
    [user]
  );

  const markQuizCompleted = useCallback(
    (topicId: string, levelId: string, score: number, passed: boolean) => {
      const key = `${topicId}_${levelId}`;
      const existing = progress.completedLevels[key] || {
        topicId,
        levelId,
        quizCompleted: false,
        quizScore: 0,
        quizPassed: false,
        codingCompleted: false,
        completed: false,
      };

      const all = getAllLevels();
      const currentLevelObj = all.find(
        (l) => l.topicId === topicId && l.level.id === levelId
      );
      const requiresCoding = currentLevelObj?.level.requiresCoding ?? false;

      // Completed if quiz passed AND (no coding required OR coding already completed)
      const isLevelFullyCompleted = passed && (!requiresCoding || existing.codingCompleted);

      const updatedLevel: UserLevelProgress = {
        ...existing,
        quizCompleted: true,
        quizScore: score,
        quizPassed: passed,
        completed: isLevelFullyCompleted,
        completedAt: isLevelFullyCompleted ? new Date().toISOString() : existing.completedAt,
      };

      const updatedCompletedLevels = {
        ...progress.completedLevels,
        [key]: updatedLevel,
      };

      const totalCompleted = Object.values(updatedCompletedLevels).filter((l) => l.completed).length;
      const totalLevels = all.length;
      const percentComplete = Math.round((totalCompleted / totalLevels) * 100);

      // Find next level to update current pointers
      let nextTopicId = progress.currentTopicId;
      let nextLevelId = progress.currentLevelId;

      if (isLevelFullyCompleted) {
        const currentIdx = all.findIndex(
          (l) => l.topicId === topicId && l.level.id === levelId
        );
        if (currentIdx !== -1 && currentIdx + 1 < all.length) {
          nextTopicId = all[currentIdx + 1].topicId;
          nextLevelId = all[currentIdx + 1].level.id;
        }
      }

      const newProgress: UserDsaProgress = {
        ...progress,
        completedLevels: updatedCompletedLevels,
        currentTopicId: nextTopicId,
        currentLevelId: nextLevelId,
        totalCompleted,
        totalLevels,
        percentComplete,
      };

      saveProgress(newProgress);
      return updatedLevel;
    },
    [progress, saveProgress]
  );

  const markCodingCompleted = useCallback(
    (topicId: string, levelId: string, lastCodeSnippet?: string) => {
      const key = `${topicId}_${levelId}`;
      const existing = progress.completedLevels[key] || {
        topicId,
        levelId,
        quizCompleted: false,
        quizScore: 0,
        quizPassed: false,
        codingCompleted: false,
        completed: false,
      };

      // Fully completed if quiz is already passed AND coding is submitted
      const isLevelFullyCompleted = existing.quizPassed;

      const updatedLevel: UserLevelProgress = {
        ...existing,
        codingCompleted: true,
        completed: isLevelFullyCompleted,
        completedAt: isLevelFullyCompleted ? new Date().toISOString() : existing.completedAt,
        lastCodeSnippet,
      };

      const updatedCompletedLevels = {
        ...progress.completedLevels,
        [key]: updatedLevel,
      };

      const all = getAllLevels();
      const totalCompleted = Object.values(updatedCompletedLevels).filter((l) => l.completed).length;
      const totalLevels = all.length;
      const percentComplete = Math.round((totalCompleted / totalLevels) * 100);

      let nextTopicId = progress.currentTopicId;
      let nextLevelId = progress.currentLevelId;

      if (isLevelFullyCompleted) {
        const currentIdx = all.findIndex(
          (l) => l.topicId === topicId && l.level.id === levelId
        );
        if (currentIdx !== -1 && currentIdx + 1 < all.length) {
          nextTopicId = all[currentIdx + 1].topicId;
          nextLevelId = all[currentIdx + 1].level.id;
        }
      }

      const newProgress: UserDsaProgress = {
        ...progress,
        completedLevels: updatedCompletedLevels,
        currentTopicId: nextTopicId,
        currentLevelId: nextLevelId,
        totalCompleted,
        totalLevels,
        percentComplete,
      };

      saveProgress(newProgress);
      return updatedLevel;
    },
    [progress, saveProgress]
  );

  const getTopicProgress = useCallback(
    (topicId: string) => {
      const topic = dsaTopics.find((t) => t.id === topicId);
      const total = topic?.levels.length ?? 0;
      const completed =
        topic?.levels.filter((lvl) => progress.completedLevels[`${topicId}_${lvl.id}`]?.completed)
          .length ?? 0;

      return {
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        isCompleted: total > 0 && completed === total,
      };
    },
    [progress.completedLevels]
  );

  return {
    user,
    loading,
    progress,
    getTopicProgress,
    markQuizCompleted,
    markCodingCompleted,
    saveProgress,
  };
}
