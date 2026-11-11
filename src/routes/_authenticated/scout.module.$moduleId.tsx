import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Lightbulb, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { getModule, type Module, type Question } from "@/lib/curriculum/modules";
import { meQuery, scoutWorkQuery } from "@/lib/queries";
import { SaveLabel, useAutosave } from "@/hooks/use-autosave";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/scout/module/$moduleId")({
  loader: ({ params }) => {
    const m = getModule(params.moduleId);
    if (!m) throw notFound();
    return { title: m.title };
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.title ?? "Lesson"} — ScoutCode AI` }, { name: "description", content: "Lesson and workbook questions." }] }),
  component: ModulePage,
});

const STATUS_TEXT = { draft: "Draft", submitted: "Sent for review", returned: "Needs revision", approved: "Approved" } as const;

function ModulePage() {
  const { moduleId } = Route.useParams();
  const mod = getModule(moduleId)!;
  const me = useQuery(meQuery);
  const sid = me.data?.userId;
  const work = useQuery({ ...scoutWorkQuery(sid ?? ""), enabled: !!sid });
  const qc = useQueryClient();
  const total = mod.lesson.length + mod.questions.length + 1;
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    if (step === null && work.data) {
      const p = work.data.progress.find((x) => x.module_id === moduleId);
      setStep(Math.min(p?.step ?? 0, total - 1));
    }
  }, [work.data, step, moduleId, total]);

  async function go(n: number) {
    setStep(n);
    window.scrollTo({ top: 0 });
    const { error } = await supabase.from("lesson_progress").upsert({ scout_id: sid!, module_id: moduleId, step: n, updated_at: new Date().toISOString() });
    if (error) toast.error("Couldn't save your place in the lesson.");
  }

  if (!work.data || step === null || !sid) return <p className="p-10">Loading lesson…</p>;
  const isLesson = step < mod.lesson.length;
  const qIndex = step - mod.lesson.length;
  const isQuestion = !isLesson && qIndex < mod.questions.length;

  return (
    <main className="mx-auto max-w-4xl px-8 py-10">
      <Link to="/scout" className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> All modules</Link>
      <div className="mb-6">
        <p className="font-display font-bold text-forest">Module {mod.number} · Requirement {mod.reqs.join(", ")}</p>
        <h1 className="text-4xl font-bold">{mod.title}</h1>
        <div className="mt-5 flex items-center gap-4">
          <Progress value={((step + 1) / total) * 100} className="h-3 flex-1" />
          <span className="text-sm font-semibold">{isLesson ? `Lesson ${step + 1} of ${mod.lesson.length}` : isQuestion ? `Question ${qIndex + 1} of ${mod.questions.length}` : "Review"}</span>
        </div>
      </div>

      {isLesson && <LessonView card={mod.lesson[step]!} />}
      {isQuestion && (
        <QuestionView
          key={mod.questions[qIndex]!.id}
          q={mod.questions[qIndex]!}
          scoutId={sid}
          existing={work.data.responses.find((r) => r.question_id === mod.questions[qIndex]!.id)}
          onSaved={() => qc.invalidateQueries({ queryKey: ["work", sid] })}
        />
      )}
      {!isLesson && !isQuestion && <ReviewView mod={mod} responses={work.data.responses} signoffs={work.data.signoffs} scoutId={sid} onJump={(i) => go(mod.lesson.length + i)} />}

      <div className="mt-8 flex items-center justify-between">
        <Button variant="outline" size="xl" disabled={step === 0} onClick={() => go(step - 1)}><ArrowLeft /> Back</Button>
        {step < total - 1 && (
          <Button size="xl" onClick={() => go(step + 1)}>
            {step === mod.lesson.length - 1 ? "Start questions" : "Next"} <ArrowRight />
          </Button>
        )}
      </div>
    </main>
  );
}

function LessonView({ card }: { card: Module["lesson"][number] }) {
  return (
    <section className="card-paper p-10">
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Learn</p>
      <h2 className="mb-5 text-3xl font-bold">{card.title}</h2>
      <div className="space-y-4 text-lg">{card.body.map((p, i) => <p key={i}>{p}</p>)}</div>
      {card.tip && (
        <div className="mt-8 flex gap-3 rounded-xl bg-forest-soft p-5 text-accent-foreground">
          <Lightbulb className="mt-1 size-5 shrink-0" aria-hidden />
          <p>{card.tip}</p>
        </div>
      )}
    </section>
  );
}

function QuestionView({ q, scoutId, existing, onSaved }: { q: Question; scoutId: string; existing?: Tables<"responses"> | undefined; onSaved: () => void }) {
  const [answer, setAnswer] = useState(existing?.answer ?? "");
  const [status, setStatus] = useState(existing?.status ?? "draft");
  const locked = status === "approved";
  const save = async (v: string) => {
    const { error } = await supabase.from("responses").upsert(
      { scout_id: scoutId, question_id: q.id, answer: v, status: "draft" },
      { onConflict: "scout_id,question_id" },
    );
    if (error) throw error;
    setStatus("draft");
    onSaved();
  };
  const { state, flush } = useAutosave(answer, save, { enabled: !locked });

  async function submit() {
    try {
      await flush();
      const { error } = await supabase.from("responses").upsert(
        { scout_id: scoutId, question_id: q.id, answer, status: "submitted" },
        { onConflict: "scout_id,question_id" },
      );
      if (error) throw error;
      setStatus("submitted");
      onSaved();
      toast.success("Sent to your counselor for review.");
    } catch {
      toast.error("Couldn't send. Your answer is still here — try again.");
    }
  }

  return (
    <section className="card-paper p-10">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Workbook question · {q.req}</p>
        <StatusPill status={status} label={STATUS_TEXT[status]} />
      </div>
      <label htmlFor="ans" className="mb-2 block font-display text-2xl font-bold">{q.prompt}</label>
      {q.help && <p className="mb-4 text-muted-foreground">{q.help}</p>}
      {status === "returned" && existing?.counselor_note && (
        <div className="mb-4 rounded-xl bg-amber-soft p-4 text-amber-foreground"><strong>Counselor note:</strong> {existing.counselor_note}</div>
      )}
      {locked && existing?.counselor_note && <div className="mb-4 rounded-xl bg-forest-soft p-4"><strong>Counselor note:</strong> {existing.counselor_note}</div>}
      <Textarea id="ans" value={answer} onChange={(e) => setAnswer(e.target.value)} rows={q.rows ?? 4} disabled={locked} maxLength={8000} className="text-lg leading-relaxed" placeholder="Type your answer in your own words…" />
      <div className="mt-4 flex items-center justify-between">
        {locked ? <span className="flex items-center gap-2 text-forest"><Lock className="size-4" /> Approved by your counselor</span> : <SaveLabel state={state} />}
        {!locked && (
          <Button variant="forest" size="lg" onClick={submit} disabled={answer.trim().length < 3 || status === "submitted"}>
            <Send /> {status === "submitted" ? "Sent for review" : "Send for review"}
          </Button>
        )}
      </div>
    </section>
  );
}

function ReviewView({ mod, responses, signoffs, onJump }: { mod: Module; responses: Tables<"responses">[]; signoffs: Tables<"signoffs">[]; scoutId: string; onJump: (i: number) => void }) {
  const signed = useMemo(() => new Set(signoffs.map((s) => s.requirement)), [signoffs]);
  return (
    <section className="card-paper space-y-6 p-10">
      <h2 className="text-3xl font-bold">Module review</h2>
      <ul className="space-y-3">
        {mod.questions.map((q, i) => {
          const r = responses.find((x) => x.question_id === q.id);
          const st = r?.answer.trim() ? r.status : null;
          return (
            <li key={q.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <button className="text-left hover:underline" onClick={() => onJump(i)}>{i + 1}. {q.prompt}</button>
              {st ? <StatusPill status={st} label={STATUS_TEXT[st]} /> : <StatusPill status="not_started" label="Not answered" />}
            </li>
          );
        })}
      </ul>
      {mod.signoffs.length > 0 && (
        <div>
          <h3 className="mb-2 text-xl font-bold">Counselor check-offs</h3>
          <p className="mb-3 text-muted-foreground">These happen in person with your counselor. Only they can check them off.</p>
          <ul className="space-y-2">
            {mod.signoffs.map((s) => (
              <li key={s.id} className="flex items-center gap-3">
                <CheckCircle2 className={signed.has(s.id) ? "size-5 text-forest" : "size-5 text-muted-foreground/40"} />
                {s.label}
              </li>
            ))}
          </ul>
        </div>
      )}
      {mod.codeLab && <Button asChild variant="forest" size="xl"><Link to="/scout/lab"><Code2 /> Open Code Lab</Link></Button>}
    </section>
  );
}

