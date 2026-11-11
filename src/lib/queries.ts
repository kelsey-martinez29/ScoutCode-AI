import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const meQuery = queryOptions({
  queryKey: ["me"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Not signed in");
    const { data } = await supabase.from("scouts").select("*").eq("id", u.user.id).maybeSingle();
    return { userId: u.user.id, scout: data };
  },
});

export const scoutWorkQuery = (scoutId: string) =>
  queryOptions({
    queryKey: ["work", scoutId],
    queryFn: async () => {
      const [r, s, p, d] = await Promise.all([
        supabase.from("responses").select("*").eq("scout_id", scoutId),
        supabase.from("signoffs").select("*").eq("scout_id", scoutId),
        supabase.from("lesson_progress").select("*").eq("scout_id", scoutId),
        supabase.from("code_drafts").select("*").eq("scout_id", scoutId),
      ]);
      for (const x of [r, s, p, d]) if (x.error) throw x.error;
      return { responses: r.data!, signoffs: s.data!, progress: p.data!, drafts: d.data! };
    },
  });

export const rosterQuery = queryOptions({
  queryKey: ["roster"],
  queryFn: async () => {
    const [sc, r, so] = await Promise.all([
      supabase.from("scouts").select("*").order("created_at"),
      supabase.from("responses").select("scout_id, question_id, status, answer, updated_at"),
      supabase.from("signoffs").select("scout_id, requirement"),
    ]);
    for (const x of [sc, r, so]) if (x.error) throw x.error;
    return { scouts: sc.data!, responses: r.data!, signoffs: so.data! };
  },
});