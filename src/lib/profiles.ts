// Profile sync between local User shape and the Lovable Cloud `profiles` table.
import { supabase } from "@/integrations/supabase/client";
import type { User, Role } from "./auth";

type ProfileRow = {
  user_id: string;
  email: string;
  name: string;
  role: string;
  original_role: string | null;
  campus: string;
  program: string;
  languages: string[];
  support_needs: string[];
  expertise: string[];
  emotional_state: string | null;
  interests: string[];
  buddy_style: string[];
  mentoring_style: string[];
  availability: string[];
  capacity: number | null;
  bio: string | null;
  avatar: string | null;
  onboarded: boolean;
  account_created_at: string;
};

export function rowToUser(row: ProfileRow): User {
  return {
    id: row.user_id,
    name: row.name,
    email: row.email,
    role: (row.role as Role) ?? "new-student",
    originalRole: (row.original_role as Role | null) ?? undefined,
    createdAt: row.account_created_at,
    campus: row.campus,
    program: row.program,
    languages: row.languages ?? [],
    supportNeeds: row.support_needs ?? [],
    expertise: row.expertise ?? [],
    emotionalState: row.emotional_state ?? undefined,
    interests: row.interests ?? [],
    buddyStyle: row.buddy_style ?? [],
    mentoringStyle: row.mentoring_style ?? [],
    availability: row.availability ?? [],
    capacity: row.capacity ?? undefined,
    bio: row.bio ?? undefined,
    avatar: row.avatar ?? undefined,
    onboarded: row.onboarded,
  };
}

function userToRow(u: User): Omit<ProfileRow, "account_created_at"> & { account_created_at?: string } {
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
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("fetchProfile failed:", error.message);
    return null;
  }
  return data ? rowToUser(data as ProfileRow) : null;
}

export async function fetchAllProfiles(): Promise<User[]> {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) {
    console.error("fetchAllProfiles failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToUser(r as ProfileRow));
}
