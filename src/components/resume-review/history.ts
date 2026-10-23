import type { ResumeReview } from "@/lib/resume-review-types";

const KEY = "nexora.resume-reviews.v1";
const MAX = 10;

export function loadReviews(): ResumeReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ResumeReview[]) : [];
  } catch {
    return [];
  }
}

export function saveReview(review: ResumeReview): ResumeReview[] {
  const next = [review, ...loadReviews().filter((r) => r.id !== review.id)].slice(0, MAX);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or unavailable — history is a convenience only */
  }
  return next;
}

export function deleteReview(id: string): ResumeReview[] {
  const next = loadReviews().filter((r) => r.id !== id);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}
