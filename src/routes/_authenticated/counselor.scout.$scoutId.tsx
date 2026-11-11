import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusPill } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { MODULES } from "@/lib/curriculum/modules";
import { LABS } from "@/lib/curriculum/starters";
import { scoutWorkQuery } from "@/lib/queries";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/counselor/scout/$scoutId")({ component: Review });

function Review() {
  const { scoutId } = Route.useParams();
  const qc = useQueryClient();
  const scout = useQuery({ queryKey: ["scout", scoutId], queryFn: async () => (await supabase.from("scouts").select("*").eq("id", scoutId).single()).data });
  const work = useQuery(scoutWorkQuery(scoutId));
  const refresh = () => { qc.invalidateQueries({ queryKey: ["work", scoutId] }); qc.invalidateQueries({ queryKey: ["roster"] }); };
  if (!work.data || !scout.data) return <p className="p-10">Loading…</p>;
  const s = scout.data;
  const signed = new Map(work.data.signoffs.map((x) => [x.requirement, x]));
  async function toggle(id: string, on: boolean) {
    const r = on ? await supabase.from("signoffs").insert({ scout_id: scoutId, requirement: id }) : await supabase.from("signoffs").delete().eq("scout_id", scoutId).eq("requirement", id);
    if (r.error) toast.error("Couldn't update sign-off"); refresh();
  }
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-8 py-10">
      <div className="no-print flex items-center justify-between"><h1 className="text-4xl font-bold">{s.first_name} {s.last_initial}. {s.is_demo && "(FICTIONAL DEMO)"}</h1>
        <Button size="lg" onClick={() => window.print()}><Printer /> Print / Save as PDF report</Button></div>
      <div className="hidden print:block"><h1 className="text-2xl font-bold">Troop 99 Programming Merit Badge — Progress & Evidence Report</h1>
        <p>{s.first_name} {s.last_initial}. · {s.account_id} · Generated {new Date().toLocaleDateString()}. Independent troop tool; not an official Scouting America document. Contains only the Scout's saved answers and counselor-recorded verifications.</p></div>
      {MODULES.map((m) => (
        <section key={m.id} className="card-paper space-y-4 p-6">
          <h2 className="text-2xl font-bold">{m.number}. {m.title} <span className="text-base text-muted-foreground">({m.reqs.join(", ")})</span></h2>
          {m.questions.map((q) => <Answer key={q.id} prompt={`${q.req}: ${q.prompt}`} r={work.data!.responses.find((x) => x.question_id === q.id)} onDone={refresh} />)}
          {m.codeLab && LABS.map((l) => { const d = work.data!.drafts.find((x) => x.lab === l.id); return (
            <div key={l.id} className="rounded-lg border p-4"><p className="font-bold">{l.req} Code Lab — {l.language}</p>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 font-mono text-sm">{d?.code || "(no draft saved)"}</pre>
              <p className="mt-2"><strong>Notes:</strong> {d?.explanation || "(none)"}</p></div>); })}
          {m.signoffs.map((so) => { const x = signed.get(so.id); return (
            <label key={so.id} className="flex items-center gap-3 rounded-lg bg-forest-soft p-3">
              <Checkbox checked={!!x} onCheckedChange={(v) => toggle(so.id, !!v)} className="no-print" />
              <span>{x ? "✔" : "☐"} {so.label}{x && ` — verified by counselor ${new Date(x.signed_at).toLocaleDateString()}`}</span>
            </label>); })}
        </section>
      ))}
      <p className="hidden print:block">Counselor signature: ______________________ Date: __________ (sign by hand; this app never generates signatures)</p>
    </main>
  );
}

function Answer({ prompt, r, onDone }: { prompt: string; r?: Tables<"responses"> | undefined; onDone: () => void }) {
  const [note, setNote] = useState(r?.counselor_note ?? "");
  async function set(status: "approved" | "returned") {
    const { error } = await supabase.from("responses").update({ status, counselor_note: note || null }).eq("id", r!.id);
    if (error) toast.error("Couldn't save review"); else toast.success(status === "approved" ? "Approved" : "Returned for revision"); onDone();
  }
  return (
    <div className="rounded-lg border p-4">
      <div className="flex justify-between gap-4"><p className="font-semibold">{prompt}</p>{r && <StatusPill status={r.status} label={r.status} />}</div>
      <p className="mt-2 whitespace-pre-wrap">{r?.answer || <em className="text-muted-foreground">Not answered</em>}</p>
      {r?.answer && (<div className="no-print mt-3 flex items-end gap-2">
        <Textarea rows={2} placeholder="Note to Scout (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button variant="forest" onClick={() => set("approved")}>Approve</Button>
        <Button variant="outline" onClick={() => set("returned")}>Return</Button></div>)}
    </div>
  );
}

