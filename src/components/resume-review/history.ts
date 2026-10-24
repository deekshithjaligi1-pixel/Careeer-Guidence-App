import { supabase } from "@/integrations/supabase/client";
import type { ResumeReview } from "@/lib/resume-review-types";

// Guests keep their last few reviews in this browser; signed-in users keep
// them in the resume_reviews table.
const KEY = "nexora.resume-reviews.v1";
const MAX = 10;

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

function loadLocal(): ResumeReview[] {
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

function writeLocal(reviews: ResumeReview[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(reviews));
  } catch {
    /* storage full or unavailable — history is a convenience only */
  }
}

async function insertRemote(userId: string, reviews: ResumeReview[]) {
  return supabase.from("resume_reviews").insert(
    reviews.map((r) => ({
      user_id: userId,
      file_name: r.resumeFileName,
      overall_score: r.overallScore,
      review: r as never,
      created_at: r.createdAt,
    })),
  );
}

export async function loadReviews(): Promise<ResumeReview[]> {
  const userId = await currentUserId();
  if (!userId) return loadLocal();

  // Upload reviews made as a guest before this sign-in.
  const local = loadLocal();
  if (local.length > 0) {
    const { error } = await insertRemote(userId, local);
    if (!error) window.localStorage.removeItem(KEY);
  }

  const { data, error } = await supabase
    .from("resume_reviews")
    .select("id, review")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(MAX);
  if (error) {
    console.warn("Could not load resume reviews", error);
    return [];
  }
  // Use the row id so deletes target the right row.
  return (data ?? []).map((row) => ({ ...(row.review as unknown as ResumeReview), id: row.id }));
}

export async function saveReview(review: ResumeReview): Promise<ResumeReview[]> {
  const userId = await currentUserId();
  if (!userId) {
    const next = [review, ...loadLocal().filter((r) => r.id !== review.id)].slice(0, MAX);
    writeLocal(next);
    return next;
  }
  const { error } = await insertRemote(userId, [review]);
  if (error) console.warn("Could not save resume review", error);
  return loadReviews();
}

export async function deleteReview(id: string): Promise<ResumeReview[]> {
  const userId = await currentUserId();
  if (!userId) {
    const next = loadLocal().filter((r) => r.id !== id);
    writeLocal(next);
    return next;
  }
  const { error } = await supabase
    .from("resume_reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) console.warn("Could not delete resume review", error);
  return loadReviews();
}
