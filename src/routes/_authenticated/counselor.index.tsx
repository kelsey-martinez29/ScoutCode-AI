import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/AppHeader";
import { MODULES, ALL_QUESTIONS, STATUS_LABEL, moduleStatus } from "@/lib/curriculum/modules";
import { rosterQuery } from "@/lib/queries";
import { createDemoRoster, createScout, resetScoutCode, setScoutActive } from "@/lib/roster.functions";

export const Route = createFileRoute("/_authenticated/counselor/")({ component: Roster });

type Cred = { accountId: string; code: string; name: string };

function Roster() {
  const q = useQuery(rosterQuery);
  const qc = useQueryClient();
  const create = useServerFn(createScout), demo = useServerFn(createDemoRoster), reset = useServerFn(resetScoutCode), active = useServerFn(setScoutActive);
  const [creds, setCreds] = useState<Cred[]>([]);
  const [fn, setFn] = useState(""); const [li, setLi] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["roster"] });
  const run = async (p: Promise<{ ok: boolean; error?: string; credentials?: Cred[] }>) => {
    try { const r = await p; if (!r.ok) toast.error(r.error ?? "Failed"); else if (r.credentials) setCreds(r.credentials); refresh(); }
    catch { toast.error("Action failed"); }
  };
  function exportCsv() {
    const d = q.data!; const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const rows = [["scout", "account_id", "question", "status", "answer"].join(",")];
    for (const r of d.responses) { const s = d.scouts.find((x) => x.id === r.scout_id); rows.push([esc(`${s?.first_name} ${s?.last_initial}.`), s?.account_id ?? "", r.question_id, r.status, esc(r.answer)].join(",")); }
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" })); a.download = "troop99-programming-answers.csv"; a.click();
  }
  if (!q.data) return <p className="p-10">Loading roster…</p>;
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-8 py-10">
      <div className="flex items-end justify-between"><h1 className="text-4xl font-bold">Roster ({q.data.scouts.length}/8)</h1>
        <div className="flex gap-3"><Button size="lg" variant="outline" onClick={exportCsv}>Export answers (CSV)</Button>
          <Button size="lg" variant="forest" onClick={() => run(demo())}>Add FICTIONAL demo Scouts</Button></div></div>
      {creds.length > 0 && (
        <div className="card-paper border-amber p-6">
          <p className="mb-3 font-bold">New access codes — shown ONCE. Print or copy now; they are stored only as secure hashes.</p>
          <ul className="grid grid-cols-2 gap-2 font-mono">{creds.map((c) => <li key={c.accountId}>{c.name}: {c.accountId} / {c.code}</li>)}</ul>
          <Button className="mt-4" size="sm" onClick={() => setCreds([])}>I've saved these — hide</Button>
        </div>
      )}
      <form className="card-paper flex items-end gap-3 p-5" onSubmit={(e) => { e.preventDefault(); run(create({ data: { firstName: fn, lastInitial: li, isDemo: false } })); setFn(""); setLi(""); }}>
        <div><label className="text-sm">First name</label><Input value={fn} onChange={(e) => setFn(e.target.value)} required /></div>
        <div className="w-24"><label className="text-sm">Last initial</label><Input value={li} maxLength={1} onChange={(e) => setLi(e.target.value)} required /></div>
        <Button type="submit" size="lg">Create Scout account</Button>
        <p className="text-xs text-muted-foreground">Don't add real Scouts until security is validated (see README).</p>
      </form>
      <table className="card-paper w-full text-left">
        <thead><tr className="border-b">{["Scout", "Account", ...MODULES.map((m) => `M${m.number}`), "Answered", ""].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
        <tbody>{q.data.scouts.map((s) => {
          const rs = q.data!.responses.filter((r) => r.scout_id === s.id) as never[];
          const so = new Set(q.data!.signoffs.filter((x) => x.scout_id === s.id).map((x) => x.requirement));
          return (<tr key={s.id} className="border-b">
            <td className="p-3 font-bold">{s.first_name} {s.last_initial}. {s.is_demo && <span className="text-xs text-amber-foreground">FICTIONAL</span>}{!s.active && " (disabled)"}</td>
            <td className="p-3 font-mono text-sm">{s.account_id}</td>
            {MODULES.map((m) => { const st = moduleStatus(m, rs, so); return <td key={m.id} className="p-2"><StatusPill status={st} label={STATUS_LABEL[st]} /></td>; })}
            <td className="p-3">{(rs as { answer: string }[]).filter((r) => r.answer.trim()).length}/{ALL_QUESTIONS.length}</td>
            <td className="flex gap-2 p-3">
              <Button asChild size="sm"><Link to="/counselor/scout/$scoutId" params={{ scoutId: s.id }}>Review</Link></Button>
              <Button size="sm" variant="outline" onClick={() => confirm("Issue a new access code? The old one stops working.") && run(reset({ data: { scoutId: s.id } }))}>Reset code</Button>
              <Button size="sm" variant="ghost" onClick={() => run(active({ data: { scoutId: s.id, active: !s.active } }))}>{s.active ? "Disable" : "Enable"}</Button>
            </td></tr>);
        })}</tbody>
      </table>
    </main>
  );
}

