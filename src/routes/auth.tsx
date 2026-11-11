import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scoutLogin } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { markSignedIn } from "@/components/IdleSignOut";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Scout sign in — ScoutCode AI" },
      { name: "description", content: "Troop 99 Scouts sign in with their account ID and access code." },
      { property: "og:title", content: "Scout sign in — ScoutCode AI" },
      { property: "og:description", content: "Sign in to continue your Programming merit badge work." },
    ],
  }),
  component: ScoutAuth,
});

function ScoutAuth() {
  const login = useServerFn(scoutLogin);
  const navigate = useNavigate();
  const [accountId, setAccountId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await login({ data: { accountId, code } });
      if (!r.ok) return setError(r.error);
      await supabase.auth.setSession({ access_token: r.access_token, refresh_token: r.refresh_token });
      markSignedIn();
      setCode("");
      navigate({ to: "/scout" });
    } catch {
      setError("Something went wrong. Check what you typed and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Welcome, Scout!" subtitle="Type the account ID and access code from your card.">
      <form onSubmit={submit} className="space-y-6">
        <h2 className="text-2xl font-bold">Scout sign in</h2>
        <div className="space-y-2">
          <Label htmlFor="acct" className="text-base">Account ID</Label>
          <Input id="acct" value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="T99-XXXXXX" autoComplete="off" className="h-12 font-mono text-lg uppercase" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code" className="text-base">Access code</Label>
          <Input id="code" type="password" value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" autoComplete="off" className="h-12 font-mono text-lg uppercase" required />
        </div>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-destructive">{error}</p>}
        <Button type="submit" size="xl" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        <p className="text-sm text-muted-foreground">Lost your card? Ask your counselor for a new code. <Link to="/" className="underline">Back home</Link></p>
      </form>
    </AuthShell>
  );
}