import { supabase } from "@/integrations/supabase/client";
import type { QueryClient } from "@tanstack/react-query";

export async function getMyRole(): Promise<"scout" | "counselor" | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
  if (data?.some((r) => r.role === "counselor")) return "counselor";
  if (data?.some((r) => r.role === "scout")) return "scout";
  return null;
}

export async function signOutEverywhere(qc: QueryClient) {
  await qc.cancelQueries();
  qc.clear();
  localStorage.removeItem("scoutcode.signedInAt");
  await supabase.auth.signOut();
}