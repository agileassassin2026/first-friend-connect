// Profile sync between local User shape and the Lovable Cloud `profiles` table.
// Discovery (cross-user reads) goes through SECURITY DEFINER RPCs that only
// expose safe public columns. Self-reads of the base table return all fields
// for the owner (RLS: auth.uid() = user_id).
import { supabase } from "@/integrations/supabase/client";
import type { User, Role } from "./auth";

type PublicRow = {
  user_id: string;
  name: string;
  role: string;
  original_role: string | null;
  campus: string;
  program: string;
  languages: string[] | null;
  expertise: string[] | null;
  interests: string[] | null;
  buddy_style: string[] | null;
  mentoring_style: string[] | null;
  availability: string[] | null;
  bio: string | null;
  avatar: string | null;
  onboarded: boolean;
  account_created_at: string;
};

export function rowToUser(row: PublicRow, opts?: { email?: string }): User {
  return {
    id: row.user_id,
    name: row.name,
    email: opts?.email ?? "",
    role: (row.role as Role) ?? "new-student",
    originalRole: (row.original_role as Role | null) ?? undefined,
    createdAt: row.account_created_at,
    campus: row.campus,
    program: row.program,
    languages: row.languages ?? [],
    expertise: row.expertise ?? [],
    interests: row.interests ?? [],
    buddyStyle: row.buddy_style ?? [],
    mentoringStyle: row.mentoring_style ?? [],
    availability: row.availability ?? [],
    bio: row.bio ?? undefined,
    avatar: row.avatar ?? undefined,
    onboarded: row.onboarded,
  };
}

function userToRow(u: User) {
  return {
    id: u.id,
    user_id: u.id,
    email: u.email,
    name: u.name ?? "",
    role: u.role,
    original_role: u.originalRole ?? u.role,
    campus: u.campus ?? "",
    program: u.program ?? "",
    languages: u.languages ?? [],
    support_needs: u.supportNeeds ?? [],
    expertise: u.expertise ?? [],
    emotional_state: u.emotionalState ?? null,
    interests: u.interests ?? [],
    buddy_style: u.buddyStyle ?? [],
    mentoring_style: u.mentoringStyle ?? [],
    availability: u.availability ?? [],
    capacity: u.capacity ?? null,
    bio: u.bio ?? null,
    avatar: u.avatar ?? null,
    onboarded: u.onboarded ?? false,
    account_created_at: u.createdAt ?? new Date().toISOString(),
  };
}

export async function upsertProfile(u: User): Promise<boolean> {
  if (!u.id) return false;
  const { error } = await supabase
    .from("profiles")
    .upsert(userToRow(u), { onConflict: "user_id" });
  if (error) {
    console.error("[profiles] upsert failed:", error.message, error);
    return false;
  }
  console.log("[profiles] upserted", u.id, u.role);
  return true;
}

// Fetch own full profile (base table, RLS-scoped to owner).
export async function fetchProfile(userId: string): Promise<User | null> {
  // Try base table first (works for the owner — returns email, etc.)
  const { data: own } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (own) {
    return rowToUser(own as unknown as PublicRow, { email: (own as { email?: string }).email ?? "" });
  }
  // Fallback: someone else's profile via discovery RPC (safe columns only).
  const { data, error } = await supabase.rpc("get_public_profile", { _user_id: userId });
  if (error) {
    console.error("[profiles] get_public_profile failed:", error.message);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return rowToUser(row as PublicRow);
}

export async function fetchAllProfiles(): Promise<User[]> {
  const { data, error } = await supabase.rpc("list_public_profiles");
  if (error) {
    console.error("[profiles] list_public_profiles failed:", error.message);
    return [];
  }
  console.log("[profiles] discovered", (data ?? []).length, "profiles");
  return (data ?? []).map((r) => rowToUser(r as PublicRow));
}
