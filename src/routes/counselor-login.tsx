import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { counselorLogin, setupStatus } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { markSignedIn } from "@/components/IdleSignOut";

export const Route = createFileRoute("/counselor-login")({
  head: () => ({
    meta: [
      { title: "Counselor sign in — ScoutCode AI" },
      { name: "description", content: "Merit badge counselor sign in for Troop 99 ScoutCode AI." },
      { property: "og:title", content: "Counselor sign in — ScoutCode AI" },
      { property: "og:description", content: "Review Scout work, sign off demonstrations and print reports." },
    ],
  }),
  component: CounselorAuth,
});

function CounselorAuth() {
  const login = useServerFn(counselorLogin);
  const status = useServerFn(setupStatus);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  useEffect(() => { status().then((s) => setNeedsSetup(s.needsSetup)).catch(() => {}); }, [status]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await login({ data: { email, password } });
      if (!r.ok) return setError(r.error);
      await supabase.auth.setSession({ access_token: r.access_token, refresh_token: r.refresh_token });
      markSignedIn();
      navigate({ to: "/counselor" });
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Counselor portal" subtitle="Review answers, sign off demonstrations and track Tuesday sessions.">
      <form onSubmit={submit} className="space-y-6">
        <h2 className="text-2xl font-bold">Counselor sign in</h2>
        {needsSetup && (
          <p className="rounded-lg bg-amber-soft px-4 py-3 text-amber-foreground">
            No counselor account exists yet. <Link to="/setup" className="font-bold underline">Run one-time setup</Link>.
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 text-lg" required autoComplete="username" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw" className="text-base">Password</Label>
          <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 text-lg" required autoComplete="current-password" />
        </div>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-destructive">{error}</p>}
        <Button type="submit" size="xl" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        <p className="text-sm text-muted-foreground"><Link to="/" className="underline">Back home</Link></p>
      </form>
    </AuthShell>
  );
}