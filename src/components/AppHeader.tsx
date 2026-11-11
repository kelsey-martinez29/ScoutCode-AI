import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "./Brand";
import { signOutEverywhere } from "@/lib/session";
import type { ReactNode } from "react";

export function AppHeader({ home, who, nav }: { home: "/scout" | "/counselor"; who: string; nav?: ReactNode }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return (
    <header className="no-print bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-8 py-4">
        <Brand to={home} />
        <nav className="flex flex-1 items-center gap-1">{nav}</nav>
        <span className="text-sm opacity-90">{who}</span>
        <Button
          variant="hero"
          size="lg"
          onClick={async () => {
            await signOutEverywhere(qc);
            navigate({ to: "/", replace: true });
          }}
        >
          <LogOut /> Sign out
        </Button>
      </div>
    </header>
  );
}

export function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/scout" || to === "/counselor" }}
      className="rounded-lg px-4 py-2 font-semibold opacity-85 hover:bg-primary-foreground/10 hover:opacity-100 data-[status=active]:bg-primary-foreground/15 data-[status=active]:opacity-100"
    >
      {children}
    </Link>
  );
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  const cls =
    status === "complete" || status === "approved"
      ? "bg-forest text-forest-foreground"
      : status === "needs_revision" || status === "returned"
        ? "bg-amber-soft text-amber-foreground"
        : status === "submitted"
          ? "bg-accent text-accent-foreground"
          : status === "in_progress" || status === "draft"
            ? "bg-secondary text-secondary-foreground"
            : "bg-muted text-muted-foreground";
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${cls}`}>{label}</span>;
}

