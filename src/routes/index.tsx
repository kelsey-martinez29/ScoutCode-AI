import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Brand, Disclaimer } from "@/components/Brand";
import { BookOpen, Code2, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScoutCode AI — Troop 99 Programming Merit Badge" },
      { name: "description", content: "Troop 99 Scouts learn, practice and track the Programming merit badge in short Tuesday sessions." },
      { property: "og:title", content: "ScoutCode AI — Troop 99" },
      { property: "og:description", content: "Original lessons, guided workbook questions and a Code Lab for Troop 99's Programming merit badge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>)  : { expired?: string } => (s["expired"] ? { expired: "1" } : {}),
  component: Index,
});

function Index() {
  const { expired } = Route.useSearch();
  return (
    <div className="min-h-screen">
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-6xl px-8 py-6">
          <Brand />
        </div>
        <div className="mx-auto grid max-w-6xl gap-12 px-8 pb-20 pt-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            {expired && (
              <p className="mb-6 rounded-lg bg-primary-foreground/15 px-4 py-3">You were signed out to keep this shared laptop safe. Sign in again to keep going.</p>
            )}
            <h1 className="text-5xl font-bold leading-tight">Learn to code, one Tuesday at a time.</h1>
            <p className="mt-5 max-w-xl text-xl opacity-90">
              Short lessons, one question at a time, and a Code Lab for Scratch, Python and Lua. Your work saves as you go.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/auth">I'm a Scout — sign in</Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/counselor-login">Counselor sign in</Link>
              </Button>
            </div>
          </div>
          <ul className="grid gap-4 self-end">
            {[
              [BookOpen, "Six modules", "Matched to the merit badge requirements"],
              [Code2, "Code Lab", "Editable Scratch, Python and Lua starters"],
              [Users, "Counselor review", "Real sign-offs, never automatic"],
              [ShieldCheck, "Privacy first", "First name and last initial only"],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof BookOpen;
              return (
                <li key={t as string} className="flex items-start gap-4 rounded-xl bg-primary-foreground/10 p-4">
                  <I className="mt-1 size-6 shrink-0" aria-hidden />
                  <div>
                    <p className="font-bold">{t as string}</p>
                    <p className="text-sm opacity-85">{d as string}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <footer className="mx-auto max-w-6xl px-8 py-8">
        <Disclaimer />
      </footer>
    </div>
  );
}

