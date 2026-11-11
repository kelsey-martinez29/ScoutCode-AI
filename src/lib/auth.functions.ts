import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { RATE_LIMIT, normalizeAccountId, normalizeCode, scoutAuthEmail } from "./codes";

type Result = { ok: true; access_token: string; refresh_token: string } | { ok: false; error: string };

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function attemptLogin(accountKey: string, email: string, password: string, role: "scout" | "counselor"): Promise<Result> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const since = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60_000).toISOString();
  const minuteAgo = new Date(Date.now() - 60_000).toISOString();
  const [{ count: acctFails }, { count: globalFails }] = await Promise.all([
    supabaseAdmin.from("login_attempts").select("id", { count: "exact", head: true }).eq("account_key", accountKey).eq("success", false).gte("created_at", since),
    supabaseAdmin.from("login_attempts").select("id", { count: "exact", head: true }).eq("success", false).gte("created_at", minuteAgo),
  ]);
  if ((acctFails ?? 0) >= RATE_LIMIT.maxFailuresPerAccount || (globalFails ?? 0) >= RATE_LIMIT.maxFailuresGlobalPerMinute) {
    return { ok: false, error: `Too many tries. Please wait ${RATE_LIMIT.windowMinutes} minutes or ask your counselor.` };
  }
  const generic = role === "scout" ? "That account ID or access code wasn't recognized." : "Sign-in failed. Check your email and password.";
  const pub = publicClient();
  const { data, error } = await pub.auth.signInWithPassword({ email, password });
  let ok = !error && !!data.session;
  if (ok) {
    const { data: r } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", data.user!.id).eq("role", role).maybeSingle();
    if (!r) ok = false;
    if (ok && role === "scout") {
      const { data: s } = await supabaseAdmin.from("scouts").select("active").eq("id", data.user!.id).maybeSingle();
      if (!s?.active) ok = false;
    }
    if (!ok) await pub.auth.signOut();
  }
  await supabaseAdmin.from("login_attempts").insert({ account_key: accountKey, success: ok });
  if (!ok || !data.session) return { ok: false, error: generic };
  return { ok: true, access_token: data.session.access_token, refresh_token: data.session.refresh_token };
}

export const scoutLogin = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accountId: z.string().min(4).max(20), code: z.string().min(8).max(40) }))
  .handler(async ({ data }) => {
    const id = normalizeAccountId(data.accountId);
    return attemptLogin(`scout:${id}`, scoutAuthEmail(id), normalizeCode(data.code), "scout");
  });

export const counselorLogin = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    return attemptLogin(`counselor:${email}`, email, data.password, "counselor");
  });

export const setupStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "counselor");
  return { needsSetup: (count ?? 0) === 0 };
});

/** One-time bootstrap: works only while no counselor account exists. */
export const setupCounselor = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email().max(200), password: z.string().min(12).max(128) }))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "counselor");
    if ((count ?? 0) > 0) return { ok: false, error: "Setup is already complete." };
    const { data: u, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      email_confirm: true,
    });
    if (error || !u.user) return { ok: false, error: error?.message ?? "Could not create account." };
    const { error: rErr } = await supabaseAdmin.from("user_roles").insert({ user_id: u.user.id, role: "counselor" });
    if (rErr) {
      await supabaseAdmin.auth.admin.deleteUser(u.user.id);
      return { ok: false, error: "Could not assign counselor role." };
    }
    return { ok: true };
  });