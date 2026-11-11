import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { LABS, type LabId } from "@/lib/curriculum/starters";
import { meQuery, scoutWorkQuery } from "@/lib/queries";
import { SaveLabel, useAutosave } from "@/hooks/use-autosave";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/scout/lab")({
  head: () => ({ meta: [{ title: "Code Lab — ScoutCode AI" }, { name: "description", content: "Edit Scratch, Python and Lua starter programs." }] }),
  component: Lab,
});

function Lab() {
  const me = useQuery(meQuery);
  const sid = me.data?.userId;
  const work = useQuery({ ...scoutWorkQuery(sid ?? ""), enabled: !!sid });
  if (!work.data || !sid) return <p className="p-10">Loading Code Lab…</p>;
  return (
    <main className="mx-auto max-w-7xl px-8 py-10">
      <h1 className="text-4xl font-bold">Code Lab</h1>
      <p className="mt-2 text-lg text-muted-foreground">Requirement 5a–5c. Edit the starter, write your debugging notes, then demonstrate it to your counselor.</p>
      <Tabs defaultValue="scratch" className="mt-6">
        <TabsList className="h-14">
          {LABS.map((l) => <TabsTrigger key={l.id} value={l.id} className="h-12 px-6 text-base">{l.req} · {l.language.split(" ")[0]}</TabsTrigger>)}
        </TabsList>
        {LABS.map((l) => (
          <TabsContent key={l.id} value={l.id}>
            <LabEditor lab={l.id} scoutId={sid} draft={work.data!.drafts.find((d) => d.lab === l.id)} />
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}

function LabEditor({ lab, scoutId, draft }: { lab: LabId; scoutId: string; draft?: Tables<"code_drafts"> | undefined }) {
  const meta = LABS.find((l) => l.id === lab)!;
  const qc = useQueryClient();
  const [val, setVal] = useState({ code: draft?.code || meta.starter, explanation: draft?.explanation ?? "" });
  const { state } = useAutosave(val, async (v) => {
    const { error } = await supabase.from("code_drafts").upsert({ scout_id: scoutId, lab, code: v.code, explanation: v.explanation, updated_at: new Date().toISOString() }, { onConflict: "scout_id,lab" });
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["work", scoutId] });
  });
  return (
    <div className="grid grid-cols-[1.6fr_1fr] gap-6">
      <section className="card-paper overflow-hidden">
        <div className="flex items-center justify-between border-b bg-primary px-5 py-3 text-primary-foreground">
          <div>
            <p className="font-display font-bold">{meta.title}</p>
            <p className="text-xs opacity-80">{meta.language} · Industry: {meta.industry}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="hero" size="sm" onClick={() => { if (confirm("Replace your code with the original starter?")) setVal((v) => ({ ...v, code: meta.starter })); }}><RotateCcw /> Reset</Button>
            <Button size="sm" variant="secondary" disabled title="A safe in-browser runner is not integrated yet"><Play /> Run — coming soon</Button>
          </div>
        </div>
        <Textarea
          aria-label={`${meta.language} code editor`}
          value={val.code}
          onChange={(e) => setVal((v) => ({ ...v, code: e.target.value }))}
          spellCheck={false}
          className="min-h-[520px] rounded-none border-0 bg-card font-mono text-[15px] leading-6 focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const t = e.currentTarget, s = t.selectionStart;
              const next = val.code.slice(0, s) + "  " + val.code.slice(t.selectionEnd);
              setVal((v) => ({ ...v, code: next }));
              requestAnimationFrame(() => t.setSelectionRange(s + 2, s + 2));
            }
          }}
        />
        <div className="flex items-center justify-between border-t px-5 py-2"><SaveLabel state={state} /><span className="text-xs text-muted-foreground">Output panel: coming soon — run your program with your counselor for now.</span></div>
      </section>
      <aside className="space-y-4">
        {lab === "scratch" && (
          <div className="card-paper p-5">
            <p className="mb-3">Build this in the Scratch editor (opens in a new tab, ask your counselor first).</p>
            <Button asChild variant="forest" size="lg" className="w-full"><a href="https://scratch.mit.edu/projects/editor/" target="_blank" rel="noreferrer"><ExternalLink /> Open Scratch editor</a></Button>
          </div>
        )}
        <div className="card-paper p-5">
          <label htmlFor={`notes-${lab}`} className="mb-2 block font-display text-lg font-bold">{meta.notesPrompt}</label>
          <Textarea id={`notes-${lab}`} rows={10} value={val.explanation} onChange={(e) => setVal((v) => ({ ...v, explanation: e.target.value }))} className="text-base" maxLength={8000} />
        </div>
        <p className="rounded-xl bg-forest-soft p-4 text-sm">Your counselor checks off the demonstration in person. Saving here does not mark it complete.</p>
      </aside>
    </div>
  );
}

