import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nexora_dsa_solved_problems_v1";

// Tracks practice problems the learner has ticked off. Stored per browser.
export function useSolvedProblems() {
  const [solved, setSolved] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSolved(new Set(JSON.parse(stored) as string[]));
    } catch {
      // Storage unavailable or corrupted: start empty.
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setSolved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Ignore write failures; state still updates for this session.
      }
      return next;
    });
  }, []);

  const isSolved = useCallback((id: string) => solved.has(id), [solved]);

  return { solved, isSolved, toggle };
}
