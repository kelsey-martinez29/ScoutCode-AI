import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateAccessCode, generateAccountId, normalizeCode, scoutAuthEmail } from "./codes";

const MAX_SCOUTS = 8;

async function assertCounselor(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "counselor" });
  if (!data) throw new Error("Forbidden");
}

const DEMO_NAMES: [string, string][] = [
  ["Avery", "Q"], ["Blake", "X"], ["Casey", "Z"], ["Devon", "Q"],
  ["Emery", "X"], ["Finley", "Z"], ["Rowan", "Q"], ["Sawyer", "X"],
];

async function createOne(firstName: string, lastInitial: string, isDemo: boolean) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const accountId = generateAccountId();
  const code = generateAccessCode();
  const { data: u, error } = await supabaseAdmin.auth.admin.createUser({
    email: scoutAuthEmail(accountId),
    password: normalizeCode(code), // stored only as a bcrypt hash by the auth service
    email_confirm: true,
    app_metadata: { scout: true },
  });
  if (error || !u.user) throw new Error("Could not create scout account");
  const id = u.user.id;
  const r1 = await supabaseAdmin.from("user_roles").insert({ user_id: id, role: "scout" });
  const r2 = await supabaseAdmin.from("scouts").insert({ id, account_id: accountId, first_name: firstName, last_initial: lastInitial, is_demo: isDemo });
  if (r1.error || r2.error) {
    await supabaseAdmin.auth.admin.deleteUser(id);
    throw new Error("Could not save scout profile");
  }
  return { id, accountId, code, name: `${firstName} ${lastInitial}.` };
}

async function rosterCount() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin.from("scouts").select("id", { count: "exact", head: true });
  return count ?? 0;
}

export const createScout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      firstName: z.string().trim().min(1).max(30).regex(/^[A-Za-z' -]+$/, "Letters only"),
      lastInitial: z.string().trim().length(1).regex(/^[A-Za-z]$/),
      isDemo: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertCounselor(context);
    if ((await rosterCount()) >= MAX_SCOUTS) return { ok: false as const, error: `Roster is limited to ${MAX_SCOUTS} accounts.` };
    const s = await createOne(data.firstName, data.lastInitial.toUpperCase(), data.isDemo);
    return { ok: true as const, credentials: [s] };
  });

export const createDemoRoster = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCounselor(context);
    const free = MAX_SCOUTS - (await rosterCount());
    if (free <= 0) return { ok: false as const, error: "Roster is already full." };
    const out = [];
    for (const [f, l] of DEMO_NAMES.slice(0, free)) out.push(await createOne(f, l, true));
    return { ok: true as const, credentials: out };
  });

export const resetScoutCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ scoutId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertCounselor(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: s } = await supabaseAdmin.from("scouts").select("account_id, first_name, last_initial").eq("id", data.scoutId).single();
    if (!s) return { ok: false as const, error: "Scout not found" };
    const code = generateAccessCode();
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.scoutId, { password: normalizeCode(code) });
    if (error) return { ok: false as const, error: "Reset failed" };
    await supabaseAdmin.from("scouts").update({ code_reset_at: new Date().toISOString() }).eq("id", data.scoutId);
    await supabaseAdmin.from("login_attempts").delete().eq("account_key", `scout:${s.account_id}`);
    return { ok: true as const, credentials: [{ id: data.scoutId, accountId: s.account_id, code, name: `${s.first_name} ${s.last_initial}.` }] };
  });

export const setScoutActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ scoutId: z.string().uuid(), active: z.boolean() }))
  .handler(async ({ data, context }) => {
    await assertCounselor(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.auth.admin.updateUserById(data.scoutId, { ban_duration: data.active ? "none" : "876000h" });
    await supabaseAdmin.from("scouts").update({ active: data.active }).eq("id", data.scoutId);
    return { ok: true };
  });

export const deleteScout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ scoutId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertCounselor(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("scouts").delete().eq("id", data.scoutId);
    await supabaseAdmin.auth.admin.deleteUser(data.scoutId);
    return { ok: true };
  });