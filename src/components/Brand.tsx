import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export function Brand({ to = "/" }: { to?: "/" | "/scout" | "/counselor" }) {
  return (
    <Link to={to} className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-lg bg-forest text-forest-foreground">
        <Compass className="size-6" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-bold">ScoutCode AI</span>
        <span className="block text-xs opacity-80">Troop 99 · Programming Merit Badge</span>
      </span>
    </Link>
  );
}

export function Disclaimer() {
  return (
    <p className="text-xs text-muted-foreground">
      An independent Troop 99 learning tool. Not an official Scouting America website or product. Lessons are
      original and map to the Programming merit badge requirements; consult the official requirements and your
      counselor.
    </p>
  );
}