import { supabase } from "@/integrations/supabase/client";
import type { MatchStatus } from "./auth";

export type MatchRequest = {
  id: string;
  requester_id: string;
  target_id: string;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
};

export async function createMatchRequest(
  requesterId: string,
  targetId: string,
): Promise<MatchRequest | null> {
  console.log("[match_requests] create", { requesterId, targetId, status: "pending" });
  const { data, error } = await supabase
    .from("match_requests")
    .insert({ requester_id: requesterId, target_id: targetId, status: "pending" })
    .select("*")
    .single();

  if (!error && data) {
    console.log("[match_requests] created", { id: data.id, status: data.status });
    return data as MatchRequest;
  }

  if (error?.code !== "23505") {
    console.error("[match_requests] create failed", error?.message, error);
    return null;
  }

  const { data: existing, error: existingError } = await supabase
    .from("match_requests")
    .select("*")
    .eq("status", "pending")
    .or(
      `and(requester_id.eq.${requesterId},target_id.eq.${targetId}),and(requester_id.eq.${targetId},target_id.eq.${requesterId})`,
    )
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    console.error("[match_requests] duplicate lookup failed", existingError.message, existingError);
    return null;
  }
  console.log("[match_requests] using existing pending request", existing?.id);
  return (existing as MatchRequest | null) ?? null;
}

export async function fetchMatchRequest(requestId: string): Promise<MatchRequest | null> {
  const { data, error } = await supabase
    .from("match_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();
  if (error) {
    console.error("[match_requests] fetch failed", error.message, error);
    return null;
  }
  console.log("[match_requests] fetched", { id: data?.id, status: data?.status });
  return (data as MatchRequest | null) ?? null;
}

export async function fetchLatestMatchRequest(currentUserId: string): Promise<MatchRequest | null> {
  const { data, error } = await supabase
    .from("match_requests")
    .select("*")
    .or(`requester_id.eq.${currentUserId},target_id.eq.${currentUserId}`)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[match_requests] latest fetch failed", error.message, error);
    return null;
  }
  console.log("[match_requests] latest", { id: data?.id, status: data?.status });
  return (data as MatchRequest | null) ?? null;
}

export async function updateMatchRequestStatus(
  requestId: string,
  status: Exclude<MatchStatus, "none">,
): Promise<MatchRequest | null> {
  console.log("[match_requests] update status", { requestId, status });
  const { data, error } = await supabase
    .from("match_requests")
    .update({ status })
    .eq("id", requestId)
    .select("*")
    .single();
  if (error) {
    console.error("[match_requests] update failed", error.message, error);
    return null;
  }
  return data as MatchRequest;
}
