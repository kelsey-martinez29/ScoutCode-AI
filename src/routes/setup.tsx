import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setupCounselor, setupStatus } from "@/lib/auth.functions";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "One-time setup — ScoutCode AI" },
      { name: "description", content: "Create the first counselor account for ScoutCode AI." },
      { property: "og:title", content: "Setup — ScoutCode AI" },
      { property: "og:description", content: "One-time counselor account setup." },
    ],
  }),
  component: Setup,
});

function Setup() {
  const status = useServerFn(setupStatus);
  const setup = useServerFn(setupCounselor);
  const [needs, setNeeds] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { status().then((s) => setNeeds(s.needsSetup)).catch(() => setNeeds(false)); }, [status]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) return setMsg({ ok: false, text: "Passwords don't match." });
    const r = await setup({ data: { email, password: pw } });
    if (r.ok) { setNeeds(false); setMsg({ ok: true, text: "Counselor account created. You can sign in now." }); }
    else setMsg({ ok: false, text: r.error ?? "Setup failed." });
  }

  return (
    <AuthShell title="One-time setup" subtitle="Create the first counselor account. This page locks itself once a counselor exists.">
      {needs === null ? <p>Checking…</p> : !needs ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Setup is complete</h2>
          {msg && <p className="text-forest">{msg.text}</p>}
          <Button asChild size="xl" className="w-full"><Link to="/counselor-login">Go to counselor sign in</Link></Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <h2 className="text-2xl font-bold">Create counselor account</h2>
          <div className="space-y-2"><Label htmlFor="e">Email</Label><Input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" /></div>
          <div className="space-y-2"><Label htmlFor="p">Password (12+ characters)</Label><Input id="p" type="password" minLength={12} value={pw} onChange={(e) => setPw(e.target.value)} required className="h-12" /></div>
          <div className="space-y-2"><Label htmlFor="p2">Confirm password</Label><Input id="p2" type="password" minLength={12} value={pw2} onChange={(e) => setPw2(e.target.value)} required className="h-12" /></div>
          {msg && <p role="alert" className="text-destructive">{msg.text}</p>}
          <Button type="submit" size="xl" className="w-full">Create account</Button>
        </form>
      )}
    </AuthShell>
  );
}

