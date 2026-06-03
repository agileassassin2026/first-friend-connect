// Profile sync between local User shape and the Lovable Cloud `profiles` table.
import { supabase } from "@/integrations/supabase/client";
import type { User, Role } from "./auth";

// Sensitive columns (email, emotional_state, support_needs, capacity) are
// hidden from other authenticated users via column-level grants in Postgres.
// Selects use this safe column list so they work for both self and others.
const PUBLIC_COLS =
  "id,user_id,name,role,original_role,campus,program,languages,expertise,interests,buddy_style,mentoring_style,availability,bio,avatar,onboarded,account_created_at,created_at,updated_at";

type PublicRow = {
  user_id: string;
  name: string;
  role: string;
  original_role: string | null;
  campus: string;
  program: string;
  languages: string[];
  expertise: string[];
  interests: string[];
  buddy_style: string[];
  mentoring_style: string[];
  availability: string[];
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
    user_id: u.id,
    email: u.email,
    name: u.name ?? "",
    role: u.role,
    original_role: u.originalRole ?? null,
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
    account_created_at: u.createdAt,
  };
}

export async function upsertProfile(u: User): Promise<void> {
  if (!u.id) return;
  const { error } = await supabase
    .from("profiles")
    .upsert(userToRow(u), { onConflict: "user_id" });
  if (error) console.error("profiles upsert failed:", error.message);
}

export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_COLS)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("fetchProfile failed:", error.message);
    return null;
  }
  if (!data) return null;
  // Email is sensitive and not selectable from the DB; pull it from auth.
  const { data: authData } = await supabase.auth.getUser();
  const email = authData.user?.id === userId ? authData.user?.email ?? "" : "";
  return rowToUser(data as unknown as PublicRow, { email });
}

export async function fetchAllProfiles(): Promise<User[]> {
  const { data, error } = await supabase.from("profiles").select(PUBLIC_COLS);
  if (error) {
    console.error("fetchAllProfiles failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToUser(r as unknown as PublicRow));
}
