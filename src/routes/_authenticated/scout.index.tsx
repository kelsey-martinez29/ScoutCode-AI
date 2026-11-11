import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/AppHeader";
import { MODULES, STATUS_LABEL, moduleStatus } from "@/lib/curriculum/modules";
import { meQuery, scoutWorkQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/scout/")({
  head: () => ({ meta: [{ title: "My modules — ScoutCode AI" }, { name: "description", content: "Pick a module and keep going." }] }),
  component: ScoutHome,
});

function ScoutHome() {
  const me = useQuery(meQuery);
  const id = me.data?.userId;
  const work = useQuery({ ...scoutWorkQuery(id ?? ""), enabled: !!id });
  if (!work.data || !me.data) return <p className="p-10">Loading your work…</p>;
  const signed = new Set(work.data.signoffs.map((s) => s.requirement));
  const answered = (mid: string) => {
    const m = MODULES.find((x) => x.id === mid)!;
    return m.questions.filter((q) => work.data!.responses.find((r) => r.question_id === q.id && r.answer.trim())).length;
  };
  const totalQ = MODULES.reduce((n, m) => n + m.questions.length, 0);
  const totalA = MODULES.reduce((n, m) => n + answered(m.id), 0);

  return (
    <main className="mx-auto max-w-7xl px-8 py-10">
      <div className="mb-8 flex items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold">Hi, {me.data.scout?.first_name}!</h1>
          <p className="mt-2 text-lg text-muted-foreground">Pick up where you left off. Everything saves automatically.</p>
        </div>
        <div className="w-80">
          <p className="mb-2 text-sm font-semibold">{totalA} of {totalQ} questions answered</p>
          <Progress value={(totalA / totalQ) * 100} className="h-3" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {MODULES.map((m) => {
          const st = moduleStatus(m, work.data!.responses, signed);
          const a = answered(m.id);
          return (
            <article key={m.id} className="card-paper flex flex-col p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-sm font-bold text-forest">Requirement {m.reqs.join(", ")}</span>
                <StatusPill status={st} label={STATUS_LABEL[st]} />
              </div>
              <h2 className="text-2xl font-bold">{m.number}. {m.title}</h2>
              <p className="mt-2 flex-1 text-muted-foreground">{m.summary}</p>
              <div className="mt-5">
                <p className="mb-1 text-sm">{a}/{m.questions.length} answered</p>
                <Progress value={(a / m.questions.length) * 100} className="h-2" />
              </div>
              <Button asChild size="lg" className="mt-5 w-full">
                <Link to="/scout/module/$moduleId" params={{ moduleId: m.id }}>
                  {a === 0 ? "Start lesson" : "Continue"} <ArrowRight />
                </Link>
              </Button>
              {m.codeLab && (
                <Button asChild variant="forest" size="lg" className="mt-3 w-full">
                  <Link to="/scout/lab"><Code2 /> Open Code Lab</Link>
                </Button>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}

