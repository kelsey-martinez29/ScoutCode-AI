import type { ReactNode } from "react";
import { Brand, Disclaimer } from "./Brand";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[1fr_1.2fr]">
      <aside className="bg-hero flex flex-col justify-between p-10 text-primary-foreground">
        <Brand />
        <div>
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="mt-3 text-lg opacity-90">{subtitle}</p>
        </div>
        <p className="text-sm opacity-75">No public sign-up. Accounts are created by the Troop 99 counselor.</p>
      </aside>
      <main className="flex flex-col items-center justify-center gap-8 p-10">
        <div className="card-paper w-full max-w-md p-8">{children}</div>
        <div className="max-w-md"><Disclaimer /></div>
      </main>
    </div>
  );
}